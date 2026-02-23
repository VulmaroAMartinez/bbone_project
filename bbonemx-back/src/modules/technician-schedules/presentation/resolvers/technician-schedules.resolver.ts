import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TechnicianSchedulesService } from '../../application/services';
import {
    CreateScheduleInput,
    UpdateScheduleInput,
    AssignWeekScheduleInput,
    CopyWeekSchedulesInput,
    ScheduleFiltersInput,
} from '../../application/dto';
import { TechnicianScheduleType, WeekScheduleSummaryType } from '../types';
import { JwtAuthGuard, RolesGuard, Roles, Role } from 'src/common';

@Resolver(() => TechnicianScheduleType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class TechnicianSchedulesResolver {
    constructor(private readonly schedulesService: TechnicianSchedulesService) {}

    // =============================== QUERIES ===============================

    @Query(() => [TechnicianScheduleType], {
        name: 'technicianSchedules',
        description: 'Obtiene todos los horarios de técnicos',
    })
    async findAll(): Promise<TechnicianScheduleType[]> {
        return this.schedulesService.findAll() as unknown as TechnicianScheduleType[];
    }

    @Query(() => TechnicianScheduleType, {
        name: 'technicianSchedule',
        nullable: true,
        description: 'Obtiene un horario por ID',
    })
    async findById(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<TechnicianScheduleType | null> {
        return this.schedulesService.findById(id) as unknown as TechnicianScheduleType | null;
    }

    @Query(() => WeekScheduleSummaryType, {
        name: 'weekSchedule',
        description: 'Obtiene los horarios de una semana completa con resumen',
    })
    async findByWeek(
        @Args('weekNumber', { type: () => Int }) weekNumber: number,
        @Args('year', { type: () => Int }) year: number,
    ): Promise<WeekScheduleSummaryType> {
        const schedules = await this.schedulesService.findByWeek(weekNumber, year);
        return {
            weekNumber,
            year,
            totalAssignments: schedules.length,
            totalWorkDays: schedules.filter(s => s.shiftId).length,
            totalAbsences: schedules.filter(s => s.absenceReasonId).length,
            schedules: schedules as unknown as TechnicianScheduleType[],
        };
    }

    @Query(() => [TechnicianScheduleType], {
        name: 'technicianWeekSchedule',
        description: 'Obtiene los horarios de un técnico en una semana específica',
    })
    async findByTechnicianAndWeek(
        @Args('technicianId', { type: () => ID }) technicianId: string,
        @Args('weekNumber', { type: () => Int }) weekNumber: number,
        @Args('year', { type: () => Int }) year: number,
    ): Promise<TechnicianScheduleType[]> {
        return this.schedulesService.findByTechnicianAndWeek(
            technicianId,
            weekNumber,
            year,
        ) as unknown as TechnicianScheduleType[];
    }

    @Query(() => [TechnicianScheduleType], {
        name: 'technicianSchedulesFiltered',
        description: 'Consulta horarios con filtros: por día, turno, técnico, semana, ausencia',
    })
    async findFiltered(
        @Args('filters') filters: ScheduleFiltersInput,
    ): Promise<TechnicianScheduleType[]> {
        return this.schedulesService.findWithFilters(filters) as unknown as TechnicianScheduleType[];
    }

    // =============================== MUTATIONS ===============================

    @Mutation(() => TechnicianScheduleType, {
        name: 'createTechnicianSchedule',
        description: 'Asigna un turno o ausencia a un técnico para un día específico',
    })
    async create(
        @Args('input') input: CreateScheduleInput,
    ): Promise<TechnicianScheduleType> {
        return this.schedulesService.create(input) as unknown as TechnicianScheduleType;
    }

    @Mutation(() => [TechnicianScheduleType], {
        name: 'assignWeekSchedule',
        description: 'Asigna la semana completa de un técnico (reemplaza asignaciones existentes)',
    })
    async assignWeek(
        @Args('input') input: AssignWeekScheduleInput,
    ): Promise<TechnicianScheduleType[]> {
        return this.schedulesService.assignWeek(input) as unknown as TechnicianScheduleType[];
    }

    @Mutation(() => TechnicianScheduleType, {
        name: 'updateTechnicianSchedule',
        description: 'Actualiza una asignación de horario existente',
    })
    async update(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: UpdateScheduleInput,
    ): Promise<TechnicianScheduleType> {
        return this.schedulesService.update(id, input) as unknown as TechnicianScheduleType;
    }

    @Mutation(() => [TechnicianScheduleType], {
        name: 'copyWeekSchedules',
        description: 'Copia los horarios de una semana a otra (reasignación)',
    })
    async copyWeek(
        @Args('input') input: CopyWeekSchedulesInput,
    ): Promise<TechnicianScheduleType[]> {
        return this.schedulesService.copyWeek(input) as unknown as TechnicianScheduleType[];
    }

    @Mutation(() => Boolean, {
        name: 'deleteTechnicianSchedule',
        description: 'Elimina (soft-delete) una asignación de horario',
    })
    async delete(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<boolean> {
        return this.schedulesService.delete(id);
    }
}