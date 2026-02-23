import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { TechnicianSchedulesRepository } from '../../infrastructure/repositories';
import { TechnicianSchedule } from '../../domain/entities';
import {
    CreateScheduleInput,
    UpdateScheduleInput,
    AssignWeekScheduleInput,
    CopyWeekSchedulesInput,
    ScheduleFiltersInput,
} from '../dto';
import { AbsenceReasonsService } from 'src/modules/catalogs';
import { DateUtil } from 'src/common';

@Injectable()
export class TechnicianSchedulesService {
    constructor(
        private readonly schedulesRepository: TechnicianSchedulesRepository,
        private readonly absenceReasonsService: AbsenceReasonsService,
    ) {}

    // =============================== QUERIES ===============================

    async findAll(): Promise<TechnicianSchedule[]> {
        return this.schedulesRepository.findAll();
    }

    async findById(id: string): Promise<TechnicianSchedule | null> {
        return this.schedulesRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<TechnicianSchedule> {
        const schedule = await this.schedulesRepository.findById(id);
        if (!schedule) {
            throw new NotFoundException('Asignación de horario no encontrada');
        }
        return schedule;
    }

    /**
     * Obtiene los horarios de una semana completa.
     * Uso: Vista semanal del admin con todos los técnicos.
     */
    async findByWeek(weekNumber: number, year: number): Promise<TechnicianSchedule[]> {
        return this.schedulesRepository.findByWeek(weekNumber, year);
    }

    /**
     * Obtiene los horarios de un técnico en una semana específica.
     * Uso: Vista detalle de un técnico.
     */
    async findByTechnicianAndWeek(technicianId: string, weekNumber: number, year: number): Promise<TechnicianSchedule[]> {
        return this.schedulesRepository.findByTechnicianAndWeek(technicianId, weekNumber, year);
    }

    /**
     * Consulta con filtros avanzados.
     * Uso: Quién trabaja en un día específico, quién trabaja en un turno específico.
     */
    async findWithFilters(filters: ScheduleFiltersInput): Promise<TechnicianSchedule[]> {
        return this.schedulesRepository.findWithFilters(filters);
    }

    // =============================== MUTATIONS ===============================

    /**
     * Asigna un turno o ausencia a un técnico para un día específico.
     * Valida:
     *  - Que no exista ya una asignación activa para ese día.
     *  - Que se envíe shiftId O absenceReasonId (no ambos, no ninguno).
     *  - Regla de Descanso: máximo 2 por semana.
     *  - Regla de maxPerWeek si el motivo de ausencia lo tiene configurado.
     */
    async create(input: CreateScheduleInput): Promise<TechnicianSchedule> {
        await this.validateScheduleInput(input.shiftId, input.absenceReasonId);

        const existing = await this.schedulesRepository.findByTechnicianAndDate(
            input.technicianId,
            input.scheduleDate,
        );

        if (existing) {
            throw new ConflictException(
                `El técnico ya tiene una asignación para la fecha ${input.scheduleDate}. Use la mutación de actualización o elimine la existente.`,
            );
        }

        const { weekNumber, year } = DateUtil.getWeekAndYear(new Date(input.scheduleDate));

        if (input.absenceReasonId) {
            await this.validateAbsenceReasonLimit(
                input.technicianId,
                input.absenceReasonId,
                weekNumber,
                year,
            );
        }

        return this.schedulesRepository.create({
            technicianId: input.technicianId,
            scheduleDate: new Date(input.scheduleDate),
            weekNumber,
            year,
            shiftId: input.shiftId || undefined,
            absenceReasonId: input.absenceReasonId || undefined,
            notes: input.notes,
        });
    }

    /**
     * Asigna la semana completa de un técnico (batch).
     * Reemplaza las asignaciones existentes para esa semana/técnico.
     */
    async assignWeek(input: AssignWeekScheduleInput): Promise<TechnicianSchedule[]> {
        // Validar cada día
        for (const day of input.days) {
            await this.validateScheduleInput(day.shiftId, day.absenceReasonId);
        }

        // Contar ausencias por tipo en la semana que se está asignando
        const absenceCountMap = new Map<string, number>();
        for (const day of input.days) {
            if (day.absenceReasonId) {
                const current = absenceCountMap.get(day.absenceReasonId) || 0;
                absenceCountMap.set(day.absenceReasonId, current + 1);
            }
        }

        // Validar límites de ausencia para todo el batch
        for (const [absenceReasonId, count] of absenceCountMap.entries()) {
            const reason = await this.absenceReasonsService.findByIdOrFail(absenceReasonId);
            if (reason.maxPerWeek && reason.maxPerWeek > 0 && count > reason.maxPerWeek) {
                throw new BadRequestException(
                    `El motivo de ausencia "${reason.name}" permite máximo ${reason.maxPerWeek} veces por semana. Se intentan asignar ${count}.`,
                );
            }
        }

        // Soft-delete las asignaciones existentes de la semana para este técnico
        await this.schedulesRepository.softDeleteByWeek(
            input.weekNumber,
            input.year,
            input.technicianId,
        );

        // Crear las nuevas asignaciones
        const schedulesData = input.days.map(day => ({
            technicianId: input.technicianId,
            scheduleDate: new Date(day.scheduleDate),
            weekNumber: input.weekNumber,
            year: input.year,
            shiftId: day.shiftId || undefined,
            absenceReasonId: day.absenceReasonId || undefined,
            notes: day.notes,
        }));

        return this.schedulesRepository.createMany(schedulesData);
    }

    /**
     * Actualiza una asignación existente.
     * Valida las mismas reglas de negocio.
     */
    async update(id: string, input: UpdateScheduleInput): Promise<TechnicianSchedule> {
        const schedule = await this.findByIdOrFail(id);

        const shiftId = input.shiftId !== undefined ? input.shiftId : schedule.shiftId;
        const absenceReasonId = input.absenceReasonId !== undefined ? input.absenceReasonId : schedule.absenceReasonId;

        await this.validateScheduleInput(shiftId, absenceReasonId);

        if (absenceReasonId) {
            await this.validateAbsenceReasonLimit(
                schedule.technicianId,
                absenceReasonId,
                schedule.weekNumber,
                schedule.year,
                id, // Excluir la asignación actual del conteo
            );
        }

        const updateData: Partial<TechnicianSchedule> = {};
        if (input.shiftId !== undefined) {
            updateData.shiftId = input.shiftId || undefined;
            updateData.absenceReasonId = undefined; // Si asigna turno, quita ausencia
        }
        if (input.absenceReasonId !== undefined) {
            updateData.absenceReasonId = input.absenceReasonId || undefined;
            updateData.shiftId = undefined; // Si asigna ausencia, quita turno
        }
        if (input.notes !== undefined) {
            updateData.notes = input.notes;
        }

        const updated = await this.schedulesRepository.update(id, updateData);
        if (!updated) {
            throw new NotFoundException('Asignación no encontrada después de actualizar');
        }
        return updated;
    }

    /**
     * Copia los horarios de una semana a otra.
     * Uso: Reasignar turnos (copiar semana 1 a semana 2).
     */
    async copyWeek(input: CopyWeekSchedulesInput): Promise<TechnicianSchedule[]> {
        if (input.sourceWeekNumber === input.targetWeekNumber && input.sourceYear === input.targetYear) {
            throw new BadRequestException('La semana origen y destino no pueden ser la misma');
        }

        // Obtener horarios de la semana origen
        let sourceSchedules: TechnicianSchedule[];
        if (input.technicianId) {
            sourceSchedules = await this.schedulesRepository.findByTechnicianAndWeek(
                input.technicianId,
                input.sourceWeekNumber,
                input.sourceYear,
            );
        } else {
            sourceSchedules = await this.schedulesRepository.findByWeek(
                input.sourceWeekNumber,
                input.sourceYear,
            );
        }

        if (sourceSchedules.length === 0) {
            throw new BadRequestException('No hay horarios en la semana origen para copiar');
        }

        // Soft-delete los horarios existentes de la semana destino
        await this.schedulesRepository.softDeleteByWeek(
            input.targetWeekNumber,
            input.targetYear,
            input.technicianId,
        );

        // Calcular el offset de días entre semanas
        const sourceDates = sourceSchedules.map(s => new Date(s.scheduleDate));
        const targetWeekStart = DateUtil.getWeekStartDate(input.targetWeekNumber, input.targetYear);
        const sourceWeekStart = DateUtil.getWeekStartDate(input.sourceWeekNumber, input.sourceYear);
        const dayOffset = Math.round((targetWeekStart.getTime() - sourceWeekStart.getTime()) / (1000 * 60 * 60 * 24));

        // Crear nuevas asignaciones con las fechas ajustadas
        const newSchedulesData = sourceSchedules.map(s => {
            const originalDate = new Date(s.scheduleDate);
            const newDate = new Date(originalDate);
            newDate.setDate(newDate.getDate() + dayOffset);

            return {
                technicianId: s.technicianId,
                scheduleDate: newDate,
                weekNumber: input.targetWeekNumber,
                year: input.targetYear,
                shiftId: s.shiftId || undefined,
                absenceReasonId: s.absenceReasonId || undefined,
                notes: s.notes,
            };
        });

        return this.schedulesRepository.createMany(newSchedulesData);
    }

    /**
     * Elimina (soft-delete) una asignación de horario.
     */
    async delete(id: string): Promise<boolean> {
        await this.findByIdOrFail(id);
        await this.schedulesRepository.softDelete(id);
        return true;
    }

    // =============================== VALIDACIONES ===============================

    /**
     * Valida que se envíe shiftId O absenceReasonId (mutuamente excluyentes, al menos uno requerido).
     */
    private async validateScheduleInput(shiftId?: string, absenceReasonId?: string): Promise<void> {
        if (shiftId && absenceReasonId) {
            throw new BadRequestException(
                'No se puede asignar un turno y un motivo de ausencia al mismo tiempo. Envíe solo uno.',
            );
        }

        if (!shiftId && !absenceReasonId) {
            throw new BadRequestException(
                'Debe asignar un turno (shiftId) o un motivo de ausencia (absenceReasonId).',
            );
        }
    }

    /**
     * Valida el límite de ausencias por semana.
     * Principalmente para "Descanso" que tiene maxPerWeek = 2.
     */
    private async validateAbsenceReasonLimit(
        technicianId: string,
        absenceReasonId: string,
        weekNumber: number,
        year: number,
        excludeScheduleId?: string,
    ): Promise<void> {
        const reason = await this.absenceReasonsService.findByIdOrFail(absenceReasonId);

        if (!reason.maxPerWeek || reason.maxPerWeek <= 0) {
            return; // Sin límite → asignación libre
        }

        const currentCount = await this.schedulesRepository.countAbsenceReasonInWeek(
            technicianId,
            absenceReasonId,
            weekNumber,
            year,
            excludeScheduleId,
        );

        if (currentCount >= reason.maxPerWeek) {
            throw new BadRequestException(
                `El motivo de ausencia "${reason.name}" ya fue asignado ${currentCount} veces esta semana. Máximo permitido: ${reason.maxPerWeek}.`,
            );
        }
    }
}