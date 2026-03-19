import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { MaterialRequest } from './material-request.entity';
import { Machine } from 'src/modules/catalogs/machines/domain/entities';

@Entity({ name: 'material_request_machines' })
@Unique(['materialRequestId', 'machineId'])
export class MaterialRequestMachine extends BaseEntity {
  @Column({ name: 'material_request_id', type: 'uuid' })
  materialRequestId: string;

  @ManyToOne(() => MaterialRequest, (req) => req.machines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'material_request_id' })
  materialRequest: MaterialRequest;

  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  @ManyToOne(() => Machine, { eager: false })
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;
}
