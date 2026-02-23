import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { WorkOrder } from "./work-order.entity";
import { SparePart } from "src/modules/catalogs/spare-parts/domain/entities";

@Entity({ name: 'work_order_spare_parts' })
export class WorkOrderSparePart extends BaseEntity {
    @Column({ name: 'work_order_id', type: 'uuid' })
    workOrderId: string;

    @ManyToOne(() => WorkOrder, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'work_order_id' })
    workOrder: WorkOrder;

    @Column({ name: 'spare_part_id', type: 'uuid' })
    sparePartId: string;

    @ManyToOne(() => SparePart)
    @JoinColumn({ name: 'spare_part_id' })
    sparePart: SparePart;

    @Column({ type: 'integer', default: 1 })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;
}
