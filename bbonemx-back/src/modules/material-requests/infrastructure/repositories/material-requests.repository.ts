import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MaterialRequest } from "../../domain/entities";

@Injectable()
export class MaterialRequestsRepository {
    constructor(@InjectRepository(MaterialRequest) private readonly repository: Repository<MaterialRequest>) {}

    async findAll(): Promise<MaterialRequest[]> {
        return this.repository.find({ relations: ['machine', 'materials', 'materials.material'], order: { createdAt: 'DESC' } });
    }

    async findAllActive(): Promise<MaterialRequest[]> {
        return this.repository.find({ where: { isActive: true }, relations: ['machine', 'materials', 'materials.material'], order: { createdAt: 'DESC' } });
    }

    async findById(id: string): Promise<MaterialRequest | null> {
        return this.repository.findOne({ where: { id }, relations: ['machine', 'materials', 'materials.material'] });
    }

    async findByFolio(folio: string): Promise<MaterialRequest | null> {
        return this.repository.findOne({ where: { folio }, relations: ['machine', 'materials', 'materials.material'] });
    }

    async create(data: Partial<MaterialRequest>): Promise<MaterialRequest> {
        const saved = await this.repository.save(this.repository.create(data));
        return this.findById(saved.id) as Promise<MaterialRequest>;
    }

    async update(id: string, data: Partial<MaterialRequest>): Promise<MaterialRequest | null> {
        const materialRequest = await this.repository.findOne({ where: { id } });
        if (!materialRequest) return null;
        Object.assign(materialRequest, data);
        await this.repository.save(materialRequest);
        return this.findById(id);
    }

    async softDelete(id: string): Promise<void> {
        const materialRequest = await this.repository.findOne({ where: { id } });
        if (!materialRequest) return;
        materialRequest.isActive = false;
        materialRequest.deletedAt = new Date();
        await this.repository.save(materialRequest);
    }
}
