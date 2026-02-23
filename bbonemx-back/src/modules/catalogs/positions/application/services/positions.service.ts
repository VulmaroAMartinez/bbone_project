import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PositionsRepository } from "../../infrastructure/repositories";
import { Position } from "../../domain/entities";
import { CreatePositionInput, UpdatePositionInput } from "../dto";

@Injectable()
export class PositionsService {
    constructor(private readonly positionsRepository: PositionsRepository) {}

    async findAll(): Promise<Position[]> {
        return this.positionsRepository.findAll();
    }

    async findAllActive(): Promise<Position[]> {
        return this.positionsRepository.findAllActive();
    }

    async findById(id: string): Promise<Position | null> {
        return this.positionsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Position> {
        const position = await this.positionsRepository.findById(id);
        if (!position) {
            throw new NotFoundException(`Posición con ID ${id} no encontrada`);
        }
        return position;
    }

    async create(input: CreatePositionInput): Promise<Position> {
        return this.positionsRepository.create(input);
    }

    async update(id: string, input: UpdatePositionInput): Promise<Position | null> {
        await this.findByIdOrFail(id);
        return this.positionsRepository.update(id, input);
    }

    async deactivate(id: string) { await this.findByIdOrFail(id); await this.positionsRepository.softDelete(id); return this.findByIdOrFail(id); }
    async activate(id: string) { await this.findByIdOrFail(id); await this.positionsRepository.restore(id); return this.findByIdOrFail(id); }

    
}