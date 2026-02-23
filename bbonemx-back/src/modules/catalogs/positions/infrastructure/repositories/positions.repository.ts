import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Position } from "../../domain/entities";

@Injectable()
export class PositionsRepository {
    constructor(@InjectRepository(Position) private readonly repository: Repository<Position>) {}

    async findAll(): Promise<Position[]> {
        return this.repository.find();
    }

    async findAllActive(): Promise<Position[]> {
        return this.repository.find({ where: { isActive: true } });
    }

    async findById(id: string): Promise<Position | null> {
        return this.repository.findOne({ where: { id } });
    }

    async create(data: Partial<Position>): Promise<Position> {
        return this.repository.save(this.repository.create(data));
    }
    
    async update(id: string, data: Partial<Position>): Promise<Position | null> {
        const position = await this.repository.findOne({ where: { id } });
        if (!position) return null;
        Object.assign(position, data);
        return this.repository.save(position);
    }

    async softDelete(id: string): Promise<void> {
        const position = await this.repository.findOne({ where: { id } });
        if (!position) return;
        position.isActive = false;
        position.deletedAt = new Date();
        await this.repository.save(position);
    }

    async restore(id: string): Promise<void> {
        const position = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!position) return;
        position.isActive = true;
        position.deletedAt = undefined;
        await this.repository.save(position);
    }

}