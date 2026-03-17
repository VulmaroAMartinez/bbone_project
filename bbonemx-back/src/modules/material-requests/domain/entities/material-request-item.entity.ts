import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from 'src/infrastructure/database/base.entity';
import { MaterialRequest } from './material-request.entity';
import { Material } from 'src/modules/catalogs/materials/domain/entities';
import { SparePart } from 'src/modules/catalogs/spare-parts/domain/entities';

@Entity({ name: 'material_request_materials' })
@Unique(['materialRequestId', 'materialId'])
export class MaterialRequestItem extends BaseEntity {
  @Column({ name: 'material_request_id', type: 'uuid' })
  materialRequestId: string;

  @ManyToOne(() => MaterialRequest, (req) => req.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'material_request_id' })
  materialRequest: MaterialRequest;

  @Column({ name: 'material_id', type: 'uuid', nullable: true })
  materialId?: string;

  @ManyToOne(() => Material, { nullable: true })
  @JoinColumn({ name: 'material_id' })
  material?: Material;

  @Column({ name: 'spare_part_id', type: 'uuid', nullable: true })
  sparePartId?: string;

  @ManyToOne(() => SparePart, { nullable: true })
  @JoinColumn({ name: 'spare_part_id' })
  sparePart?: SparePart;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ name: 'custom_name', type: 'varchar', nullable: true })
  customName?: string;

  @Column({ type: 'varchar', nullable: true })
  sku?: string;

  @Column({ type: 'varchar', nullable: true })
  partNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  brand?: string;

  @Column({ type: 'varchar', nullable: true })
  model?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unitOfMeasure?: string;

  @Column({ type: 'integer', nullable: true })
  requestedQuantity?: number;

  @Column({ name: 'proposed_max_stock', type: 'int', nullable: true })
  proposedMaxStock?: number;

  @Column({ name: 'proposed_min_stock', type: 'int', nullable: true })
  proposedMinStock?: number;
}
