import { Injectable, NotFoundException } from "@nestjs/common";
import { MachinesRepository } from "../../infrastructure/repositories";
import { Machine } from "../../domain/entities";
import { CreateMachineInput, UpdateMachineInput } from "../dto";

@Injectable()
export class MachinesService {
    constructor(private readonly machinesRepository: MachinesRepository) {}

    async findAll(): Promise<Machine[]> {
        return this.machinesRepository.findAll();
    }

    async findAllActive(): Promise<Machine[]> {
        return this.machinesRepository.findAllActive();
    }

    async findById(id: string): Promise<Machine | null> {
        return this.machinesRepository.findById(id);
    }
    
    async findByIdOrFail(id: string): Promise<Machine> {
        const machine = await this.machinesRepository.findById(id);
        if (!machine) {
            throw new NotFoundException(`Máquina con ID ${id} no encontrada`);
        }
        return machine;
    }
    
    async findBySubAreaId(subAreaId: string): Promise<Machine[]> {
        return this.machinesRepository.findBySubAreaId(subAreaId);
    }

    async create(input: CreateMachineInput): Promise<Machine> {
        return this.machinesRepository.create(input);
    }

    async update(id: string, input: UpdateMachineInput): Promise<Machine | null> {
        await this.findByIdOrFail(id);
        return this.machinesRepository.update(id, input);
    }       

    async deactivate(id: string) { await this.findByIdOrFail(id); await this.machinesRepository.softDelete(id); return this.findByIdOrFail(id); }
    async activate(id: string) { await this.findByIdOrFail(id); await this.machinesRepository.restore(id); return this.findByIdOrFail(id); }
}