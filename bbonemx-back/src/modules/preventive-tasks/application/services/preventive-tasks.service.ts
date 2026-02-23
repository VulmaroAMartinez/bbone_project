import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { PreventiveTasksRepository } from "../../infrastructure/repositories";
import { WorkOrdersService } from "src/modules/work-orders";
import { PreventiveTask } from "../../domain/entities";
import {
    CreatePreventiveTaskInput,
    UpdatePreventiveTaskInput,
    ClosePreventiveTaskInput,
    PreventiveTaskFiltersInput,
    PreventiveTaskPaginationInput,
    PreventiveTaskSortInput,
} from '../dto';
import { PreventiveTaskStatus } from "src/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NOTIFICATION_EVENTS, PreventiveTaskWoGeneratedEvent } from "src/common";

@Injectable()
export class PreventiveTasksService {
    private readonly logger = new Logger(PreventiveTasksService.name);
    constructor(
        private readonly preventiveTasksRepository: PreventiveTasksRepository,
        private readonly workOrdersService: WorkOrdersService,
        private readonly eventEmitter: EventEmitter2
    ) { }

    findAll(): Promise<PreventiveTask[]> {
        return this.preventiveTasksRepository.findAll();
    }

    findAllActive(): Promise<PreventiveTask[]> {
        return this.preventiveTasksRepository.findAllActive();
    }

    findById(id: string): Promise<PreventiveTask | null> {
        return this.preventiveTasksRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<PreventiveTask> {
        const preventiveTask = await this.preventiveTasksRepository.findById(id);
        if (!preventiveTask) throw new NotFoundException('Tarea preventiva no encontrada');
        return preventiveTask;
    }

    findByMachineId(machineId: string): Promise<PreventiveTask[]> {
        return this.preventiveTasksRepository.findByMachineId(machineId);
    }

    findWithFilters(filters?: PreventiveTaskFiltersInput, pagination?: PreventiveTaskPaginationInput, sort?: PreventiveTaskSortInput): Promise<{ data: PreventiveTask[], total: number }> {
        return this.preventiveTasksRepository.findWithFilters(filters, pagination, sort);
    }

    getStatsByStatus(): Promise<{ status: string, count: number }[]> {
        return this.preventiveTasksRepository.getStatsByStatus();
    }

    countActive(): Promise<number> {
        return this.preventiveTasksRepository.countActive();
    }

    findUpcomingInDays(days: number): Promise<PreventiveTask[]> {
        return this.preventiveTasksRepository.findUpcomingInDays(days);
    }

    async create(input: CreatePreventiveTaskInput): Promise<PreventiveTask> {
        const startDate = new Date(input.startDate);

        const task = await this.preventiveTasksRepository.create({
            ...input,
            startDate,
            nextExecutionDate: startDate,
            status: PreventiveTaskStatus.ACTIVE,
            advanceHours: input.advanceHours || 24,
        });

        return task;
    }

    async update(id: string, input: UpdatePreventiveTaskInput): Promise<PreventiveTask> {
        const task = await this.findByIdOrFail(id);
        if (task.status === PreventiveTaskStatus.CLOSED) throw new BadRequestException('La tarea preventiva ya está cerrada');
        await this.preventiveTasksRepository.update(id, {
            ...input,
            nextExecutionDate: task.nextExecutionDate,
        });
        return this.findByIdOrFail(id);
    }

    async activate(id: string): Promise<PreventiveTask> {
        const task = await this.findByIdOrFail(id);
        if (task.status == PreventiveTaskStatus.CLOSED) throw new BadRequestException('La tarea preventiva ya está cerrada');
        await this.preventiveTasksRepository.update(id, {
            status: PreventiveTaskStatus.ACTIVE,
        });
        return this.findByIdOrFail(id);
    }

    async deactivate(id: string): Promise<PreventiveTask> {
        const task = await this.findByIdOrFail(id);
        if (task.status === PreventiveTaskStatus.CLOSED) throw new BadRequestException('La tarea preventiva ya está cerrada');
        await this.preventiveTasksRepository.update(id, {
            status: PreventiveTaskStatus.INACTIVE,
        });
        return this.findByIdOrFail(id);
    }

    async close(id: string, input: ClosePreventiveTaskInput): Promise<PreventiveTask> {
        const task = await this.findByIdOrFail(id);

        if (task.status === PreventiveTaskStatus.CLOSED) throw new BadRequestException('La tarea preventiva ya está cerrada');

        await this.preventiveTasksRepository.update(id, {
            status: PreventiveTaskStatus.CLOSED,
            endDate: new Date(),
            policyChangeNote: input.policyChangeNote,
        });

        if (input.createContinuation && input.continuationTask) {
            const continuationTask = await this.preventiveTasksRepository.create({
                ...input.continuationTask,
                startDate: new Date(input.continuationTask.startDate),
                nextExecutionDate: new Date(input.continuationTask.startDate),
                parentTaskId: id,
                status: PreventiveTaskStatus.ACTIVE,
                advanceHours: input.continuationTask.advanceHours || 24,
            });
        }
        return this.findByIdOrFail(id);
    }

    async delete(id: string): Promise<void> {
        const task = await this.findByIdOrFail(id);
        if (task.status === PreventiveTaskStatus.CLOSED) throw new BadRequestException('La tarea preventiva ya está cerrada');
        await this.preventiveTasksRepository.softDelete(id);
    }

    async generateDueWorkOrders(): Promise<{ generated: number; tasks: string[] }> {
        const tasks = await this.preventiveTasksRepository.findDueForExecution();
        const generatedTasks: string[] = [];

        for (const task of tasks) {
            try {
                await this.generateWorkOrderForTask(task);
                generatedTasks.push(task.id);
            } catch (error) {
                this.logger.error(`Error generating work order for task ${task.id}: ${error.message}`);
            }
        }
        return { generated: generatedTasks.length, tasks: generatedTasks };
    }

    async generateWorkOrderForTask(task: PreventiveTask): Promise<PreventiveTask> {
        if (!task.isPreventiveTaskActive())
            throw new BadRequestException('La tarea preventiva no está activa');

        const description = `[Mantenimiento Preventivo]\n${task.description}\n\nFrecuencia: ${task.getFrequencyDescription()}`;

        const wo = await this.workOrdersService.create({
            description,
            machineId: task.machineId,
            areaId: task.machine?.subArea?.areaId || "",
        }, task.createdBy || '');

        // ──── EMITIR NOTIFICACIÓN ────
        this.eventEmitter.emit(
            NOTIFICATION_EVENTS.PREVENTIVE_TASK_WO_GENERATED,
            new PreventiveTaskWoGeneratedEvent(
                task.id,
                wo.id,
                wo.folio,
                task.description,
            ),
        );

        task.advanceNextExecution();
        await this.preventiveTasksRepository.update(task.id, {
            nextExecutionDate: task.nextExecutionDate,
            lastWoGeneratedAt: new Date(),
        });
        return this.findByIdOrFail(task.id);
    }

    async recalculateNextExecution(id: string): Promise<PreventiveTask> {
        const task = await this.findByIdOrFail(id);

        const nextDate = task.calculateNextExecutionDate(new Date());

        const updated = await this.preventiveTasksRepository.update(id, {
            nextExecutionDate: nextDate,
        })

        return updated!;
    };
}