import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Machine } from "../../domain/entities";

@Injectable()
export class MachinesRepository {
    constructor(@InjectRepository(Machine) private readonly repository: Repository<Machine>) {}

    async findAll(): Promise<Machine[]> {
        return this.repository.find({ relations: ['subArea', 'subArea.area'], order: { name: 'ASC' } });
    }

    async findAllActive(): Promise<Machine[]> {
        return this.repository.find({ where: { isActive: true }, relations: ['subArea', 'subArea.area'], order: { name: 'ASC' } });
    }

    async findById(id: string): Promise<Machine | null> {
        return this.repository.findOne({ where: { id }, relations: ['subArea', 'subArea.area'] });
    }

    async findBySubAreaId(subAreaId: string): Promise<Machine[]> {
        return this.repository.find({ where: { subAreaId, isActive: true }, relations: ['subArea', 'subArea.area'], order: { name: 'ASC' } });
    }

    async create(data: Partial<Machine>): Promise<Machine> {
        const created = await this.repository.save(this.repository.create(data));
        return (await this.findById(created.id)) ?? created;
    }

    async update(id: string, data: Partial<Machine>): Promise<Machine | null> {
        const machine = await this.repository.findOne({ where: { id } });
        if (!machine) return null;
        Object.assign(machine, data);
        const updated = await this.repository.save(machine);
        return (await this.findById(updated.id)) ?? updated;
    }

    async softDelete(id: string): Promise<void> {
        const machine = await this.repository.findOne({ where: { id } });
        if (!machine) return;
        machine.isActive = false;
        machine.deletedAt = new Date();
        await this.repository.save(machine);
    }

    async restore(id: string): Promise<void> {
        const machine = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!machine) return;
        machine.isActive = true;
        machine.deletedAt = undefined;
        await this.repository.save(machine);
    }
}
