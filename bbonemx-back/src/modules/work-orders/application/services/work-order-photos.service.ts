import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { WorkOrderPhotosRepository } from "../../infrastructure/repositories";
import { WorkOrderPhoto } from "../..";
import { CreateWorkOrderPhotoInput } from "../..";
import { PhotoType } from "src/common";

@Injectable()
export class WorkOrderPhotosService {
    constructor(private readonly workOrderPhotosRepository: WorkOrderPhotosRepository) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderPhoto[]> {
        return this.workOrderPhotosRepository.findByWorkOrderId(workOrderId);
    }

    async findByWorkOrderAndPhotoType(workOrderId: string, photoType: PhotoType): Promise<WorkOrderPhoto[]> {
        return this.workOrderPhotosRepository.findByWorkOrderAndPhotoType(workOrderId, photoType);
    }

    async findById(id: string): Promise<WorkOrderPhoto | null> {
        return this.workOrderPhotosRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<WorkOrderPhoto> {
        const photo = await this.workOrderPhotosRepository.findById(id);
        if(!photo) throw new NotFoundException('Foto de OT no encontrada');
        return photo;
    }

    async create(input: CreateWorkOrderPhotoInput, userId: string): Promise<WorkOrderPhoto> {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if(!allowedMimeTypes.includes(input.mimeType)) throw new BadRequestException('Tipo de archivo no permitido');

        return this.workOrderPhotosRepository.create({
            ...input,
            uploadedBy: userId,
            uploadedAt: new Date(),
        });
    }

    async delete(id: string): Promise<void> {
        const photo = await this.findByIdOrFail(id);
        await this.workOrderPhotosRepository.softDelete(photo.id);
    }

    async countByType(workOrderId: string, photoType: PhotoType): Promise<number> {
        return this.workOrderPhotosRepository.countByWorkOrderIdAndType(workOrderId, photoType);
    }
}