import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department } from "../../domain/entities";

@Injectable()
export class DepartmentsRepository {
    constructor(@InjectRepository(Department) private readonly repository: Repository<Department>) {}

    async findAll(): Promise<Department[]> {
        return this.repository.find();
    }

    async findAllActive(): Promise<Department[]> {
        return this.repository.find({ where: { isActive: true } });
    }

    async findById(id: string): Promise<Department | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Department | null> {
        return this.repository.findOne({ where: { name } });
    }

    async create(data: Partial<Department>): Promise<Department> {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: string, data: Partial<Department>): Promise<Department | null> {
        const department = await this.repository.findOne({ where: { id } });
        if (!department) return null;
        Object.assign(department, data);
        return this.repository.save(department);
    }

    async softDelete(id: string): Promise<void> {
        const department = await this.repository.findOne({ where: { id } });
        if (!department) return;
        department.isActive = false;
        department.deletedAt = new Date();
        await this.repository.save(department);
    }

    async restore(id: string): Promise<void> {
        const department = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!department) return;
        department.isActive = true;
        department.deletedAt = undefined;
        await this.repository.save(department);
    }
}
