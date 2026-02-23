import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { TechniciansRepository } from "../../infrastructure/repositories";
import { Technician } from "../../domain/entities";
import { CreateTechnicianInput, UpdateTechnicianInput } from "../dto";

@Injectable()
export class TechniciansService {
    constructor(private readonly techniciansRepository: TechniciansRepository) {}

    async findAll(): Promise<Technician[]> {
        return this.techniciansRepository.findAll();
    }

    async findAllActive(): Promise<Technician[]> {
        return this.techniciansRepository.findAllActive();
    }

    async findById(id: string): Promise<Technician | null> {
        return this.techniciansRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Technician> {
        const technician = await this.techniciansRepository.findById(id);
        if (!technician) {
            throw new NotFoundException("Técnico no encontrado");
        }
        return technician;
    }

    async create(input: CreateTechnicianInput): Promise<Technician> {
        const existing = await this.techniciansRepository.findByUserId(input.userId);
        if (existing) {
            throw new ConflictException(
                "Ya existe un técnico asociado a este usuario"
            );
        }
        return this.techniciansRepository.create({
            userId: input.userId,
            rfc: input.rfc,
            nss: input.nss,
            bloodType: input.bloodType,
            allergies: input.allergies,
            emergencyContactName: input.emergencyContactName,
            emergencyContactPhone: input.emergencyContactPhone,
            emergencyContactRelationship: input.emergencyContactRelationship,
            birthDate: input.birthDate,
            address: input.address,
            education: input.education,
            childrenCount: input.childrenCount,
            shirtSize: input.shirtSize,
            pantsSize: input.pantsSize,
            shoeSize: input.shoeSize,
            transportRoute: input.transportRoute,
            hireDate: input.hireDate,
            vacationPeriod: input.vacationPeriod,
            positionId: input.positionId,
        });
    }

    async update(id: string, input: UpdateTechnicianInput): Promise<Technician> {
        await this.findByIdOrFail(id);

        const { id: _id, ...rest } = input;
        const updateData: Partial<Technician> = {};
        for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined) {
                (updateData as Record<string, unknown>)[key] = value;
            }
        }

        const updated = await this.techniciansRepository.update(id, updateData);
        if (!updated) {
            throw new NotFoundException("Técnico no encontrado después de actualizar");
        }
        return updated;
    }

    async deactivate(id: string): Promise<boolean> {
        await this.findByIdOrFail(id);
        await this.techniciansRepository.softDelete(id);
        return true;
    }

    async activate(id: string): Promise<Technician> {
        await this.techniciansRepository.restore(id);
        return this.findByIdOrFail(id);
    }
}
