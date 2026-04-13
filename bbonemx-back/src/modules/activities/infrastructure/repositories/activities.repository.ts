import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Activity } from '../../domain/entities';
import {
  ActivityFiltersInput,
  ActivityPaginationInput,
  ActivitySortInput,
  ActivitySortField,
} from '../../application/dto/activity-filters.dto';
import { SortOrder } from '../../../work-orders/application/dto/work-order-filters.dto';

const SORT_FIELD_MAP: Record<ActivitySortField, string> = {
  [ActivitySortField.START_DATE]: 'a.startDate',
  [ActivitySortField.END_DATE]: 'a.endDate',
  [ActivitySortField.CREATED_AT]: 'a.createdAt',
};

const SORT_ORDER_MAP: Record<SortOrder, 'ASC' | 'DESC'> = {
  [SortOrder.ASC]: 'ASC',
  [SortOrder.DESC]: 'DESC',
};

@Injectable()
export class ActivitiesRepository {
  constructor(
    @InjectRepository(Activity)
    private readonly repository: Repository<Activity>,
  ) {}

  private applyFilters(
    qb: SelectQueryBuilder<Activity>,
    filters: ActivityFiltersInput,
  ): void {
    if (!filters) return;
    if (filters.areaId) {
      qb.andWhere('a.area_id = :areaId', { areaId: filters.areaId });
    }
    if (filters.machineId) {
      qb.andWhere('a.machine_id = :machineId', {
        machineId: filters.machineId,
      });
    }
    if (filters.status) {
      qb.andWhere('a.status = :status', { status: filters.status });
    }
    if (filters.priority === true) {
      qb.andWhere('a.priority = true');
    }
    if (filters.search) {
      qb.andWhere('a.activity ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }
    if (filters.technicianId) {
      qb.innerJoin(
        'a.activityTechnicians',
        'filter_at',
        'filter_at.technician_id = :technicianId AND filter_at.is_active = true',
        { technicianId: filters.technicianId },
      );
    }
  }

  private applySort(
    qb: SelectQueryBuilder<Activity>,
    sort: ActivitySortInput,
  ): void {
    const sortField =
      SORT_FIELD_MAP[sort?.field || ActivitySortField.CREATED_AT] ??
      SORT_FIELD_MAP[ActivitySortField.CREATED_AT];
    const sortOrder = SORT_ORDER_MAP[sort?.order || SortOrder.DESC] ?? 'DESC';
    qb.orderBy(sortField, sortOrder);
  }

  async findAll(): Promise<Activity[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['area', 'machine'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Activity | null> {
    return this.repository.findOne({
      where: { id, isActive: true },
      relations: ['area', 'machine'],
    });
  }

  async findWithFilters(
    filters: ActivityFiltersInput,
    pagination: ActivityPaginationInput,
    sort: ActivitySortInput,
  ): Promise<{ data: Activity[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.area', 'area')
      .leftJoinAndSelect('a.machine', 'machine')
      .where('a.is_active = true');

    this.applyFilters(qb, filters);

    const total = await qb.getCount();

    this.applySort(qb, sort);

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const data = await qb.getMany();

    return { data, total };
  }

  async findAllWithFilters(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
  ): Promise<Activity[]> {
    const qb = this.repository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.area', 'area')
      .leftJoinAndSelect('a.machine', 'machine')
      .leftJoinAndSelect('a.activityTechnicians', 'at', 'at.is_active = true')
      .leftJoinAndSelect('at.technician', 'tech')
      .where('a.is_active = true');

    this.applyFilters(qb, filters);
    this.applySort(qb, sort);

    return qb.getMany();
  }

  async countForExcelExport(filters: ActivityFiltersInput): Promise<number> {
    const qb = this.repository
      .createQueryBuilder('a')
      .where('a.is_active = true');

    this.applyFilters(qb, filters);
    return qb.getCount();
  }

  async findAllWithFiltersBatch(
    filters: ActivityFiltersInput,
    sort: ActivitySortInput,
    pagination: ActivityPaginationInput,
  ): Promise<Activity[]> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;

    const qb = this.repository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.area', 'area')
      .leftJoinAndSelect('a.machine', 'machine')
      .leftJoinAndSelect('a.activityTechnicians', 'at', 'at.is_active = true')
      .leftJoinAndSelect('at.technician', 'tech')
      .where('a.is_active = true');

    this.applyFilters(qb, filters);
    this.applySort(qb, sort);
    qb.skip((page - 1) * limit).take(limit);

    return qb.getMany();
  }

  async create(data: Partial<Activity>): Promise<Activity> {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);
    return (await this.findById(saved.id))!;
  }

  async update(id: string, data: Partial<Activity>): Promise<Activity | null> {
    const activity = await this.repository.findOne({ where: { id } });
    if (!activity) return null;
    Object.assign(activity, data);
    await this.repository.save(activity);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    const activity = await this.repository.findOne({ where: { id } });
    if (!activity) return;
    activity.isActive = false;
    activity.deletedAt = new Date();
    await this.repository.save(activity);
  }
}
