import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shift } from "../../domain/entities";

@Injectable()
export class ShiftsRepository {
    constructor(@InjectRepository(Shift) private readonly repository: Repository<Shift>) {}

    async findAll(): Promise<Shift[]> {
        return this.repository.find();
    }

    async findAllActive(): Promise<Shift[]> {
        return this.repository.find({ where: { isActive: true } });
    }

    async findById(id: string): Promise<Shift | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Shift | null> {
        return this.repository.findOne({ where: { name } });
    }

    async create(data: Partial<Shift>): Promise<Shift> {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: string, data: Partial<Shift>): Promise<Shift | null> {
        const shift = await this.repository.findOne({ where: { id } });
        if (!shift) return null;
        Object.assign(shift, data);
        return this.repository.save(shift);
    }

    async softDelete(id: string): Promise<void> {
        const shift = await this.repository.findOne({ where: { id } });
        if (!shift) return;
        shift.isActive = false;
        shift.deletedAt = new Date();
        await this.repository.save(shift);
    }
    
    async restore(id: string): Promise<void> {
        const shift = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!shift) return;
        shift.isActive = true;
        shift.deletedAt = undefined;
        await this.repository.save(shift);
    }

}