import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { WorkOrder } from "./";
import { User } from "src/modules/users/domain/entities";
import { PhotoType } from "src/common";

@Entity({ name: 'work_order_photos' })
export class WorkOrderPhoto extends BaseEntity {
    @Column({ name: 'work_order_id', type: 'uuid' })
    workOrderId: string;

    @ManyToOne(() => WorkOrder, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'work_order_id' })
    workOrder: WorkOrder;

    @Column({ name: 'photo_type', type: 'enum', enum: PhotoType })
    photoType: PhotoType;

    @Column({ name: 'file_path', type: 'varchar', length: 500 })
    filePath: string;

    @Column({ name: 'file_name', type: 'varchar', length: 255 })
    fileName: string;

    @Column({ name: 'mime_type', type: 'varchar', length: 50 })
    mimeType: string;

    @Column({ name: 'uploaded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    uploadedAt: Date;

    @Column({ name: 'uploaded_by', type: 'uuid' })
    uploadedBy: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploaded_by' })
    uploader: User;
}