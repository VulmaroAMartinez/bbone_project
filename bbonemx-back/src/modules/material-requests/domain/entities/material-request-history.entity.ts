import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { MaterialRequest } from './material-request.entity';
import { StatusHistoryMR, dateColumnTransformer } from 'src/common';

@Entity({ name: 'material_request_history' })
export class MaterialRequestHistory extends BaseEntity {
  @Column({ name: 'material_request_id', type: 'uuid' })
  materialRequestId: string;

  @ManyToOne(
    () => MaterialRequest,
    (materialRequest) => materialRequest.histories,
  )
  @JoinColumn({ name: 'material_request_id' })
  materialRequest: MaterialRequest;

  @Column({
    type: 'enum',
    enum: StatusHistoryMR,
    default: StatusHistoryMR.PENDING_PURCHASE_REQUEST,
  })
  status: StatusHistoryMR;

  @Column({ name: 'purchase_request', nullable: true })
  purchaseRequest?: string;

  @Column({ name: 'purchase_order', nullable: true })
  purchaseOrder?: string;

  @Column({ name: 'delivery_merchandise', nullable: true })
  deliveryMerchandise?: string;

  @Column({
    name: 'delivery_date',
    nullable: true,
    type: 'timestamp with time zone',
    transformer: dateColumnTransformer,
  })
  deliveryDate?: Date | null;

  @Column({
    name: 'estimated_delivery_date',
    nullable: true,
    type: 'date',
    transformer: dateColumnTransformer,
  })
  estimatedDeliveryDate?: Date | null;

  @Column({ name: 'progress_percentage', nullable: true })
  progressPercentage?: number;

  @Column({ nullable: true })
  supplier?: string;
}
