import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    if (filters) {
      if (filters.areaId) {
        qb.andWhere('a.area_id = :areaId', { areaId: filters.areaId });
      }
      if (filters.machineId) {
        qb.andWhere('a.machine_id = :machineId', { machineId: filters.machineId });
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
    }

    const total = await qb.getCount();

    const sortField =
      SORT_FIELD_MAP[sort?.field || ActivitySortField.CREATED_AT] ??
      SORT_FIELD_MAP[ActivitySortField.CREATED_AT];
    const sortOrder =
      SORT_ORDER_MAP[sort?.order || SortOrder.DESC] ?? 'DESC';
    qb.orderBy(sortField, sortOrder);

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const data = await qb.getMany();

    return { data, total };
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
