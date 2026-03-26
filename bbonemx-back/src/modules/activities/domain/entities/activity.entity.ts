import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { Area } from 'src/modules/catalogs/areas/domain/entities';
import { Machine } from 'src/modules/catalogs/machines/domain/entities';
import { ActivityStatus, dateColumnTransformer } from 'src/common';
import { ActivityTechnician } from './activity-technician.entity';
import { ActivityWorkOrder } from './activity-work-order.entity';
import { ActivityMaterialRequest } from './activity-material-request.entity';

@Entity({ name: 'activities' })
export class Activity extends BaseEntity {
  @Column({ name: 'area_id', type: 'uuid' })
  areaId: string;

  @ManyToOne(() => Area)
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ type: 'varchar', length: 500 })
  activity: string;

  @Column({
    name: 'start_date',
    type: 'date',
    transformer: dateColumnTransformer,
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'date',
    transformer: dateColumnTransformer,
  })
  endDate: Date;

  @Column({ type: 'integer', default: 0 })
  progress: number;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.PENDING,
  })
  status: ActivityStatus;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ type: 'boolean', default: false })
  priority: boolean;

  @OneToMany(() => ActivityTechnician, (at) => at.activity)
  activityTechnicians: ActivityTechnician[];

  @OneToMany(() => ActivityWorkOrder, (awo) => awo.activity)
  activityWorkOrders: ActivityWorkOrder[];

  @OneToMany(() => ActivityMaterialRequest, (amr) => amr.activity)
  activityMaterialRequests: ActivityMaterialRequest[];
}
