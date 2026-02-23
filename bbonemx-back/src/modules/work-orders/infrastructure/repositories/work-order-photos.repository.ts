import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkOrderPhoto } from "../../domain/entities";
import { PhotoType } from "../../../../common/enums";

@Injectable()
export class WorkOrderPhotosRepository {
    constructor(@InjectRepository(WorkOrderPhoto) private readonly repository: Repository<WorkOrderPhoto>) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderPhoto[]> {
        return this.repository.find({
            where: { workOrderId: workOrderId, isActive: true },
            relations: ['uploader', 'uploader.role'],
            order: { uploadedAt: 'DESC' },
        });
    }

    async findByWorkOrderAndPhotoType(workOrderId: string, photoType: PhotoType): Promise<WorkOrderPhoto[]> {
        return this.repository.find({
            where: { workOrderId: workOrderId, photoType: photoType, isActive: true },
            relations: ['uploader'],
            order: { uploadedAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<WorkOrderPhoto | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: ['uploader', 'workOrder'],
        });
    }

    async create(data: Partial<WorkOrderPhoto>): Promise<WorkOrderPhoto> {
        return this.repository.save(this.repository.create(data));
    }

    async softDelete(id: string): Promise<void> {
        const workOrderPhoto = await this.repository.findOne({ where: { id } });
        if (!workOrderPhoto) return;
        workOrderPhoto.isActive = false;
        workOrderPhoto.deletedAt = new Date();
        await this.repository.save(workOrderPhoto);
    }

    async countByWorkOrderIdAndType(workOrderId: string, photoType: PhotoType): Promise<number> {
        return this.repository.count({ where: { workOrderId: workOrderId, photoType: photoType, isActive: true } });
    }
    
    
}