import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Area } from "../../domain/entities";

@Injectable()
export class AreasRepository {
    constructor(@InjectRepository(Area) private readonly repository: Repository<Area>) {}

    async findAll(): Promise<Area[]> {
        return this.repository.find();
    }

    async findAllActive(): Promise<Area[]> {
        return this.repository.find({ where: { isActive: true } });
    }

    async findById(id: string): Promise<Area | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Area | null> {
        return this.repository.findOne({ where: { name } });
    }

    async create(data: Partial<Area>): Promise<Area> {
        return this.repository.save(this.repository.create(data));
    }
    

    async update(id: string, data: Partial<Area>): Promise<Area | null> {
        const area = await this.repository.findOne({ where: { id } });
        if (!area) return null;
        Object.assign(area, data);
        return this.repository.save(area);
    }

    async softDelete(id: string): Promise<void> {
        const area = await this.repository.findOne({ where: { id } });
        if (!area) return;
        area.isActive = false;
        area.deletedAt = new Date();
        await this.repository.save(area);
    }

    async restore(id: string): Promise<void> {
        const area = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!area) return;
        area.isActive = true;
        area.deletedAt = undefined;
        await this.repository.save(area);
    }
}