import { Entity, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { SubArea } from 'src/modules/catalogs/sub-areas/domain/entities';
import { Area } from 'src/modules/catalogs/areas/domain/entities';
import { dateColumnTransformer } from 'src/common';

@Entity({ name: 'machines' })
@Check(
  'CHK_machine_area_xor_subarea',
  `(area_id IS NOT NULL AND sub_area_id IS NULL) OR (area_id IS NULL AND sub_area_id IS NOT NULL)`,
)
export class Machine extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId?: string;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  area?: Area;

  @Column({ name: 'sub_area_id', type: 'uuid', nullable: true })
  subAreaId?: string;

  @ManyToOne(() => SubArea, { nullable: true })
  @JoinColumn({ name: 'sub_area_id' })
  subArea?: SubArea;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer?: string;

  @Column({
    name: 'serial_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  serialNumber?: string;

  @Column({
    name: 'installation_date',
    type: 'date',
    nullable: true,
    transformer: dateColumnTransformer,
  })
  installationDate?: Date;

  @Column({
    name: 'machine_photo_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  machinePhotoUrl?: string;

  @Column({
    name: 'operational_manual_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  operationalManualUrl?: string;

  getEffectiveAreaId(): string | undefined {
    if (this.areaId) return this.areaId;
    if (this.subArea?.areaId) return this.subArea.areaId;
    return undefined;
  }
}
