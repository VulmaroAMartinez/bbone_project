import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { User } from 'src/modules/users/domain/entities';
import { Machine } from 'src/modules/catalogs/machines/domain/entities';
import {
  RequestPriority,
  RequestImportance,
  RequestCategory,
} from 'src/common';
import { MaterialRequestItem } from './material-request-item.entity';

@Entity({ name: 'material_requests' })
export class MaterialRequest extends BaseEntity {
  @Column({ name: 'sequence', type: 'integer' })
  sequence: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true })
  folio: string;

  @Column({ type: 'text' })
  boss: string;

  @Column({ type: 'enum', enum: RequestCategory })
  category: RequestCategory;

  @Column({ type: 'enum', enum: RequestImportance })
  importance: RequestImportance;

  @Column({ type: 'enum', enum: RequestPriority })
  priority: RequestPriority;

  @Column({ name: 'custom_machine_name', type: 'varchar', nullable: true })
  customMachineName?: string;

  @Column({ name: 'custom_machine_brand', type: 'varchar', nullable: true })
  customMachineBrand?: string;

  @Column({ name: 'custom_machine_model', type: 'varchar', nullable: true })
  customMachineModel?: string;

  @Column({
    name: 'custom_machine_manufacturer',
    type: 'varchar',
    nullable: true,
  })
  customMachineManufacturer?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  justification?: string;

  @Column({ name: 'is_generic_allowed', type: 'boolean', default: false })
  isGenericAllowed: boolean;

  @Column({ name: 'suggested_supplier', type: 'varchar', nullable: true })
  suggestedSupplier?: string;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column({ name: 'machine_id', type: 'uuid', nullable: true })
  machineId?: string;

  @ManyToOne(() => Machine, { nullable: true })
  @JoinColumn({ name: 'machine_id' })
  machine?: Machine;

  @OneToMany(() => MaterialRequestItem, (item) => item.materialRequest, {
    cascade: true,
  })
  items: MaterialRequestItem[];
}
