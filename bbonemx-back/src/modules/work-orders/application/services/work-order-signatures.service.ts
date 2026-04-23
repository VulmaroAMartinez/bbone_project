import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { WorkOrderSignaturesRepository } from '../../infrastructure/repositories';
import { WorkOrdersRepository } from '../../infrastructure/repositories';
import { WorkOrderTechniciansRepository } from '../../infrastructure/repositories';
import { WorkOrderSignature, WorkOrder } from '../../domain/entities';
import { CreateWorkOrderSignatureInput } from '../dto';
import { WorkOrderStatus } from 'src/common';
import { User } from 'src/modules/users/domain/entities';

type SignatureSlot = 'REQUESTER_OR_ADMIN_REQUESTER' | 'TECHNICIAN' | 'ADMIN';

@Injectable()
export class WorkOrderSignaturesService {
  constructor(
    private readonly workOrderSignaturesRepository: WorkOrderSignaturesRepository,
    private readonly workOrdersRepository: WorkOrdersRepository,
    private readonly woTechniciansRepository: WorkOrderTechniciansRepository,
  ) {}

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

  async findByWorkOrderAndSigner(
    workOrderId: string,
    signerId: string,
  ): Promise<WorkOrderSignature | null> {
    return this.workOrderSignaturesRepository.findByWorkOrderAndSigner(
      workOrderId,
      signerId,
    );
  }

  async sign(
    input: CreateWorkOrderSignatureInput,
    user: User,
  ): Promise<WorkOrderSignature> {
    const wo = await this.workOrdersRepository.findById(input.workOrderId);

    if (!wo) throw new NotFoundException('OT no encontrada');

    if (
      wo.status !== WorkOrderStatus.FINISHED &&
      wo.status !== WorkOrderStatus.TEMPORARY_REPAIR
    )
      throw new BadRequestException('No se puede firmar la OT en este estado');

    if (wo.pendingConformity) {
      throw new BadRequestException(
        'La OT está pendiente de respuesta de conformidad del solicitante. Las firmas se habilitarán una vez que el solicitante acepte la conformidad.',
      );
    }

    const signatures =
      await this.workOrderSignaturesRepository.findByWorkOrderId(
        input.workOrderId,
      );
    const signerSlot = await this.resolveSignerSlot(wo, user, signatures);

    const hasSigned = await this.hasSignatureInSlot(wo, signatures, signerSlot);
    if (hasSigned) {
      throw new ConflictException('La firma para este rol ya fue registrada');
    }

    if (
      signerSlot === 'TECHNICIAN' &&
      !this.hasRequesterSignature(wo, signatures) &&
      !this.isRequesterAdmin(wo)
    ) {
      throw new ForbiddenException(
        'El solicitante debe firmar primero antes de que el técnico pueda firmar',
      );
    }

    if (
      signerSlot === 'ADMIN' &&
      (!(await this.hasTechnicianSignature(wo, signatures)) ||
        (!this.hasRequesterSignature(wo, signatures) &&
          !this.isRequesterAdmin(wo)))
    ) {
      throw new ForbiddenException(
        'La firma de administrador solo se permite después de solicitante y técnico',
      );
    }

    const userAlreadySigned =
      await this.workOrderSignaturesRepository.hasUserSigned(
        input.workOrderId,
        user.id,
      );
    if (userAlreadySigned && signerSlot !== 'ADMIN')
      throw new ConflictException('El usuario ya ha firmado la OT');

    const signature = await this.workOrderSignaturesRepository.create({
      workOrderId: input.workOrderId,
      signerId: user.id,
      signatureImagePath: input.signatureImagePath,
    });

    // Check if fully signed to update status to COMPLETED
    const isFullySigned = await this.isFullySigned(input.workOrderId);
    if (isFullySigned) {
      await this.workOrdersRepository.update(input.workOrderId, {
        status: WorkOrderStatus.COMPLETED,
      });
    }

    return signature;
  }

  async delete(id: string): Promise<void> {
    const signature = await this.findByIdOrFail(id);
    await this.workOrderSignaturesRepository.softDelete(signature.id);
  }

  async countByWorkOrderId(workOrderId: string): Promise<number> {
    return this.workOrderSignaturesRepository.countByWorkOrderId(workOrderId);
  }

  hasUserSigned(workOrderId: string, userId: string): Promise<boolean> {
    return this.workOrderSignaturesRepository.hasUserSigned(
      workOrderId,
      userId,
    );
  }

  async isFullySigned(workOrderId: string): Promise<boolean> {
    const wo = await this.workOrdersRepository.findById(workOrderId);
    if (!wo) return false;
    const signatures =
      await this.workOrderSignaturesRepository.findByWorkOrderId(workOrderId);

    const requesterSigned = this.hasRequesterSignature(wo, signatures);
    const technicianSigned = await this.hasTechnicianSignature(wo, signatures);

    if (this.isRequesterAdmin(wo)) {
      return requesterSigned && technicianSigned;
    }

    const adminSigned = await this.hasAdminSignature(wo, signatures);
    return requesterSigned && technicianSigned && adminSigned;
  }

  private async resolveSignerSlot(
    wo: WorkOrder,
    user: User,
    signatures: WorkOrderSignature[],
  ): Promise<SignatureSlot> {
    if (wo.requesterId === user.id) return 'REQUESTER_OR_ADMIN_REQUESTER';

    const isLead = await this.woTechniciansRepository.isTechnicianLead(
      wo.id,
      user.id,
    );
    if (isLead) {
      return 'TECHNICIAN';
    }

    const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(
      wo.id,
      user.id,
    );
    if (isAssigned) {
      throw new ForbiddenException(
        'Solo el técnico líder de la OT puede firmarla',
      );
    }

    if (user.isAdmin()) {
      if (this.isRequesterAdmin(wo)) {
        throw new ForbiddenException(
          'Cuando el solicitante es administrador, no se requiere firma de otro administrador',
        );
      }
      const requesterSigned = this.hasRequesterSignature(wo, signatures);
      if (!requesterSigned) {
        throw new ForbiddenException(
          'El solicitante debe firmar primero antes de que el administrador pueda firmar',
        );
      }
      return 'ADMIN';
    }

    throw new ForbiddenException(
      'Solo solicitante, técnico líder o administrador pueden firmar la OT',
    );
  }

  private isRequesterAdmin(wo: WorkOrder): boolean {
    return wo.requester?.isAdmin?.() ?? false;
  }

  private hasRequesterSignature(
    wo: WorkOrder,
    signatures: WorkOrderSignature[],
  ): boolean {
    return signatures.some((s) => s.signerId === wo.requesterId);
  }

  private async getLeadTechnicianId(
    workOrderId: string,
  ): Promise<string | null> {
    const rels =
      await this.woTechniciansRepository.findByWorkOrderId(workOrderId);
    return rels.find((r) => r.isLead)?.technicianId ?? null;
  }

  private async hasTechnicianSignature(
    wo: WorkOrder,
    signatures: WorkOrderSignature[],
  ): Promise<boolean> {
    const leadId = await this.getLeadTechnicianId(wo.id);
    if (!leadId) return false;
    return signatures.some((s) => s.signerId === leadId);
  }

  private async hasAdminSignature(
    wo: WorkOrder,
    signatures: WorkOrderSignature[],
  ): Promise<boolean> {
    const leadId = await this.getLeadTechnicianId(wo.id);
    return signatures.some((s) => {
      if (s.signerId === wo.requesterId) return false;
      if (leadId && s.signerId === leadId) return false;
      return s.signer?.isAdmin?.() ?? false;
    });
  }

  private async hasSignatureInSlot(
    wo: WorkOrder,
    signatures: WorkOrderSignature[],
    slot: SignatureSlot,
  ): Promise<boolean> {
    if (slot === 'REQUESTER_OR_ADMIN_REQUESTER') {
      return this.hasRequesterSignature(wo, signatures);
    }
    if (slot === 'TECHNICIAN') {
      return this.hasTechnicianSignature(wo, signatures);
    }
    return this.hasAdminSignature(wo, signatures);
  }
}
