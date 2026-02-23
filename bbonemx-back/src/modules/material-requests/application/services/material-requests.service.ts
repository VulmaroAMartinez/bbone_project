import { Injectable, NotFoundException } from "@nestjs/common";
import { MaterialRequestsRepository, MaterialRequestMaterialsRepository } from "../../infrastructure/repositories";
import { MaterialRequest, MaterialRequestMaterial } from "../../domain/entities";
import { CreateMaterialRequestInput, UpdateMaterialRequestInput, AddMaterialToRequestInput } from "../dto";

@Injectable()
export class MaterialRequestsService {
    constructor(
        private readonly materialRequestsRepository: MaterialRequestsRepository,
        private readonly materialRequestMaterialsRepository: MaterialRequestMaterialsRepository,
    ) {}

    async findAll(): Promise<MaterialRequest[]> {
        return this.materialRequestsRepository.findAll();
    }

    async findAllActive(): Promise<MaterialRequest[]> {
        return this.materialRequestsRepository.findAllActive();
    }

    async findById(id: string): Promise<MaterialRequest | null> {
        return this.materialRequestsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<MaterialRequest> {
        const materialRequest = await this.materialRequestsRepository.findById(id);
        if (!materialRequest) {
            throw new NotFoundException(`Solicitud de material con ID ${id} no encontrada`);
        }
        return materialRequest;
    }

    async findByFolio(folio: string): Promise<MaterialRequest | null> {
        return this.materialRequestsRepository.findByFolio(folio);
    }

    async create(input: CreateMaterialRequestInput): Promise<MaterialRequest> {
        return this.materialRequestsRepository.create(input);
    }

    async update(id: string, input: UpdateMaterialRequestInput): Promise<MaterialRequest | null> {
        await this.findByIdOrFail(id);
        return this.materialRequestsRepository.update(id, input);
    }

    async addMaterial(materialRequestId: string, input: AddMaterialToRequestInput): Promise<MaterialRequestMaterial> {
        await this.findByIdOrFail(materialRequestId);
        return this.materialRequestMaterialsRepository.create({
            materialRequestId,
            ...input,
        });
    }

    async removeMaterial(materialRequestMaterialId: string): Promise<boolean> {
        await this.materialRequestMaterialsRepository.delete(materialRequestMaterialId);
        return true;
    }

    async deactivate(id: string): Promise<boolean> {
        await this.findByIdOrFail(id);
        await this.materialRequestsRepository.softDelete(id);
        return true;
    }
}
