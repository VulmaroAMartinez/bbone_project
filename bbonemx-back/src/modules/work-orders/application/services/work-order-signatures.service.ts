import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { WorkOrderSignaturesRepository } from "../../infrastructure/repositories";
import { WorkOrdersRepository } from "../../infrastructure/repositories";
import { WorkOrderTechniciansRepository } from "../../infrastructure/repositories";
import { WorkOrderSignature, WorkOrder } from "../../domain/entities";
import { CreateWorkOrderSignatureInput } from "../dto";
import { WorkOrderStatus } from "src/common";
import { User } from "src/modules/users/domain/entities";

@Injectable()
export class WorkOrderSignaturesService {

    constructor(
        private readonly workOrderSignaturesRepository: WorkOrderSignaturesRepository,
        private readonly workOrdersRepository: WorkOrdersRepository,
        private readonly woTechniciansRepository: WorkOrderTechniciansRepository,
    ) { }

    async findByWorkOrderId(workOrderId: string): Promise<WorkOrderSignature[]> {
        return this.workOrderSignaturesRepository.findByWorkOrderId(workOrderId);
    }

    async findById(id: string): Promise<WorkOrderSignature | null> {
        return this.workOrderSignaturesRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<WorkOrderSignature> {
        const signature = await this.workOrderSignaturesRepository.findById(id);
        if (!signature) throw new NotFoundException('Firma de OT no encontrada');
        return signature;
    }

    async findByWorkOrderAndSigner(workOrderId: string, signerId: string): Promise<WorkOrderSignature | null> {
        return this.workOrderSignaturesRepository.findByWorkOrderAndSigner(workOrderId, signerId);
    }

    async sign(input: CreateWorkOrderSignatureInput, user: User): Promise<WorkOrderSignature> {
        const wo = await this.workOrdersRepository.findById(input.workOrderId);

        if (!wo) throw new NotFoundException('OT no encontrada');

        if (wo.status !== WorkOrderStatus.COMPLETED && wo.status !== WorkOrderStatus.TEMPORARY_REPAIR) throw new BadRequestException('No se puede firmar la OT en este estado');

        // Validate signer is related to this WO
        await this.validateSignerRelationship(wo, user);

        const hasSigned = await this.workOrderSignaturesRepository.hasUserSigned(input.workOrderId, user.id);
        if(hasSigned) throw new ConflictException('El usuario ya ha firmado la OT');

        return this.workOrderSignaturesRepository.create({
            workOrderId: input.workOrderId,
            signerId: user.id,
            signatureImagePath: input.signatureImagePath,
        });
    }

    async delete(id: string): Promise<void> {
        const signature = await this.findByIdOrFail(id);
        await this.workOrderSignaturesRepository.softDelete(signature.id);
    }

    async countByWorkOrderId(workOrderId: string): Promise<number> {
        return this.workOrderSignaturesRepository.countByWorkOrderId(workOrderId);
    }

    hasUserSigned(workOrderId: string, userId: string): Promise<boolean> {
        return this.workOrderSignaturesRepository.hasUserSigned(workOrderId, userId);
    }

    async isFullySigned(workOrderId: string): Promise<boolean> {
        const count = await this.countByWorkOrderId(workOrderId);
        return count >= 3;
    }

    /** Validate that the signer is the requester, an assigned technician, or an admin */
    private async validateSignerRelationship(wo: WorkOrder, user: User): Promise<void> {
        // Admins can always sign
        if (user.isAdmin()) return;

        // Requester can sign their own WO
        if (wo.requesterId === user.id) return;

        // Assigned technicians can sign
        if (user.isTechnician()) {
            const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(wo.id, user.id);
            if (isAssigned) return;
        }

        throw new ForbiddenException('Solo el solicitante, técnicos asignados o administradores pueden firmar la OT');
    }
}
