import { Injectable, NotFoundException } from "@nestjs/common";
import { MaterialsRepository } from "../../infrastructure/repositories";
import { Material } from "../../domain/entities";
import { CreateMaterialInput, UpdateMaterialInput } from "../dto";

@Injectable()
export class MaterialsService {
    constructor(private readonly materialsRepository: MaterialsRepository) {}

    async findAll(): Promise<Material[]> {
        return this.materialsRepository.findAll();
    }

    async findAllActive(): Promise<Material[]> {
        return this.materialsRepository.findAllActive();
    }

    async findById(id: string): Promise<Material | null> {
        return this.materialsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Material> {
        const material = await this.materialsRepository.findById(id);
        if (!material) {
            throw new NotFoundException(`Material con ID ${id} no encontrado`);
        }
        return material;
    }

    async findBySku(sku: string): Promise<Material | null> {
        return this.materialsRepository.findBySku(sku);
    }

    async create(input: CreateMaterialInput): Promise<Material> {
        return this.materialsRepository.create(input);
    }

    async update(id: string, input: UpdateMaterialInput): Promise<Material | null> {
        await this.findByIdOrFail(id);
        return this.materialsRepository.update(id, input);
    }

    async deactivate(id: string) { await this.findByIdOrFail(id); await this.materialsRepository.softDelete(id); return this.findByIdOrFail(id); }
    async activate(id: string) { await this.findByIdOrFail(id); await this.materialsRepository.restore(id); return this.findByIdOrFail(id); }
}
