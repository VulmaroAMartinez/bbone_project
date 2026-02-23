import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { WorkOrder } from "./work-order.entity";
import { Material } from "src/modules/catalogs/materials/domain/entities";

@Entity({ name: 'work_order_materials' })
export class WorkOrderMaterial extends BaseEntity {
    @Column({ name: 'work_order_id', type: 'uuid' })
    workOrderId: string;

    @ManyToOne(() => WorkOrder, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'work_order_id' })
    workOrder: WorkOrder;

    @Column({ name: 'material_id', type: 'uuid' })
    materialId: string;

    @ManyToOne(() => Material)
    @JoinColumn({ name: 'material_id' })
    material: Material;

    @Column({ type: 'integer', default: 1 })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;
}
