import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { ShiftsRepository } from "../../infrastructure/repositories";
import { Shift } from "../../domain/entities";
import { CreateShiftInput, UpdateShiftInput } from "../dto";

@Injectable()
export class ShiftsService {
    constructor(private readonly shiftsRepository: ShiftsRepository) {}

    async findAll(): Promise<Shift[]> {
        return this.shiftsRepository.findAll();
    }

    async findAllActive(): Promise<Shift[]> {
        return this.shiftsRepository.findAllActive();
    }
    
    async findById(id: string): Promise<Shift | null> {
        return this.shiftsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Shift> {
        const shift = await this.shiftsRepository.findById(id);
        if (!shift) {
            throw new NotFoundException(`Turno con ID ${id} no encontrado`);
        }
        return shift;
    }

    async findByName(name: string): Promise<Shift | null> {
        return this.shiftsRepository.findByName(name);
    }

    async create(input: CreateShiftInput): Promise<Shift> {
        return this.shiftsRepository.create(input);
    }

    async update(id: string, input: UpdateShiftInput): Promise<Shift | null> {
        await this.findByIdOrFail(id);
        return this.shiftsRepository.update(id, input);
    }
    
    async deactivate(id: string) { await this.findByIdOrFail(id); await this.shiftsRepository.softDelete(id); return this.findByIdOrFail(id); }

    async activate(id: string) { await this.findByIdOrFail(id); await this.shiftsRepository.restore(id); return this.findByIdOrFail(id); }
}