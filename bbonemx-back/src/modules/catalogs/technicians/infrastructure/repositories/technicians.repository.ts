import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Technician } from "../../domain/entities";

@Injectable()
export class TechniciansRepository {
    constructor(@InjectRepository(Technician) private readonly repository: Repository<Technician>) {}

    async findAll(): Promise<Technician[]> {
        return this.repository.find({
            relations: ['user', 'position'],
            order: {
                user: {
                    lastName: 'ASC'
                }
            }
        });
    }

    async findAllActive(): Promise<Technician[]> {
        return this.repository.find({
            where: { isActive: true },
            relations: ['user', 'position'],
            order: {
                user: {
                    lastName: 'ASC'
                }
            }
        });
    }

    async findById(id: string): Promise<Technician | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user', 'position']
        });
    }

    async findByUserId(userId: string): Promise<Technician | null> {
        return this.repository.findOne({
            where: { userId },
            relations: ['user', 'position']
        });
    }

    async create(data: Partial<Technician>): Promise<Technician> {
        const entity = this.repository.create(data);
        const saved = await this.repository.save(entity);
        return this.findById(saved.id) as Promise<Technician>;
    }

    async update(id: string, data: Partial<Technician>): Promise<Technician | null> {
        const technician = await this.repository.findOne({ where: { id } });
        if (!technician) return null;
        Object.assign(technician, data);
        await this.repository.save(technician);
        return this.findById(id) as Promise<Technician>;
    }

    async softDelete(id: string): Promise<void> {
        const technician = await this.repository.findOne({ where: { id } });
        if (!technician) return;
        technician.isActive = false;
        technician.deletedAt = new Date();
        await this.repository.save(technician);
    }

    async restore(id: string): Promise<void> {
        const technician = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!technician) return;
        technician.isActive = true;
        technician.deletedAt = undefined;
        await this.repository.save(technician);
    }
}