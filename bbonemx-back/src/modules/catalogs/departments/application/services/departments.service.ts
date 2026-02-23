import { Injectable, NotFoundException } from "@nestjs/common";
import { DepartmentsRepository } from "../../infrastructure/repositories";
import { Department } from "../../domain/entities";
import { CreateDepartmentInput, UpdateDepartmentInput } from "../dto";

@Injectable()
export class DepartmentsService {
    constructor(private readonly departmentsRepository: DepartmentsRepository) {}

    async findAll(): Promise<Department[]> {
        return this.departmentsRepository.findAll();
    }

    async findAllActive(): Promise<Department[]> {
        return this.departmentsRepository.findAllActive();
    }

    async findById(id: string): Promise<Department | null> {
        return this.departmentsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Department> {
        const department = await this.departmentsRepository.findById(id);
        if (!department) {
            throw new NotFoundException(`Departamento con ID ${id} no encontrado`);
        }
        return department;
    }

    async findByName(name: string): Promise<Department | null> {
        return this.departmentsRepository.findByName(name);
    }

    async create(input: CreateDepartmentInput): Promise<Department> {
        return this.departmentsRepository.create(input);
    }

    async update(id: string, input: UpdateDepartmentInput): Promise<Department | null> {
        await this.findByIdOrFail(id);
        return this.departmentsRepository.update(id, input);
    }

    async deactivate(id: string) { await this.findByIdOrFail(id); await this.departmentsRepository.softDelete(id); return this.findByIdOrFail(id); }
    async activate(id: string) { await this.findByIdOrFail(id); await this.departmentsRepository.restore(id); return this.findByIdOrFail(id); }
}
