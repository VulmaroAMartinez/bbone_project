import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { WorkOrderTechniciansRepository } from "../../infrastructure/repositories";
import { WorkOrderTechnician } from "../../domain/entities";
import { AssignTechnicianInput, UpdateTechnicianAssignmentInput } from "../dto";

@Injectable()
export class WorkOrderTechniciansService {
    constructor(private readonly woTechniciansRepository: WorkOrderTechniciansRepository) {}

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderTechnician[]> {
        return this.woTechniciansRepository.findByWorkOrderId(workOrderId);
    }

    async findByTechnicianId(technicianId: string): Promise<WorkOrderTechnician[]> {
        return this.woTechniciansRepository.findByTechnicianId(technicianId);
    }

    async findById(id: string): Promise<WorkOrderTechnician | null> {
        return this.woTechniciansRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<WorkOrderTechnician> {
        const woTechnician = await this.woTechniciansRepository.findById(id);
        if (!woTechnician) {
            throw new NotFoundException('Asignación de técnico no encontrada');
        }
        return woTechnician;
    }

    async findLead(workOrderId: string): Promise<WorkOrderTechnician | null> {
        return this.woTechniciansRepository.findLeadByWorkOrderId(workOrderId);
    }

    async assignMetadata(input: AssignTechnicianInput, userId: string): Promise<WorkOrderTechnician> {
        const existing = await this.woTechniciansRepository.findByWorkOrderAndTechnician(input.workOrderId, input.technicianId);
        
        if(existing) throw new ConflictException('El técnico ya está asignado a esta OT');

        if(input.isLead) await this.woTechniciansRepository.removeLeadFromAll(input.workOrderId);

        return this.woTechniciansRepository.create({
            workOrderId: input.workOrderId,
            technicianId: input.technicianId,
            isLead: input.isLead,
            assignedBy: userId,
        });
    }

    async updateAssignment(id: string, input: UpdateTechnicianAssignmentInput): Promise<WorkOrderTechnician> {
        const woTechnician = await this.findByIdOrFail(id);

        if(input.isLead) await this.woTechniciansRepository.removeLeadFromAll(woTechnician.workOrderId);

        const updated = await this.woTechniciansRepository.update(id, {
            ...input
        });

        return updated!;
    }

    async setAsLead(workOrderId: string, technicianId: string): Promise<WorkOrderTechnician> {
        const assignment = await this.woTechniciansRepository.findByWorkOrderAndTechnician(workOrderId, technicianId);

        if(!assignment) throw new NotFoundException('Asignación de técnico no encontrada');

        await this.woTechniciansRepository.removeLeadFromAll(workOrderId);

        const updated = await this.woTechniciansRepository.update(assignment.id, {
            isLead: true,
        });

        return updated!;
    }

    async unassign(workOrderId: string, technicianId: string): Promise<void> {
        const assignment = await this.woTechniciansRepository.findByWorkOrderAndTechnician(workOrderId, technicianId);

        if(!assignment) throw new NotFoundException('Asignación de técnico no encontrada');

        const count = await this.woTechniciansRepository.countByWorkOrderId(workOrderId);

        if(count <= 1) throw new BadRequestException('No se puede desasignar el único técnico asignado a la OT');

        await this.woTechniciansRepository.softDelete(assignment.id);
    }

    async isTechnicianAssigned(workOrderId: string, technicianId: string): Promise<boolean> {
        return this.woTechniciansRepository.isTechnicianAssigned(workOrderId, technicianId);
    }

    async countByWorkOrderId(workOrderId: string): Promise<number> {
        return this.woTechniciansRepository.countByWorkOrderId(workOrderId);
    }
}