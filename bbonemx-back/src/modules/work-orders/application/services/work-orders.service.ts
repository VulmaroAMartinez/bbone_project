import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger
} from "@nestjs/common";
import { WorkOrdersRepository } from "../../infrastructure/repositories";
import { WorkOrderTechniciansRepository } from "../../infrastructure/repositories";
import { WorkOrderSignaturesRepository } from "../../infrastructure/repositories";
import { WorkOrder } from "../../domain/entities";
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
} from "../dto";
import { WorkOrderStatus, StopType } from "src/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
    NOTIFICATION_EVENTS,
    WorkOrderAssignedEvent,
    WorkOrderCompletedEvent,
} from "src/common";
import { AreasService } from "src/modules/catalogs/areas/application/services";
import { AreaType } from "src/common/enums/area-type.enum";

/** Allowed status transitions */
const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    [WorkOrderStatus.PENDING]: [WorkOrderStatus.IN_PROGRESS],
    [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.PAUSED, WorkOrderStatus.COMPLETED, WorkOrderStatus.TEMPORARY_REPAIR],
    [WorkOrderStatus.PAUSED]: [WorkOrderStatus.IN_PROGRESS],
    [WorkOrderStatus.COMPLETED]: [],
    [WorkOrderStatus.TEMPORARY_REPAIR]: [],
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
    ) { }

    async findAll(): Promise<WorkOrder[]> {
        return this.workOrdersRepository.findAll();
    }

    async findById(id: string): Promise<WorkOrder | null> {
        return this.workOrdersRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<WorkOrder> {
        const workOrder = await this.workOrdersRepository.findById(id);
        if (!workOrder) {
            throw new NotFoundException(`Orden de trabajo con ID ${id} no encontrada`);
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

    async findWithFilters(filters: WorkOrderFiltersInput, pagination: PaginationInput, sort: WorkOrderSortInput): Promise<{ data: WorkOrder[]; total: number }> {
        return this.workOrdersRepository.findWithFilters(filters, pagination, sort);
    }

    async getStatsByStatus(): Promise<{ status: string, count: number }[]> {
        return this.workOrdersRepository.getStatsByStatus();
    }

    async create(input: CreateWorkOrderInput, requesterId: string): Promise<WorkOrder> {
        // Validate Area/SubArea logic
        const area = await this.areasService.findByIdOrFail(input.areaId);
        if (area.type === AreaType.OPERATIONAL && !input.subAreaId) {
            throw new BadRequestException('Las áreas operativas requieren una sub-área');
        }

        const wo = await this.workOrdersRepository.create({
            ...input,
            requesterId,
            status: WorkOrderStatus.PENDING,
        });
        this.logger.log(`Folio: ${wo.folio}`);
        return wo;
    }

    async assign(id: string, input: AssignWorkOrderInput, userId: string): Promise<WorkOrder> {
        const wo = await this.findByIdOrFail(id);
        if (wo.status !== WorkOrderStatus.PENDING) throw new BadRequestException('Solo se puede asignar OT en estado Pendiente');

        if (input.stopType === StopType.BREAKDOWN && !input.machineId && !wo.machineId) {
            throw new BadRequestException('La máquina es requerida cuando el tipo de paro es Avería');
        }

        await this.workOrdersRepository.update(id, {
            priority: input.priority,
            maintenanceType: input.maintenanceType,
            stopType: input.stopType,
            assignedShiftId: input.assignedShiftId,
            ...(input.machineId && { machineId: input.machineId }),
        });

        await this.woTechniciansRepository.delete({workOrderId: id})

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

    async start(id: string, input: StartWorkOrderInput, technicianId: string): Promise<WorkOrder> {
        const wo = await this.findByIdOrFail(id);
        const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(id, technicianId);
        if (!isAssigned) throw new BadRequestException('El técnico no está asignado a la OT');
        if (!wo.canStart()) throw new BadRequestException('No se puede iniciar la OT en este estado');

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

    async pause(id: string, input: PauseWorkOrderInput, technicianId: string): Promise<WorkOrder> {
        const wo = await this.findByIdOrFail(id);
        const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(id, technicianId);
        if (!isAssigned) throw new BadRequestException('El técnico no está asignado a la OT');
        if (!wo.canPause()) throw new BadRequestException('No se puede pausar la OT en este estado');

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
        if (!wo.canResume()) throw new BadRequestException('No se puede reanudar la OT en este estado');

        await this.workOrdersRepository.update(id, {
            status: WorkOrderStatus.IN_PROGRESS,
        });

        return this.findByIdOrFail(id);
    }

    async complete(id: string, input: CompleteWorkOrderInput, technicianId: string): Promise<WorkOrder> {
        const wo = await this.findByIdOrFail(id);
        const isAssigned = await this.woTechniciansRepository.isTechnicianAssigned(id, technicianId);
        if (!isAssigned) throw new BadRequestException('El técnico no está asignado a la OT');
        if (!wo.canComplete()) throw new BadRequestException('No se puede completar la OT en este estado');


        const now = new Date();
        const segmentMinutes = this.calculateSegmentMinutes(wo.lastResumedAt, now);
        const functionalTImeMinutes = (wo.functionalTimeMinutes || 0) + segmentMinutes;

        await this.workOrdersRepository.update(id, {
            status: input.finalStatus,
            endDate: now,
            lastResumedAt: null,
            functionalTimeMinutes: functionalTImeMinutes,
            observations: input.observations,
            cause: input.cause,
            actionTaken: input.actionTaken,
            toolsUsed: input.toolsUsed,
            downtimeMinutes: input.downtimeMinutes,
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

        if ((nextStopType === StopType.BREAKDOWN || !!nextSubAreaId ) && !nextMachineId) {
            throw new BadRequestException('La máquina es requerida cuando el tipo de paro es Avería o la OTtiene sub-área');
        }

        await this.workOrdersRepository.update(id, {
            ...input,
            machineId: input.machineId,
        });
        return this.findByIdOrFail(id);
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

    async linkFinding(workOrderId: string, findingId: string): Promise<void> {
        await this.workOrdersRepository.update(workOrderId, { findingId });
    }

    private calculateSegmentMinutes(from?: Date | null, to: Date = new Date()): number {
        if(!from) return 0;
        return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60000));
    }

    /** Throws if the WO already has signatures (no edits allowed after signing) */
    private async ensureNotSigned(workOrderId: string): Promise<void> {
        const count = await this.woSignaturesRepository.countByWorkOrderId(workOrderId);
        if (count > 0) {
            throw new BadRequestException('No se puede modificar una OT que ya tiene firmas');
        }
    }
}
