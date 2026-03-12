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

    async findAllWithDeleted(): Promise<AbsenceReason[]> {
        return this.repository.find({ withDeleted: true });
    }

    async findAllActive(): Promise<AbsenceReason[]> {
        return this.repository.find({ where: { isActive: true }, withDeleted: true });
    }

    async findById(id: string): Promise<AbsenceReason | null> {
        return this.repository.findOne({ where: { id }, withDeleted: true });
    }

    async findByName(name: string): Promise<AbsenceReason | null> {
        return this.repository.findOne({ where: { name }, withDeleted: true });
    }

    async create(data: Partial<AbsenceReason>): Promise<AbsenceReason> {
        return this.repository.save(this.repository.create(data));
    }

    async update(id: string, data: Partial<AbsenceReason>): Promise<AbsenceReason | null> {
        const absenceReason = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!absenceReason) return null;
        Object.assign(absenceReason, data);
        return this.repository.save(absenceReason);
    }

    async softDelete(id: string): Promise<void> {
        const absenceReason = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!absenceReason) return;
        absenceReason.isActive = false;
        absenceReason.deletedAt = new Date();
        await this.repository.save(absenceReason);
    }

    async restore(id: string): Promise<void> {
        const absenceReason = await this.repository.findOne({ where: { id }, withDeleted: true });
        if (!absenceReason) return;
        absenceReason.isActive = true;
        absenceReason.deletedAt = null as any;
        await this.repository.save(absenceReason);
    }
}