import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { WorkOrder } from "./";
import { User } from "src/modules/users/domain/entities";

@Entity({name: 'work_order_technicians'})
@Unique(['workOrderId', 'technicianId'])
export class WorkOrderTechnician extends BaseEntity {
    @Column({name: 'work_order_id', type: 'uuid'})
    workOrderId: string;

    @ManyToOne(() => WorkOrder, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'work_order_id'})
    workOrder: WorkOrder;

    @Column({name: 'technician_id', type: 'uuid'})
    technicianId: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'technician_id'})
    technician: User;

    @Column({name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    assignedAt: Date;

    @Column({name:'assigned_by', type: 'uuid'})
    assignedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'assigned_by'})
    assigner: User;

    @Column({name:'is_lead', type: 'boolean', default: false})
    isLead: boolean;
}