import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { Activity } from './activity.entity';
import { WorkOrder } from 'src/modules/work-orders/domain/entities';

@Entity({ name: 'activity_work_orders' })
@Unique(['activityId', 'workOrderId'])
export class ActivityWorkOrder extends BaseEntity {
  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity, (a) => a.activityWorkOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId: string;

  @ManyToOne(() => WorkOrder)
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;
}
