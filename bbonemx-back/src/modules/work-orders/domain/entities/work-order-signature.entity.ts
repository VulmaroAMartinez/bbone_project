import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { WorkOrder } from "./";
import { User } from "src/modules/users/domain/entities";

@Entity({ name: 'work_order_signatures' })
export class WorkOrderSignature extends BaseEntity {
    @Column({ name: 'work_order_id', type: 'uuid' })
    workOrderId: string;

    @ManyToOne(() => WorkOrder, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'work_order_id' })
    workOrder: WorkOrder;

    @Column({name: 'signer_id', type: 'uuid'})
    signerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'signer_id' })
    signer: User;

    @Column({name: 'signature_image_path', type: 'varchar', length: 500})
    signatureImagePath: string;

    @Column({name: 'signed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    signedAt: Date;

    @Column({name: 'ip_address', type: 'varchar', length: 45, nullable: true})
    ipAddress?: string;

}