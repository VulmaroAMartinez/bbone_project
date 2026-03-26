import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { Activity } from './activity.entity';
import { MaterialRequest } from 'src/modules/material-requests/domain/entities';

@Entity({ name: 'activity_material_requests' })
@Unique(['activityId', 'materialRequestId'])
export class ActivityMaterialRequest extends BaseEntity {
  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @ManyToOne(() => Activity, (a) => a.activityMaterialRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column({ name: 'material_request_id', type: 'uuid' })
  materialRequestId: string;

  @ManyToOne(() => MaterialRequest)
  @JoinColumn({ name: 'material_request_id' })
  materialRequest: MaterialRequest;
}
