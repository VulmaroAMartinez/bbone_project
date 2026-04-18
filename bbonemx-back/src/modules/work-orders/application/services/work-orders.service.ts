import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { WorkOrdersRepository } from '../../infrastructure/repositories';
import { WorkOrderTechniciansRepository } from '../../infrastructure/repositories';
import { WorkOrderSignaturesRepository } from '../../infrastructure/repositories';
import { WorkOrder } from '../../domain/entities';
import {
  CreateWorkOrderInput,
  UpdateWorkOrderInput,
  AssignWorkOrderInput,
  StartWorkOrderInput,
  PauseWorkOrderInput,
  CompleteWorkOrderInput,
  WorkOrderFiltersInput,
  PaginationInput,
  WorkOrderSortInput,
  BatchScheduleWorkOrdersInput,
} from '../dto';
import { WorkOrderStatus, StopType, MaintenanceType } from 'src/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NOTIFICATION_EVENTS,
  WorkOrderAssignedEvent,
  WorkOrderCompletedEvent,
} from 'src/common';
import { AreasService } from 'src/modules/catalogs/areas/application/services';
import { SubAreasService } from 'src/modules/catalogs/sub-areas/application/services';
import { TechnicianSchedulesService } from 'src/modules/technician-schedules/application/services';
import { ShiftsService } from 'src/modules/catalogs/shifts/application/services/shifts.service';
import { WorkOrderPhotosService } from './work-order-photos.service';
import { WorkOrderSparePartsService } from './work-order-spare-parts.service';
import { WorkOrderMaterialsService } from './work-order-materials.service';
import { WorkOrderPdfService } from './work-order-pdf.service';
/**
 * Grupos de turnos compatibles entre sí.
 * Los turnos dentro de un mismo grupo pueden asignarse a órdenes de trabajo del grupo.
 * Los nombres se comparan en UPPERCASE.
 */
const SHIFT_GROUPS: string[][] = [['TURNO 1', 'AVANZADA']];

/** Allowed status transitions */
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.PENDING]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.IN_PROGRESS]: [
    WorkOrderStatus.PAUSED,
    WorkOrderStatus.FINISHED,
    WorkOrderStatus.TEMPORARY_REPAIR,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.PAUSED]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.FINISHED]: [
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.IN_PROGRESS, // reinicio por no-conformidad (uso interno)
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.TEMPORARY_REPAIR]: [
    WorkOrderStatus.COMPLETED,
    WorkOrderStatus.IN_PROGRESS, // reinicio por no-conformidad (uso interno)
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.COMPLETED]: [],
  [WorkOrderStatus.CANCELLED]: [],
};

@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly workOrdersRepository: WorkOrdersRepository,
    private readonly woTechniciansRepository: WorkOrderTechniciansRepository,
    private readonly woSignaturesRepository: WorkOrderSignaturesRepository,
    private readonly areasService: AreasService,
    private readonly subAreasService: SubAreasService,
    private readonly technicianSchedulesService: TechnicianSchedulesService,
    private readonly shiftsService: ShiftsService,
    private readonly workOrderPhotosService: WorkOrderPhotosService,
    private readonly workOrderSparePartsService: WorkOrderSparePartsService,
    private readonly workOrderMaterialsService: WorkOrderMaterialsService,
    private readonly workOrderPdfService: WorkOrderPdfService,
  ) {}

  async findAll(): Promise<WorkOrder[]> {
    return this.workOrdersRepository.findAll();
  }

  async findAllWithDeleted(): Promise<WorkOrder[]> {
    return this.workOrdersRepository.findAllWithDeleted();
  }

  async findById(id: string): Promise<WorkOrder | null> {
    return this.workOrdersRepository.findById(id);
  }

  async findByIdOrFail(id: string): Promise<WorkOrder> {
    const workOrder = await this.workOrdersRepository.findById(id);
    if (!workOrder) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }
    return workOrder;
  }

  async findByFolio(folio: string): Promise<WorkOrder | null> {
    return this.workOrdersRepository.findByFolio(folio);
  }

  async findByTechnicianId(technicianId: string): Promise<WorkOrder[]> {
    return this.workOrdersRepository.findByTechnicianId(technicianId);
  }

  async findByRequesterId(requesterId: string): Promise<WorkOrder[]> {
    return this.workOrdersRepository.findByRequesterId(requesterId);
  }

  async findByMachineId(machineId: string): Promise<WorkOrder[]> {
    return this.workOrdersRepository.findByMachineId(machineId);
  }

  async findWithFilters(
    filters: WorkOrderFiltersInput,
    pagination: PaginationInput,
    sort: WorkOrderSortInput,
  ): Promise<{ data: WorkOrder[]; total: number }> {
    return this.workOrdersRepository.findWithFilters(filters, pagination, sort);
  }

  async getStatsByStatus(): Promise<{ status: string; count: number }[]> {
    return this.workOrdersRepository.getStatsByStatus();
  }

  async create(
    input: CreateWorkOrderInput,
    requesterId: string,
    requester?: import('src/modules/users/domain/entities').User,
  ): Promise<WorkOrder> {
    // Validar que el área exista
    await this.areasService.findByIdOrFail(input.areaId);

    if (input.subAreaId) {
      const subArea = await this.subAreasService.findByIdOrFail(
        input.subAreaId,
      );
      if (subArea.areaId !== input.areaId) {
        throw new BadRequestException(
          'La sub-área no pertenece al área seleccionada',
        );
      }
    }

    // Restricción de área para el solicitante
    if (requester?.areaId) {
      if (input.areaId !== requester.areaId) {
        throw new BadRequestException(
          'Solo puedes crear solicitudes para el área que tienes asignada',
        );
      }
      if (requester.subAreaId && input.subAreaId !== requester.subAreaId) {
        throw new BadRequestException(
          'Solo puedes crear solicitudes para la sub-área que tienes asignada',
        );
      }
    }

    // Límite de OTs pendientes de conformidad (solo REQUESTER)
    if (requester?.isRequester() && !requester.isAdmin()) {
      const pendingCount =
        await this.workOrdersRepository.countPendingConformityByRequester(
          requesterId,
        );
      if (pendingCount >= 10) {
        throw new BadRequestException(
          'Tienes 10 órdenes pendientes de evaluación de conformidad. Responde las evaluaciones antes de crear nuevas solicitudes.',
        );
      }
    }

    const wo = await this.workOrdersRepository.create({
      ...input,
      requesterId,
      status: WorkOrderStatus.PENDING,
    });
    this.logger.log(`Folio: ${wo.folio}`);
    return wo;
  }

  async assign(
    id: string,
    input: AssignWorkOrderInput,
    userId: string,
  ): Promise<WorkOrder> {
    const wo = await this.findByIdOrFail(id);
    if (wo.status !== WorkOrderStatus.PENDING)
      throw new BadRequestException(
        'Solo se puede asignar OT en estado Pendiente',
      );
    if (
      input.stopType === StopType.BREAKDOWN &&
      !input.machineId &&
      !wo.machineId
    ) {
      throw new BadRequestException(
        'La máquina es requerida cuando el tipo de paro es Avería',
      );
    }
    if (
      input.maintenanceType === MaintenanceType.CORRECTIVE_SCHEDULED &&
      !input.scheduledDate
    ) {
      throw new BadRequestException(
        'La fecha programada es requerida para mantenimiento correctivo programado',
      );
    }
    if (
      input.maintenanceType !== MaintenanceType.CORRECTIVE_SCHEDULED &&
      input.scheduledDate
    ) {
      throw new BadRequestException(
        'La fecha programada solo aplica para mantenimiento correctivo programado',
      );
    }
    if (input.assignedShiftId) {
      const validationDate = this.resolveScheduleValidationDate(
        input.scheduledDate,
      );

      for (const techId of input.technicianIds) {
        await this.ensureTechnicianAssignedToShift(
          techId,
          input.assignedShiftId,
          validationDate,
        );
      }
    }

    await this.workOrdersRepository.update(id, {
      priority: input.priority,
      maintenanceType: input.maintenanceType,
      stopType: input.stopType,
      assignedShiftId: input.assignedShiftId,
      scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
      workType: input.workType,
      ...(input.machineId && { machineId: input.machineId }),
    });

    await this.woTechniciansRepository.delete({ workOrderId: id });

    for (const techId of input.technicianIds) {
      const isLead = techId === input.leadTechnicianId;
      await this.woTechniciansRepository.create({
        workOrderId: id,
        technicianId: techId,
        isLead: isLead,
        assignedBy: userId,
      });
    }

    const updated = await this.findByIdOrFail(id);

    this.eventEmitter.emit(
      NOTIFICATION_EVENTS.WORK_ORDER_ASSIGNED,
      new WorkOrderAssignedEvent(
        updated.id,
        updated.folio,
        updated.description,
        input.technicianIds,
        userId,
      ),
    );
    return updated;
  }

  async start(
    id: string,
    input: StartWorkOrderInput,
    technicianId: string,
  ): Promise<WorkOrder> {
    const wo = await this.findByIdOrFail(id);
    const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(
      id,
      technicianId,
    );
    if (!isAssigned)
      throw new BadRequestException('El técnico no está asignado a la OT');
    const isLead = await this.woTechniciansRepository.isTechnicianLead(
      id,
      technicianId,
    );
    if (!isLead)
      throw new ForbiddenException('Solo el técnico líder puede iniciar la OT');
    if (!wo.canStart())
      throw new BadRequestException('No se puede iniciar la OT en este estado');

    const now = new Date();

    await this.workOrdersRepository.update(id, {
      status: WorkOrderStatus.IN_PROGRESS,
      startDate: now,
      lastResumedAt: now,
      functionalTimeMinutes: 0,
      breakdownDescription: input.breakdownDescription,
    });

    return this.findByIdOrFail(id);
  }

  async pause(
    id: string,
    input: PauseWorkOrderInput,
    technicianId: string,
  ): Promise<WorkOrder> {
    const wo = await this.findByIdOrFail(id);
    const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(
      id,
      technicianId,
    );
    if (!isAssigned)
      throw new BadRequestException('El técnico no está asignado a la OT');
    const isLead = await this.woTechniciansRepository.isTechnicianLead(
      id,
      technicianId,
    );
    if (!isLead)
      throw new ForbiddenException('Solo el técnico líder puede pausar la OT');
    if (!wo.canPause())
      throw new BadRequestException('No se puede pausar la OT en este estado');

    const now = new Date();
    const segmentMinutes = this.calculateSegmentMinutes(wo.lastResumedAt, now);

    await this.workOrdersRepository.update(id, {
      status: WorkOrderStatus.PAUSED,
      pauseReason: input.pauseReason,
      functionalTimeMinutes: (wo.functionalTimeMinutes || 0) + segmentMinutes,
      lastResumedAt: null,
    });

    return this.findByIdOrFail(id);
  }

  async resume(id: string): Promise<WorkOrder> {
    const wo = await this.findByIdOrFail(id);
    if (!wo.canResume())
      throw new BadRequestException(
        'No se puede reanudar la OT en este estado',
      );

    await this.workOrdersRepository.update(id, {
      status: WorkOrderStatus.IN_PROGRESS,
      lastResumedAt: new Date(),
    });

    return this.findByIdOrFail(id);
  }

  async complete(
    id: string,
    input: CompleteWorkOrderInput,
    technicianId: string,
  ): Promise<WorkOrder> {
    const wo = await this.findByIdOrFail(id);
    const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(
      id,
      technicianId,
    );
    if (!isAssigned)
      throw new BadRequestException('El técnico no está asignado a la OT');
    const isLead = await this.woTechniciansRepository.isTechnicianLead(
      id,
      technicianId,
    );
    if (!isLead)
      throw new ForbiddenException(
        'Solo el técnico líder puede finalizar la OT',
      );
    if (!wo.canComplete())
      throw new BadRequestException(
        'No se puede completar la OT en este estado',
      );

    // En re-trabajos (ciclo > 0) la descripción de cambios es obligatoria
    if (wo.conformityCycleCount > 0 && !input.newChangesDescription?.trim()) {
      throw new BadRequestException(
        'La descripción de nuevos cambios realizados es obligatoria en re-trabajos',
      );
    }

    const now = new Date();
    const segmentMinutes = this.calculateSegmentMinutes(wo.lastResumedAt, now);
    const functionalTImeMinutes =
      (wo.functionalTimeMinutes || 0) + segmentMinutes;

    await this.workOrdersRepository.update(id, {
      status: input.finalStatus,
      endDate: now,
      lastResumedAt: null,
      functionalTimeMinutes: functionalTImeMinutes,
      observations: input.observations,
      breakdownDescription: input.breakdownDescription,
      cause: input.cause,
      actionTaken: input.actionTaken,
      toolsUsed: input.toolsUsed,
      customSparePart: input.customSparePart ?? null,
      customMaterial: input.customMaterial ?? null,
      downtimeMinutes: input.downtimeMinutes,
      newChangesDescription: input.newChangesDescription ?? undefined,
      // Marcar como pendiente de conformidad del solicitante
      pendingConformity: true,
    });

    const updated = await this.findByIdOrFail(id);

    this.eventEmitter.emit(
      NOTIFICATION_EVENTS.WORK_ORDER_COMPLETED,
      new WorkOrderCompletedEvent(
        updated.id,
        updated.folio,
        updated.description,
        input.finalStatus,
        technicianId,
        updated.requesterId,
      ),
    );

    return updated;
  }

  async update(id: string, input: UpdateWorkOrderInput): Promise<WorkOrder> {
    const wo = await this.findByIdOrFail(id);
    await this.ensureNotSigned(id);

    const nextStopType = input.stopType ?? wo.stopType;
    const nextSubAreaId = wo.subAreaId;
    const nextMachineId = input.machineId ?? wo.machineId;

    if (
      (nextStopType === StopType.BREAKDOWN || !!nextSubAreaId) &&
      !nextMachineId
    ) {
      throw new BadRequestException(
        'La máquina es requerida cuando el tipo de paro es Avería o la OTtiene sub-área',
      );
    }

    const nextMaintenanceType = input.maintenanceType ?? wo.maintenanceType;
    const nextAssignedShiftId = input.assignedShiftId ?? wo.assignedShiftId;
    const nextScheduledDate =
      input.scheduledDate !== undefined
        ? input.scheduledDate
          ? new Date(input.scheduledDate)
          : null
        : (wo.scheduledDate ?? null);

    if (
      nextMaintenanceType === MaintenanceType.CORRECTIVE_SCHEDULED &&
      !nextScheduledDate
    ) {
      throw new BadRequestException(
        'La fecha programada es requerida para mantenimiento correctivo programado',
      );
    }

    if (
      nextMaintenanceType !== MaintenanceType.CORRECTIVE_SCHEDULED &&
      input.scheduledDate
    ) {
      throw new BadRequestException(
        'La fecha programada solo aplica para mantenimiento correctivo programado',
      );
    }

    if (nextAssignedShiftId) {
      const technicians =
        await this.woTechniciansRepository.findByWorkOrderId(id);
      const validationDate = this.resolveScheduleValidationDate(
        nextScheduledDate?.toISOString(),
      );
      for (const rel of technicians) {
        await this.ensureTechnicianAssignedToShift(
          rel.technicianId,
          nextAssignedShiftId,
          validationDate,
        );
      }
    }

    await this.workOrdersRepository.update(id, {
      ...input,
      machineId: input.machineId,
      scheduledDate:
        input.scheduledDate !== undefined
          ? input.scheduledDate
            ? new Date(input.scheduledDate)
            : null
          : undefined,
    });
    return this.findByIdOrFail(id);
  }

  async batchScheduleWorkOrders(
    input: BatchScheduleWorkOrdersInput,
  ): Promise<WorkOrder[]> {
    const results = await Promise.all(
      input.ids.map((id) =>
        this.update(id, {
          maintenanceType: MaintenanceType.CORRECTIVE_SCHEDULED,
          scheduledDate: input.scheduledDate,
        }),
      ),
    );
    return results;
  }

  async deactivate(id: string): Promise<boolean> {
    await this.findByIdOrFail(id);
    await this.workOrdersRepository.softDelete(id);
    return true;
  }

  async changeStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder> {
    const wo = await this.findByIdOrFail(id);
    await this.ensureNotSigned(id);

    const allowed = VALID_TRANSITIONS[wo.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Transición de estado inválida: ${wo.status} -> ${status}. Transiciones permitidas: ${allowed.join(', ') || 'ninguna'}`,
      );
    }

    await this.workOrdersRepository.update(id, { status });
    return this.findByIdOrFail(id);
  }

  async exportToPdf(id: string): Promise<string> {
    const workOrder = await this.workOrdersRepository.findByIdForPdf(id);
    if (!workOrder) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }

    const signaturesCount =
      await this.woSignaturesRepository.countByWorkOrderId(id);

    // Si el solicitante es admin, se requieren solo 2 firmas (técnico + admin)
    const requiredSignatures = workOrder.requester?.isAdmin?.() ? 2 : 3;
    if (signaturesCount < requiredSignatures) {
      throw new BadRequestException(
        `La orden de trabajo debe tener al menos ${requiredSignatures} firma(s) para exportar a PDF`,
      );
    }

    const [technicians, signatures, photos, spareParts, materials] =
      await Promise.all([
        this.woTechniciansRepository.findByWorkOrderId(id),
        this.woSignaturesRepository.findByWorkOrderId(id),
        this.workOrderPhotosService.findByWorkOrderId(id),
        this.workOrderSparePartsService.findByWorkOrderId(id),
        this.workOrderMaterialsService.findByWorkOrderId(id),
      ]);

    return this.workOrderPdfService.generatePdfBase64({
      workOrder,
      technicians,
      signatures,
      photos,
      spareParts,
      materials,
    });
  }

  async linkFinding(workOrderId: string, findingId: string): Promise<void> {
    await this.workOrdersRepository.update(workOrderId, { findingId });
  }

  private calculateSegmentMinutes(
    from?: Date | null,
    to: Date = new Date(),
  ): number {
    if (!from) return 0;
    return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60000));
  }

  private resolveScheduleValidationDate(scheduledDate?: string | null): string {
    if (scheduledDate) {
      return scheduledDate.split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }

  /** Returns the list of shift names compatible with the given shift name (uppercase). */
  private getCompatibleShiftNames(shiftName: string): string[] {
    const upper = shiftName.toUpperCase();
    const group = SHIFT_GROUPS.find((g) => g.includes(upper));
    return group ?? [upper];
  }

  private async ensureTechnicianAssignedToShift(
    technicianId: string,
    shiftId: string,
    scheduleDate: string,
  ): Promise<void> {
    const selectedShift = await this.shiftsService.findByIdOrFail(shiftId);
    const compatibleNames = this.getCompatibleShiftNames(selectedShift.name);

    const allShifts = await this.shiftsService.findAllActive();
    const compatibleShiftIds = allShifts
      .filter((s) => compatibleNames.includes(s.name.toUpperCase()))
      .map((s) => s.id);

    for (const compatibleShiftId of compatibleShiftIds) {
      const schedules = await this.technicianSchedulesService.findWithFilters({
        technicianId,
        shiftId: compatibleShiftId,
        scheduleDate,
        onlyWorkDays: true,
      });
      if (schedules.length) return;
    }

    throw new BadRequestException(
      'Solo se pueden asignar técnicos que pertenezcan al turno seleccionado para la fecha indicada',
    );
  }

  /** Throws if the WO already has signatures (no edits allowed after signing) */
  private async ensureNotSigned(workOrderId: string): Promise<void> {
    const count =
      await this.woSignaturesRepository.countByWorkOrderId(workOrderId);
    if (count > 0) {
      throw new BadRequestException(
        'No se puede modificar una OT que ya tiene firmas',
      );
    }
  }
}
