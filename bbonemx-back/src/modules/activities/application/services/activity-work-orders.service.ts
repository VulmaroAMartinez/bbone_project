import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityWorkOrdersRepository } from '../../infrastructure/repositories/activity-work-orders.repository';
import { ActivitiesService } from './activities.service';
import { WorkOrdersService } from 'src/modules/work-orders/application/services/work-orders.service';
import { ActivityWorkOrder } from '../../domain/entities';

@Injectable()
export class ActivityWorkOrdersService {
  constructor(
    private readonly activityWorkOrdersRepository: ActivityWorkOrdersRepository,
    private readonly activitiesService: ActivitiesService,
    private readonly workOrdersService: WorkOrdersService,
  ) {}

  async findByActivityId(activityId: string): Promise<ActivityWorkOrder[]> {
    return this.activityWorkOrdersRepository.findByActivityId(activityId);
  }

  async addByFolio(activityId: string, folio: string): Promise<ActivityWorkOrder> {
    await this.activitiesService.findByIdOrFail(activityId);

    const workOrder = await this.workOrdersService.findByFolio(folio);
    if (!workOrder) {
      throw new NotFoundException(
        `Orden de trabajo con folio "${folio}" no encontrada`,
      );
    }

    const existing = await this.activityWorkOrdersRepository.findByActivityAndWorkOrder(
      activityId,
      workOrder.id,
    );
    if (existing) {
      throw new BadRequestException(
        `La orden de trabajo "${folio}" ya está vinculada a esta actividad`,
      );
    }

    return this.activityWorkOrdersRepository.create({
      activityId,
      workOrderId: workOrder.id,
    });
  }

  async remove(activityId: string, workOrderId: string): Promise<void> {
    await this.activitiesService.findByIdOrFail(activityId);
    await this.activityWorkOrdersRepository.delete(activityId, workOrderId);
  }
}
