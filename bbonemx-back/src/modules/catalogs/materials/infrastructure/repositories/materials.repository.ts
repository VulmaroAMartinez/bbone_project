import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Material } from "../../domain/entities";

@Injectable()
export class MaterialsRepository {
    constructor(@InjectRepository(Material) private readonly repository: Repository<Material>) {}

    async findAll(): Promise<Material[]> {
        return this.repository.find();
    }

    async findAllActive(): Promise<Material[]> {
        return this.repository.find({ where: { isActive: true } });
    }

    async findById(id: string): Promise<Material | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findBySku(sku: string): Promise<Material | null> {
        return this.repository.findOne({ where: { sku } });
    }

    async create(data: Partial<Material>): Promise<Material> {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: string, data: Partial<Material>): Promise<Material | null> {
        const material = await this.repository.findOne({ where: { id } });
        if (!material) return null;
        Object.assign(material, data);
        return this.repository.save(material);
    }

    async softDelete(id: string): Promise<void> {
        const material = await this.repository.findOne({ where: { id } });
        if (!material) return;
        material.isActive = false;
        material.deletedAt = new Date();
        await this.repository.save(material);
    }

    async restore(id: string): Promise<void> {
        const material = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!material) return;
        material.isActive = true;
        material.deletedAt = undefined;
        await this.repository.save(material);
    }
}
