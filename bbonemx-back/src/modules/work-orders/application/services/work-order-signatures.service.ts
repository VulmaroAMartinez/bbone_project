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

    // Validate signer is related to this WO
    await this.validateSignerRelationship(wo, user);

    const hasSigned = await this.workOrderSignaturesRepository.hasUserSigned(
      input.workOrderId,
      user.id,
    );
    if (hasSigned)
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
    const count = await this.countByWorkOrderId(workOrderId);
    const wo = await this.workOrdersRepository.findById(workOrderId);
    // Si el solicitante es admin → umbral 2 (técnico + admin)
    const required = wo?.requester?.isAdmin?.() ? 2 : 3;
    return count >= required;
  }

  private async validateSignerRelationship(
    wo: WorkOrder,
    user: User,
  ): Promise<void> {
    const requesterIsAdmin = wo.requester?.isAdmin?.() ?? false;

    // El solicitante siempre puede firmar primero
    if (wo.requesterId === user.id) return;

    // Para técnico líder y admin: la firma del solicitante debe ir primero
    // (excepto cuando el propio admin es el solicitante)
    if (!requesterIsAdmin) {
      const requesterSigned =
        await this.workOrderSignaturesRepository.hasUserSigned(
          wo.id,
          wo.requesterId,
        );
      if (!requesterSigned) {
        throw new ForbiddenException(
          'El solicitante debe firmar primero antes de que el técnico o el administrador puedan firmar',
        );
      }
    }

    if (user.isAdmin()) return;

    if (user.isTechnician() || user.isBoss()) {
      const isLead = await this.woTechniciansRepository.isTechnicianLead(
        wo.id,
        user.id,
      );
      if (isLead) return;

      const isAssigned =
        await this.woTechniciansRepository.isTechnicianAssigned(wo.id, user.id);
      if (isAssigned) {
        throw new ForbiddenException(
          'Solo el técnico líder de la OT puede firmarla',
        );
      }
    }

    throw new ForbiddenException(
      'Solo el solicitante, el técnico líder o un administrador pueden firmar la OT',
    );
  }
}
