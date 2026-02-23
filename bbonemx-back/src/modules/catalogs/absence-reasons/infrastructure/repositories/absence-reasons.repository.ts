import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AbsenceReason } from "../../domain/entities";

@Injectable()
export class AbsenceReasonsRepository {
    constructor(@InjectRepository(AbsenceReason) private readonly repository: Repository<AbsenceReason>) {}

    async findAll(): Promise<AbsenceReason[]> {
        return this.repository.find();
    }

    async findAllActive(): Promise<AbsenceReason[]> {
        return this.repository.find({ where: { isActive: true } });
    }

    async findById(id: string): Promise<AbsenceReason | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<AbsenceReason | null> {
        return this.repository.findOne({ where: { name } });
    }

    async create(data: Partial<AbsenceReason>): Promise<AbsenceReason> {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: string, data: Partial<AbsenceReason>): Promise<AbsenceReason | null> {
        const absenceReason = await this.repository.findOne({ where: { id } });
        if (!absenceReason) return null;
        Object.assign(absenceReason, data);
        return this.repository.save(absenceReason);
    }

    async softDelete(id: string): Promise<void> {
        const absenceReason = await this.repository.findOne({ where: { id } });
        if (!absenceReason) return;
        absenceReason.isActive = false;
        absenceReason.deletedAt = new Date();
        await this.repository.save(absenceReason);
    }

    async restore(id: string): Promise<void> {
        const absenceReason = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!absenceReason) return;
        absenceReason.isActive = true;
        absenceReason.deletedAt = undefined;
        await this.repository.save(absenceReason);
    }
}