import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ActivitiesRepository } from '../../infrastructure/repositories/activities.repository';
import { ActivityTechniciansRepository } from '../../infrastructure/repositories/activity-technicians.repository';
import { AreasService } from 'src/modules/catalogs/areas/application/services/areas.service';
import { MachinesService } from 'src/modules/catalogs/machines/application/services/machines.service';
import { Activity } from '../../domain/entities';
import { CreateActivityInput, UpdateActivityInput } from '../dto/activity.dto';
import {
  ActivityFiltersInput,
  ActivityPaginationInput,
  ActivitySortInput,
} from '../dto/activity-filters.dto';
import { ActivityStatus } from 'src/common/enums';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly activityTechniciansRepository: ActivityTechniciansRepository,
    private readonly areasService: AreasService,
    private readonly machinesService: MachinesService,
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
}
