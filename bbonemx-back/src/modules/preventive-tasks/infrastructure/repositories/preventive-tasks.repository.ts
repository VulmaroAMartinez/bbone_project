import { Injectable, NotFoundException } from '@nestjs/common';
import { PreventiveTask } from '../../domain/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PreventiveTaskStatus } from 'src/common';
import {
  PreventiveTaskFiltersInput,
  PreventiveTaskSortInput,
  PreventiveTaskPaginationInput,
} from '../../application/dto/preventive-task-filters.dto';

@Injectable()
export class PreventiveTasksRepository {
  constructor(
    @InjectRepository(PreventiveTask)
    private readonly repository: Repository<PreventiveTask>,
  ) {}

  async findAll(): Promise<PreventiveTask[]> {
    return this.repository.find({
      where: { isActive: true },
      withDeleted: true,
      relations: [
        'machine',
        'machine.area',
        'machine.subArea',
        'machine.subArea.area',
        'parentTask',
      ],
      order: {
        nextExecutionDate: 'ASC',
      },
    });
  }

  async findAllWithDeleted(): Promise<PreventiveTask[]> {
    return this.repository.find({
      withDeleted: true,
      relations: [
        'machine',
        'machine.area',
        'machine.subArea',
        'machine.subArea.area',
        'parentTask',
      ],
      order: {
        nextExecutionDate: 'ASC',
      },
    });
  }

  async findAllActive(): Promise<PreventiveTask[]> {
    return this.repository.find({
      where: { isActive: true, status: PreventiveTaskStatus.ACTIVE },
      withDeleted: true,
      relations: [
        'machine',
        'machine.area',
        'machine.subArea',
        'machine.subArea.area',
      ],
      order: {
        nextExecutionDate: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<PreventiveTask | null> {
    return this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: [
        'machine',
        'machine.area',
        'machine.subArea',
        'machine.subArea.area',
        'parentTask',
      ],
    });
  }

  /** Busca tarea por ID sin filtrar por isActive (para activate). */
  async findByIdIncludeInactive(id: string): Promise<PreventiveTask | null> {
    return this.repository.findOne({
      where: { id },
      withDeleted: true,
      relations: [
        'machine',
        'machine.area',
        'machine.subArea',
        'machine.subArea.area',
        'parentTask',
      ],
    });
  }

  async findByMachineId(machineId: string): Promise<PreventiveTask[]> {
    return this.repository.find({
      where: { machineId, isActive: true },
      withDeleted: true,
      relations: [
        'machine',
        'machine.area',
        'machine.subArea',
        'machine.subArea.area',
      ],
      order: { nextExecutionDate: 'ASC' },
    });
  }

  async findDueForExecution(): Promise<PreventiveTask[]> {
    const now = new Date();

    return this.repository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.machine', 'machine')
      .leftJoinAndSelect('machine.area', 'machine_area')
      .leftJoinAndSelect('machine.subArea', 'machine_subArea')
      .leftJoinAndSelect('machine_subArea.area', 'machine_subArea_area')
      .where('pt.is_active = true')
      .andWhere('pt.status = :status', { status: PreventiveTaskStatus.ACTIVE })
      .andWhere('pt.next_execution_date IS NOT NULL')
      .andWhere(
        `pt.next_execution_date - (pt.advance_hours * INTERVAL '1 hour') <= :now`,
        { now },
      )
      .orderBy('pt.next_execution_date', 'ASC')
      .getMany();
  }

  async findWithFilters(
    filters?: PreventiveTaskFiltersInput,
    pagination?: PreventiveTaskPaginationInput,
    sort?: PreventiveTaskSortInput,
  ): Promise<{ data: PreventiveTask[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.machine', 'machine')
      .leftJoinAndSelect('machine.area', 'machine_area')
      .leftJoinAndSelect('machine.subArea', 'machine_subArea')
      .leftJoinAndSelect('machine_subArea.area', 'machine_subArea_area')
      .leftJoinAndSelect('pt.parentTask', 'parentTask')
      .where('pt.is_active = true');

    // Aplicar filtros
    if (filters) {
      if (filters.status) {
        qb.andWhere('pt.status = :status', { status: filters.status });
      }
      if (filters.frequencyType) {
        qb.andWhere('pt.frequency_type = :frequencyType', {
          frequencyType: filters.frequencyType,
        });
      }
      if (filters.machineId) {
        qb.andWhere('pt.machine_id = :machineId', {
          machineId: filters.machineId,
        });
      }
      if (filters.nextExecutionFrom) {
        qb.andWhere('pt.next_execution_date >= :nextExecutionFrom', {
          nextExecutionFrom: filters.nextExecutionFrom,
        });
      }
      if (filters.nextExecutionTo) {
        qb.andWhere('pt.next_execution_date <= :nextExecutionTo', {
          nextExecutionTo: filters.nextExecutionTo,
        });
      }
      if (filters.search) {
        qb.andWhere('pt.description ILIKE :search', {
          search: `%${filters.search}%`,
        });
      }
    }

    // Obtener total
    const total = await qb.getCount();

    // Aplicar ordenamiento
    const sortField = sort?.field || 'nextExecutionDate';
    const sortOrder = sort?.order || 'ASC';
    qb.orderBy(`pt.${sortField}`, sortOrder);

    // Aplicar paginación
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const data = await qb.getMany();

    return { data, total };
  }

  async create(data: DeepPartial<PreventiveTask>): Promise<PreventiveTask> {
    return this.repository.save(this.repository.create(data));
  }

  async update(
    id: string,
    preventiveTask: Partial<PreventiveTask>,
  ): Promise<PreventiveTask> {
    const existingPreventiveTask = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!existingPreventiveTask)
      throw new NotFoundException('Tarea preventiva no encontrada');
    Object.assign(existingPreventiveTask, preventiveTask);
    return this.repository.save(existingPreventiveTask);
  }

  async softDelete(id: string): Promise<void> {
    const existingPreventiveTask = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!existingPreventiveTask)
      throw new NotFoundException('Tarea preventiva no encontrada');
    existingPreventiveTask.isActive = false;
    existingPreventiveTask.deletedAt = new Date();
    await this.repository.save(existingPreventiveTask);
  }

  async getStatsByStatus(): Promise<{ status: string; count: number }[]> {
    return this.repository
      .createQueryBuilder('pt')
      .select('pt.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('pt.is_active = true')
      .groupBy('pt.status')
      .getRawMany();
  }

  async countActive(): Promise<number> {
    return this.repository.count({
      where: { isActive: true, status: PreventiveTaskStatus.ACTIVE },
      withDeleted: true,
    });
  }

  async findUpcomingInDays(days: number): Promise<PreventiveTask[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.repository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.machine', 'machine')
      .leftJoinAndSelect('machine.area', 'machine_area')
      .leftJoinAndSelect('machine.subArea', 'machine_subArea')
      .leftJoinAndSelect('machine_subArea.area', 'machine_subArea_area')
      .where('pt.is_active = true')
      .andWhere('pt.status = :status', { status: PreventiveTaskStatus.ACTIVE })
      .andWhere('pt.next_execution_date <= :futureDate', { futureDate })
      .orderBy('pt.next_execution_date', 'ASC')
      .getMany();
  }
}
