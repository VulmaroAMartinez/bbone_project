import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityWorkOrder } from '../../domain/entities';

@Injectable()
export class ActivityWorkOrdersRepository {
  constructor(
    @InjectRepository(ActivityWorkOrder)
    private readonly repository: Repository<ActivityWorkOrder>,
  ) {}

  async findByActivityId(activityId: string): Promise<ActivityWorkOrder[]> {
    return this.repository.find({
      where: { activityId, isActive: true },
      relations: ['workOrder', 'workOrder.area'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByActivityAndWorkOrder(
    activityId: string,
    workOrderId: string,
  ): Promise<ActivityWorkOrder | null> {
    return this.repository.findOne({
      where: { activityId, workOrderId, isActive: true },
    });
  }

  async create(data: Partial<ActivityWorkOrder>): Promise<ActivityWorkOrder> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async delete(activityId: string, workOrderId: string): Promise<void> {
    await this.repository.delete({ activityId, workOrderId });
  }
}
