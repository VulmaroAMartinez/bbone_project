import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { AreasRepository } from "../../infrastructure/repositories";
import { Area } from "../../domain/entities";
import { CreateAreaInput, UpdateAreaInput } from "../dto";

@Injectable()
export class AreasService {
    constructor(private readonly areasRepository: AreasRepository) {}

    async findAll(): Promise<Area[]> {
        return this.areasRepository.findAll();
    }

    async findAllActive(): Promise<Area[]> {
        return this.areasRepository.findAllActive();
    }

    async findById(id: string): Promise<Area | null> {
        return this.areasRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Area> {
        const area = await this.areasRepository.findById(id);
        if (!area) {
            throw new NotFoundException(`Área con ID ${id} no encontrada`);
        }
        return area;
    }

    async findByName(name: string): Promise<Area | null> {
        return this.areasRepository.findByName(name);
    }

    async create(input: CreateAreaInput): Promise<Area> {
        return this.areasRepository.create(input);
    }

    async update(id: string, input: UpdateAreaInput): Promise<Area | null> {
        await this.findByIdOrFail(id);
        return this.areasRepository.update(id, input);
    }

    async deactivate(id: string) { await this.findByIdOrFail(id); await this.areasRepository.softDelete(id); return this.findByIdOrFail(id); }
    async activate(id: string) { await this.findByIdOrFail(id); await this.areasRepository.restore(id); return this.findByIdOrFail(id); }

}
