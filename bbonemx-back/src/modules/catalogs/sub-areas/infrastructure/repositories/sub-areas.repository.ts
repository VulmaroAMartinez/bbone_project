import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubArea } from "../../domain/entities";

@Injectable()
export class SubAreasRepository {
    constructor(@InjectRepository(SubArea) private readonly repository: Repository<SubArea>) {}

    async findAll(): Promise<SubArea[]> {
        return this.repository.find({ relations: ['area'] });
    }

    async findAllActive(): Promise<SubArea[]> {
        return this.repository.find({ where: { isActive: true }, relations: ['area'] });
    }

    async findById(id: string): Promise<SubArea | null> {
        return this.repository.findOne({ where: { id }, relations: ['area'] });
    }

    async findByAreaId(areaId: string): Promise<SubArea[]> {
        return this.repository.find({ where: { areaId, isActive: true }, relations: ['area'] });
    }

    async create(data: Partial<SubArea>): Promise<SubArea> {
        const saved = await this.repository.save(this.repository.create(data));
        return this.findById(saved.id) as Promise<SubArea>;
    }

    async update(id: string, data: Partial<SubArea>): Promise<SubArea | null> {
        const subArea = await this.repository.findOne({ where: { id } });
        if (!subArea) return null;
        Object.assign(subArea, data);
        await this.repository.save(subArea);
        return this.findById(id);
    }

    async softDelete(id: string): Promise<void> {
        const subArea = await this.repository.findOne({ where: { id } });
        if (!subArea) return;
        subArea.isActive = false;
        subArea.deletedAt = new Date();
        await this.repository.save(subArea);
    }

    async restore(id: string): Promise<void> {
        const subArea = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!subArea) return;
        subArea.isActive = true;
        subArea.deletedAt = undefined;
        await this.repository.save(subArea);
    }
}
