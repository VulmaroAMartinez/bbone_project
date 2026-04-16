import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { MaterialRequest } from './material-request.entity';
import { Machine } from 'src/modules/catalogs/machines/domain/entities';

@Entity({ name: 'material_request_machines' })
@Unique(['materialRequestId', 'machineId'])
export class MaterialRequestMachine extends BaseEntity {
  @Column({ name: 'custom_machine_name', type: 'varchar', nullable: true })
  customMachineName?: string;

  @Column({ name: 'custom_machine_model', type: 'varchar', nullable: true })
  customMachineModel?: string;

  @Column({
    name: 'custom_machine_manufacturer',
    type: 'varchar',
    nullable: true,
  })
  customMachineManufacturer?: string;

  @Column({ name: 'material_request_id', type: 'uuid' })
  materialRequestId: string;

  @ManyToOne(() => MaterialRequest, (req) => req.machines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'material_request_id' })
  materialRequest: MaterialRequest;

  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId?: string;

  @ManyToOne(() => Machine, { eager: false, nullable: true })
  @JoinColumn({ name: 'machine_id' })
  machine?: Machine;
}
