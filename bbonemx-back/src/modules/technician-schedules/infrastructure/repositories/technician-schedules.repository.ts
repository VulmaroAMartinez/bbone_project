import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TechnicianSchedule } from '../../domain/entities';
import { ScheduleFiltersInput } from '../../application/dto';

@Injectable()
export class TechnicianSchedulesRepository {
    constructor(
        @InjectRepository(TechnicianSchedule)
        private readonly repository: Repository<TechnicianSchedule>,
    ) {}

    private baseQuery(): SelectQueryBuilder<TechnicianSchedule> {
        return this.repository
            .createQueryBuilder('ts')
            .leftJoinAndSelect('ts.technician', 'technician')
            .leftJoinAndSelect('technician.role', 'role')
            .leftJoinAndSelect('ts.shift', 'shift')
            .leftJoinAndSelect('ts.absenceReason', 'absenceReason')
            .where('ts.isActive = :active', { active: true });
    }

    async findAll(): Promise<TechnicianSchedule[]> {
        return this.baseQuery()
            .orderBy('ts.scheduleDate', 'ASC')
            .addOrderBy('technician.lastName', 'ASC')
            .getMany();
    }

    async findById(id: string): Promise<TechnicianSchedule | null> {
        return this.baseQuery()
            .andWhere('ts.id = :id', { id })
            .getOne();
    }

    async findByTechnicianAndDate(technicianId: string, scheduleDate: string): Promise<TechnicianSchedule | null> {
        return this.baseQuery()
            .andWhere('ts.technicianId = :technicianId', { technicianId })
            .andWhere('ts.scheduleDate = :scheduleDate', { scheduleDate })
            .getOne();
    }

    async findByWeek(weekNumber: number, year: number): Promise<TechnicianSchedule[]> {
        return this.baseQuery()
            .andWhere('ts.weekNumber = :weekNumber', { weekNumber })
            .andWhere('ts.year = :year', { year })
            .orderBy('ts.scheduleDate', 'ASC')
            .addOrderBy('technician.lastName', 'ASC')
            .getMany();
    }

    async findByTechnicianAndWeek(technicianId: string, weekNumber: number, year: number): Promise<TechnicianSchedule[]> {
        return this.baseQuery()
            .andWhere('ts.technicianId = :technicianId', { technicianId })
            .andWhere('ts.weekNumber = :weekNumber', { weekNumber })
            .andWhere('ts.year = :year', { year })
            .orderBy('ts.scheduleDate', 'ASC')
            .getMany();
    }

    async findWithFilters(filters: ScheduleFiltersInput): Promise<TechnicianSchedule[]> {
        const qb = this.baseQuery();

        if (filters.technicianId) {
            qb.andWhere('ts.technicianId = :technicianId', { technicianId: filters.technicianId });
        }

        if (filters.shiftId) {
            qb.andWhere('ts.shiftId = :shiftId', { shiftId: filters.shiftId });
        }

        if (filters.scheduleDate) {
            qb.andWhere('ts.scheduleDate = :scheduleDate', { scheduleDate: filters.scheduleDate });
        }

        if (filters.weekNumber) {
            qb.andWhere('ts.weekNumber = :weekNumber', { weekNumber: filters.weekNumber });
        }

        if (filters.year) {
            qb.andWhere('ts.year = :year', { year: filters.year });
        }

        if (filters.absenceReasonId) {
            qb.andWhere('ts.absenceReasonId = :absenceReasonId', { absenceReasonId: filters.absenceReasonId });
        }

        if (filters.onlyWorkDays) {
            qb.andWhere('ts.shiftId IS NOT NULL');
        }

        if (filters.onlyAbsences) {
            qb.andWhere('ts.absenceReasonId IS NOT NULL');
        }

        return qb
            .orderBy('ts.scheduleDate', 'ASC')
            .addOrderBy('technician.lastName', 'ASC')
            .getMany();
    }

    /**
     * Cuenta cuántas veces un motivo de ausencia fue asignado a un técnico en una semana.
     */
    async countAbsenceReasonInWeek(
        technicianId: string,
        absenceReasonId: string,
        weekNumber: number,
        year: number,
        excludeScheduleId?: string,
    ): Promise<number> {
        const qb = this.repository
            .createQueryBuilder('ts')
            .where('ts.technicianId = :technicianId', { technicianId })
            .andWhere('ts.absenceReasonId = :absenceReasonId', { absenceReasonId })
            .andWhere('ts.weekNumber = :weekNumber', { weekNumber })
            .andWhere('ts.year = :year', { year })
            .andWhere('ts.isActive = :active', { active: true });

        if (excludeScheduleId) {
            qb.andWhere('ts.id != :excludeId', { excludeId: excludeScheduleId });
        }

        return qb.getCount();
    }

    async create(data: Partial<TechnicianSchedule>): Promise<TechnicianSchedule> {
        const entity = this.repository.create(data);
        const saved = await this.repository.save(entity);
        return this.findById(saved.id) as Promise<TechnicianSchedule>;
    }

    async createMany(data: Partial<TechnicianSchedule>[]): Promise<TechnicianSchedule[]> {
        const entities = data.map(d => this.repository.create(d));
        const saved = await this.repository.save(entities);
        return Promise.all(saved.map(s => this.findById(s.id) as Promise<TechnicianSchedule>));
    }

    async update(id: string, data: Partial<TechnicianSchedule>): Promise<TechnicianSchedule | null> {
        const schedule = await this.repository.findOne({ where: { id } });
        if (!schedule) return null;
        Object.assign(schedule, data);
        await this.repository.save(schedule);
        return this.findById(id);
    }

    async softDelete(id: string): Promise<void> {
        const schedule = await this.repository.findOne({ where: { id } });
        if (!schedule) return;
        schedule.isActive = false;
        schedule.deletedAt = new Date();
        await this.repository.save(schedule);
    }

    async softDeleteByWeek(weekNumber: number, year: number, technicianId?: string): Promise<void> {
        const qb = this.repository
            .createQueryBuilder()
            .update(TechnicianSchedule)
            .set({ isActive: false, deletedAt: new Date() })
            .where('weekNumber = :weekNumber', { weekNumber })
            .andWhere('year = :year', { year })
            .andWhere('isActive = :active', { active: true });

        if (technicianId) {
            qb.andWhere('technicianId = :technicianId', { technicianId });
        }

        await qb.execute();
    }
}