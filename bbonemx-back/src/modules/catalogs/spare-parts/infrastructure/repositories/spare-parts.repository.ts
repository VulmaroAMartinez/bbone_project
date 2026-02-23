import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SparePart } from "../../domain/entities";

@Injectable()
export class SparePartsRepository {
    constructor(@InjectRepository(SparePart) private readonly repository: Repository<SparePart>) {}

    async findAll(): Promise<SparePart[]> {
        return this.repository.find({ relations: ['machine'] });
    }

    async findAllActive(): Promise<SparePart[]> {
        return this.repository.find({ where: { isActive: true }, relations: ['machine'] });
    }

    async findById(id: string): Promise<SparePart | null> {
        return this.repository.findOne({ where: { id }, relations: ['machine'] });
    }

    async findByMachineId(machineId: string): Promise<SparePart[]> {
        return this.repository.find({ where: { machineId, isActive: true }, relations: ['machine'] });
    }

    async create(data: Partial<SparePart>): Promise<SparePart> {
        const saved = await this.repository.save(this.repository.create(data));
        return this.findById(saved.id) as Promise<SparePart>;
    }

    async update(id: string, data: Partial<SparePart>): Promise<SparePart | null> {
        const sparePart = await this.repository.findOne({ where: { id } });
        if (!sparePart) return null;
        Object.assign(sparePart, data);
        await this.repository.save(sparePart);
        return this.findById(id);
    }

    async softDelete(id: string): Promise<void> {
        const sparePart = await this.repository.findOne({ where: { id } });
        if (!sparePart) return;
        sparePart.isActive = false;
        sparePart.deletedAt = new Date();
        await this.repository.save(sparePart);
    }

    async restore(id: string): Promise<void> {
        const sparePart = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!sparePart) return;
        sparePart.isActive = true;
        sparePart.deletedAt = undefined;
        await this.repository.save(sparePart);
    }
}
