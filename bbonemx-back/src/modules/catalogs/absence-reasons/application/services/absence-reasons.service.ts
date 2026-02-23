import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { AbsenceReasonsRepository } from "../../infrastructure/repositories";
import { AbsenceReason } from "../../domain/entities";
import { CreateAbsenceReasonInput, UpdateAbsenceReasonInput } from "../dto";


@Injectable()
export class AbsenceReasonsService {
    constructor(private readonly absenceReasonsRepository: AbsenceReasonsRepository) {}

    async findAll(): Promise<AbsenceReason[]> {
        return this.absenceReasonsRepository.findAll();
    }

    async findAllActive(): Promise<AbsenceReason[]> {
        return this.absenceReasonsRepository.findAllActive();
    }

    async findById(id: string): Promise<AbsenceReason | null> {
        return this.absenceReasonsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<AbsenceReason> {
        const absenceReason = await this.absenceReasonsRepository.findById(id);
        if (!absenceReason) {
            throw new NotFoundException(`Razón de ausencia con ID ${id} no encontrada`);
        }
        return absenceReason;
    }

    async findByName(name: string): Promise<AbsenceReason | null> {
        return this.absenceReasonsRepository.findByName(name);
    }

    async create(input: CreateAbsenceReasonInput): Promise<AbsenceReason> {
        return this.absenceReasonsRepository.create(input);
    }
    
    async update(id: string, input: UpdateAbsenceReasonInput): Promise<AbsenceReason | null> {
        await this.findByIdOrFail(id);
        return this.absenceReasonsRepository.update(id, input);
    }

    async deactivate(id: string) { await this.findByIdOrFail(id); await this.absenceReasonsRepository.softDelete(id); return this.findByIdOrFail(id); }
    async activate(id: string) { await this.findByIdOrFail(id); await this.absenceReasonsRepository.restore(id); return this.findByIdOrFail(id); }

    
}
