import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { User } from 'src/modules/users/domain/entities';
import {
  RequestPriority,
  RequestImportance,
  RequestCategory,
} from 'src/common';
import { MaterialRequestItem } from './material-request-item.entity';
import { MaterialRequestMachine } from './material-request-machine.entity';
import { MaterialRequestHistory } from './material-request-history.entity';

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

  @Column({ name: 'suggested_supplier', type: 'varchar', nullable: true })
  suggestedSupplier?: string;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ name: 'email_sent_at', type: 'timestamp with time zone', nullable: true })
  emailSentAt?: Date | null;

  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @OneToMany(() => MaterialRequestMachine, (mrm) => mrm.materialRequest, {
    cascade: true,
  })
  machines: MaterialRequestMachine[];

  @OneToMany(() => MaterialRequestItem, (item) => item.materialRequest, {
    cascade: true,
  })
  items: MaterialRequestItem[];

  @OneToMany(() => MaterialRequestHistory, (histories) => histories.materialRequest, {
    cascade: true,
  })
  histories: MaterialRequestHistory[];
}
