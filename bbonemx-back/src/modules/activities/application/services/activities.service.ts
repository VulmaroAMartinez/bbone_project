import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ActivitiesRepository } from '../../infrastructure/repositories/activities.repository';
import { ActivityTechniciansRepository } from '../../infrastructure/repositories/activity-technicians.repository';
import { AreasService } from 'src/modules/catalogs/areas/application/services/areas.service';
import { MachinesService } from 'src/modules/catalogs/machines/application/services/machines.service';
import { ExcelGeneratorService } from 'src/infrastructure/excel';
import { Activity } from '../../domain/entities';
import { CreateActivityInput, UpdateActivityInput } from '../dto/activity.dto';
import {
  ActivityFiltersInput,
  ActivityPaginationInput,
  ActivitySortInput,
} from '../dto/activity-filters.dto';
import { ACTIVITY_EXCEL_REPORT } from '../constants/activity-excel-columns';
import { ActivityStatus } from 'src/common/enums';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly activityTechniciansRepository: ActivityTechniciansRepository,
    private readonly areasService: AreasService,
    private readonly machinesService: MachinesService,
    private readonly excelGeneratorService: ExcelGeneratorService,
  ) {}

  async findAll(): Promise<Activity[]> {
    return this.activitiesRepository.findAll();
  }

  async findById(id: string): Promise<Activity | null> {
    return this.activitiesRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<Activity> {
    const activity = await this.activitiesRepository.findById(id);
    if (!activity) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }
    return activity;
  }

  async findWithFilters(
    filters: ActivityFiltersInput,
    pagination: ActivityPaginationInput,
    sort: ActivitySortInput,
  ): Promise<{ data: Activity[]; total: number }> {
    return this.activitiesRepository.findWithFilters(filters, pagination, sort);
  }

  async create(input: CreateActivityInput, userId: string): Promise<Activity> {
    await this.areasService.findByIdOrFail(input.areaId);
    await this.machinesService.findByIdOrFail(input.machineId);

    const activity = await this.activitiesRepository.create({
      areaId: input.areaId,
      machineId: input.machineId,
      activity: input.activity,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      progress: input.progress ?? 0,
      status: input.status ?? ActivityStatus.PENDING,
      comments: input.comments,
      priority: input.priority ?? false,
    });

    const technicianAssignments = input.technicianIds.map((technicianId) => ({
      activityId: activity.id,
      technicianId,
      assignedBy: userId,
      assignedAt: new Date(),
    }));
    await this.activityTechniciansRepository.saveMany(technicianAssignments);

    return (await this.activitiesRepository.findById(activity.id))!;
  }

  async update(
    id: string,
    input: UpdateActivityInput,
    userId: string,
  ): Promise<Activity> {
    const activity = await this.findByIdOrFail(id);

    if (input.areaId) {
      await this.areasService.findByIdOrFail(input.areaId);
    }
    if (input.machineId) {
      await this.machinesService.findByIdOrFail(input.machineId);
    }

    const updateData: Partial<Activity> = {};
    if (input.areaId !== undefined) updateData.areaId = input.areaId;
    if (input.machineId !== undefined) updateData.machineId = input.machineId;
    if (input.activity !== undefined) updateData.activity = input.activity;
    if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) updateData.endDate = new Date(input.endDate);
    if (input.progress !== undefined) updateData.progress = input.progress;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.comments !== undefined) updateData.comments = input.comments;
    if (input.priority !== undefined) updateData.priority = input.priority;

    await this.activitiesRepository.update(id, updateData);

    if (input.technicianIds) {
      await this.activityTechniciansRepository.deleteByActivityId(id);
      const technicianAssignments = input.technicianIds.map((technicianId) => ({
        activityId: id,
        technicianId,
        assignedBy: userId,
        assignedAt: new Date(),
      }));
      await this.activityTechniciansRepository.saveMany(technicianAssignments);
    }

    return (await this.activitiesRepository.findById(id))!;
  }

  async updatePriority(id: string, priority: boolean): Promise<Activity> {
    await this.findByIdOrFail(id);
    await this.activitiesRepository.update(id, { priority });
    return (await this.activitiesRepository.findById(id))!;
  }

  async deactivate(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.activitiesRepository.softDelete(id);
  }

  async exportToExcel(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
  ): Promise<string> {
    const data = await this.activitiesRepository.findAllWithFilters(filters, sort);
    const buffer = await this.excelGeneratorService.generateExcelBuffer(
      data,
      ACTIVITY_EXCEL_REPORT,
    );
    return buffer.toString('base64');
  }

  async countForExcelExport(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
  ): Promise<number> {
    return this.activitiesRepository.countForExcelExport(filters, sort);
  }

  async exportToExcelBuffer(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
  ): Promise<Buffer> {
    const startedAt = Date.now();
    const data = await this.activitiesRepository.findAllWithFilters(filters, sort);
    const buffer = await this.excelGeneratorService.generateExcelBuffer(data, ACTIVITY_EXCEL_REPORT);
    this.logger.log('Excel buffer generado', {
      sheetName: ACTIVITY_EXCEL_REPORT.sheetName,
      rows: data.length,
      elapsedMs: Date.now() - startedAt,
    });
    return buffer;
  }

  async streamToExcel(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
    writable: NodeJS.WritableStream,
    batchSize = 500,
  ): Promise<void> {
    const startedAt = Date.now();
    let rowsYielded = 0;
    const streamGenerator = this.createExcelRowStream(
      filters,
      sort,
      batchSize,
      () => {
        rowsYielded += 1;
      },
    );
    await this.excelGeneratorService.streamExcelToWritable(
      streamGenerator,
      ACTIVITY_EXCEL_REPORT,
      writable,
    );
    this.logger.log('Excel stream enviado', {
      sheetName: ACTIVITY_EXCEL_REPORT.sheetName,
      batchSize,
      rows: rowsYielded,
      elapsedMs: Date.now() - startedAt,
    });
  }

  async *streamActivitiesForPdf(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
    batchSize = 500,
  ): AsyncGenerator<Activity> {
    let page = 1;
    while (true) {
      const batch = await this.activitiesRepository.findAllWithFiltersBatch(
        filters,
        sort,
        { page, limit: batchSize },
      );
      if (!batch.length) return;
      for (const row of batch) {
        yield row;
      }
      page += 1;
    }
  }

  private async *createExcelRowStream(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
    batchSize: number,
    onRow?: () => void,
  ): AsyncGenerator<Activity> {
    let page = 1;
    // Repetimos hasta que la consulta por lotes regrese un batch vacío.
    // Esto evita cargar todos los datos en memoria para reportes grandes.
    while (true) {
      const batch = await this.activitiesRepository.findAllWithFiltersBatch(
        filters,
        sort,
        { page, limit: batchSize },
      );

      if (!batch.length) return;

      for (const row of batch) {
        onRow?.();
        yield row;
      }

      page += 1;
    }
  }
}
