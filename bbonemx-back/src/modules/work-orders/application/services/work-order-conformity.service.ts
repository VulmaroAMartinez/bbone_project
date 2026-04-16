import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkOrdersRepository } from '../../infrastructure/repositories/work-orders.repository';
import { WorkOrderConformityRecordsRepository } from '../../infrastructure/repositories/work-order-conformity-records.repository';
import { WorkOrderSignaturesRepository } from '../../infrastructure/repositories/work-order-signatures.repository';
import { WorkOrderTechniciansRepository } from '../../infrastructure/repositories/work-order-technicians.repository';
import { WorkOrderConformityRecord } from '../../domain/entities';
import { RespondConformityInput } from '../dto/conformity.dto';
import { WorkOrderStatus } from 'src/common';
import {
  NOTIFICATION_EVENTS,
  WorkOrderNonConformityEvent,
} from 'src/common/events/notification.events';
import { User } from 'src/modules/users/domain/entities';

@Injectable()
export class WorkOrderConformityService {
  private readonly logger = new Logger(WorkOrderConformityService.name);

  constructor(
    private readonly workOrdersRepository: WorkOrdersRepository,
    private readonly conformityRecordsRepository: WorkOrderConformityRecordsRepository,
    private readonly signaturesRepository: WorkOrderSignaturesRepository,
    private readonly techniciansRepository: WorkOrderTechniciansRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findByWorkOrderId(
    workOrderId: string,
  ): Promise<WorkOrderConformityRecord[]> {
    return this.conformityRecordsRepository.findByWorkOrderId(workOrderId);
  }

  /**
   * Responde el cuestionario de conformidad de una OT.
   *
   * Flujo:
   * - OT debe estar en FINISHED o TEMPORARY_REPAIR con pendingConformity = true
   * - Solo el solicitante o un ADMIN puede responder
   * - Conforme: pendingConformity = false → habilita firmas
   * - No conforme: guarda registro, incrementa ciclo, soft-delete firmas, regresa a IN_PROGRESS
   */
  async respondConformity(
    input: RespondConformityInput,
    user: User,
  ): Promise<WorkOrderConformityRecord> {
    const wo = await this.workOrdersRepository.findById(input.workOrderId);
    if (!wo) throw new NotFoundException('Orden de trabajo no encontrada');

    if (
      wo.status !== WorkOrderStatus.FINISHED &&
      wo.status !== WorkOrderStatus.TEMPORARY_REPAIR
    ) {
      throw new BadRequestException(
        'La OT debe estar en estado Finalizada o Reparación Temporal para responder conformidad',
      );
    }

    if (!wo.pendingConformity) {
      throw new BadRequestException(
        'La OT no está pendiente de respuesta de conformidad',
      );
    }

    // Solo el solicitante o admin puede responder
    if (wo.requesterId !== user.id && !user.isAdmin()) {
      throw new ForbiddenException(
        'Solo el solicitante o un administrador puede responder la conformidad',
      );
    }

    if (!input.isConforming) {
      if (!input.reason?.trim()) {
        throw new BadRequestException(
          'La razón de no conformidad es obligatoria',
        );
      }
      return this.handleNonConformity(wo.id, input, user.id);
    }

    return this.handleConformity(wo.id, input, user.id);
  }

  /** El solicitante está conforme → desbloquear firmas */
  private async handleConformity(
    workOrderId: string,
    input: RespondConformityInput,
    userId: string,
  ): Promise<WorkOrderConformityRecord> {
    const wo = await this.workOrdersRepository.findById(workOrderId);
    if (!wo) throw new NotFoundException('Orden de trabajo no encontrada');

    const cycleNumber = wo.conformityCycleCount + 1;

    const record = await this.conformityRecordsRepository.create({
      workOrderId,
      cycleNumber,
      question1Answer: input.question1Answer,
      question2Answer: input.question2Answer,
      question3Answer: input.question3Answer,
      isConforming: true,
      respondedById: userId,
      respondedAt: new Date(),
      previousStatus: wo.status,
    });

    // Desbloquear firmas: pendingConformity = false
    await this.workOrdersRepository.update(workOrderId, {
      pendingConformity: false,
    });

    this.logger.log(
      `OT ${wo.folio} — conformidad aceptada en ciclo ${cycleNumber}. Firmas habilitadas.`,
    );

    return record;
  }

  /** El solicitante NO está conforme → reiniciar OT */
  private async handleNonConformity(
    workOrderId: string,
    input: RespondConformityInput,
    userId: string,
  ): Promise<WorkOrderConformityRecord> {
    const wo = await this.workOrdersRepository.findById(workOrderId);
    if (!wo) throw new NotFoundException('Orden de trabajo no encontrada');

    const newCycleCount = wo.conformityCycleCount + 1;

    // 1. Guardar registro de no-conformidad
    const record = await this.conformityRecordsRepository.create({
      workOrderId,
      cycleNumber: newCycleCount,
      question1Answer: input.question1Answer,
      question2Answer: input.question2Answer,
      question3Answer: input.question3Answer,
      isConforming: false,
      reason: input.reason,
      respondedById: userId,
      respondedAt: new Date(),
      previousStatus: wo.status,
    });

    // 2. Soft-delete firmas del ciclo anterior (si las hubiera)
    await this.signaturesRepository.softDeleteAllByWorkOrderId(workOrderId);

    // 3. Regresar OT a IN_PROGRESS con fechas reiniciadas
    await this.workOrdersRepository.update(workOrderId, {
      status: WorkOrderStatus.IN_PROGRESS,
      pendingConformity: false,
      conformityCycleCount: newCycleCount,
      endDate: undefined,
      lastResumedAt: new Date(),
      functionalTimeMinutes: 0,
      newChangesDescription: undefined,
    });

    // 4. Notificar a técnicos asignados
    const technicians =
      await this.techniciansRepository.findByWorkOrderId(workOrderId);
    const technicianIds = technicians.map((t) => t.technicianId);

    if (technicianIds.length > 0) {
      this.eventEmitter.emit(
        NOTIFICATION_EVENTS.WORK_ORDER_NON_CONFORMITY,
        new WorkOrderNonConformityEvent(
          workOrderId,
          wo.folio,
          wo.description,
          technicianIds,
          input.reason!,
          newCycleCount,
        ),
      );
    }

    this.logger.log(
      `OT ${wo.folio} — no conformidad en ciclo ${newCycleCount}. Regresada a IN_PROGRESS.`,
    );

    return record;
  }
}
