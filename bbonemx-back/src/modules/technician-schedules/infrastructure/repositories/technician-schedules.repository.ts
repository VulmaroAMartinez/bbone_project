import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DataSource } from 'typeorm';
import { TechnicianSchedule } from '../../domain/entities';
import { ScheduleFiltersInput } from '../../application/dto';

@Injectable()
export class TechnicianSchedulesRepository {
  constructor(
    @InjectRepository(TechnicianSchedule)
    private readonly repository: Repository<TechnicianSchedule>,
    private readonly dataSource: DataSource,
  ) {}

  private baseQuery(): SelectQueryBuilder<TechnicianSchedule> {
    return this.repository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.technician', 'technician')
      .leftJoinAndSelect('technician.userRoles', 'technicianUserRoles')
      .leftJoinAndSelect('technicianUserRoles.role', 'technicianRole')
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

  async findAllWithDeleted(): Promise<TechnicianSchedule[]> {
    return this.repository.find({
      withDeleted: true,
      relations: ['technician', 'technician.role', 'shift', 'absenceReason'],
      order: { scheduleDate: 'ASC' },
    });
  }

  async findById(id: string): Promise<TechnicianSchedule | null> {
    return this.baseQuery().andWhere('ts.id = :id', { id }).getOne();
  }

  async findByTechnicianAndDate(
    technicianId: string,
    scheduleDate: string,
  ): Promise<TechnicianSchedule | null> {
    return this.baseQuery()
      .andWhere('ts.technicianId = :technicianId', { technicianId })
      .andWhere('ts.scheduleDate = :scheduleDate', { scheduleDate })
      .getOne();
  }

  async findByWeek(
    weekNumber: number,
    year: number,
  ): Promise<TechnicianSchedule[]> {
    return this.baseQuery()
      .andWhere('ts.weekNumber = :weekNumber', { weekNumber })
      .andWhere('ts.year = :year', { year })
      .orderBy('ts.scheduleDate', 'ASC')
      .addOrderBy('technician.lastName', 'ASC')
      .getMany();
  }

  async findByTechnicianAndWeek(
    technicianId: string,
    weekNumber: number,
    year: number,
  ): Promise<TechnicianSchedule[]> {
    return this.baseQuery()
      .andWhere('ts.technicianId = :technicianId', { technicianId })
      .andWhere('ts.weekNumber = :weekNumber', { weekNumber })
      .andWhere('ts.year = :year', { year })
      .orderBy('ts.scheduleDate', 'ASC')
      .getMany();
  }

  async findWithFilters(
    filters: ScheduleFiltersInput,
  ): Promise<TechnicianSchedule[]> {
    const qb = this.baseQuery();

    if (filters.technicianId) {
      qb.andWhere('ts.technicianId = :technicianId', {
        technicianId: filters.technicianId,
      });
    }

    if (filters.shiftId) {
      qb.andWhere('ts.shiftId = :shiftId', { shiftId: filters.shiftId });
    }

    if (filters.scheduleDate) {
      qb.andWhere('ts.scheduleDate = :scheduleDate', {
        scheduleDate: filters.scheduleDate,
      });
    }

    if (filters.weekNumber) {
      qb.andWhere('ts.weekNumber = :weekNumber', {
        weekNumber: filters.weekNumber,
      });
    }

    if (filters.year) {
      qb.andWhere('ts.year = :year', { year: filters.year });
    }

    if (filters.absenceReasonId) {
      qb.andWhere('ts.absenceReasonId = :absenceReasonId', {
        absenceReasonId: filters.absenceReasonId,
      });
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

  async createMany(
    data: Partial<TechnicianSchedule>[],
  ): Promise<TechnicianSchedule[]> {
    const entities = data.map((d) => this.repository.create(d));
    const saved = await this.repository.save(entities);
    return Promise.all(
      saved.map((s) => this.findById(s.id) as Promise<TechnicianSchedule>),
    );
  }

  async update(
    id: string,
    data: Partial<TechnicianSchedule>,
  ): Promise<TechnicianSchedule | null> {
    const schedule = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!schedule) return null;
    Object.assign(schedule, data);
    await this.repository.save(schedule);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    const schedule = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!schedule) return;
    schedule.isActive = false;
    schedule.deletedAt = new Date();
    await this.repository.save(schedule);
  }

  async softDeleteByWeek(
    weekNumber: number,
    year: number,
    technicianId?: string,
  ): Promise<void> {
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

  // ===================== NUEVOS MÉTODOS PARA UPSERT =====================

  /**
   * Obtiene TODOS los registros activos de un técnico para una semana,
   * indexados por scheduleDate (string YYYY-MM-DD).
   */
  async findActiveByTechnicianAndWeekMap(
    technicianId: string,
    weekNumber: number,
    year: number,
  ): Promise<Map<string, TechnicianSchedule>> {
    const records = await this.repository
      .createQueryBuilder('ts')
      .where('ts.technicianId = :technicianId', { technicianId })
      .andWhere('ts.weekNumber = :weekNumber', { weekNumber })
      .andWhere('ts.year = :year', { year })
      .andWhere('ts.isActive = :active', { active: true })
      .getMany();

    const map = new Map<string, TechnicianSchedule>();
    for (const r of records) {
      const dateKey =
        r.scheduleDate instanceof Date
          ? r.scheduleDate.toISOString().split('T')[0]
          : String(r.scheduleDate);
      map.set(dateKey, r);
    }
    return map;
  }

  /**
   * Ejecuta la lógica de upsert semanal dentro de una transacción.
   *
   * - Días con asignación: UPDATE si existe, CREATE si no.
   * - Días que antes tenían asignación pero ahora son "Libre": soft-delete solo esos.
   * - Todo atómico: si falla algo, se revierte todo.
   */
  async upsertWeekSchedule(
    technicianId: string,
    weekNumber: number,
    year: number,
    days: Array<{
      scheduleDate: string;
      shiftId?: string;
      absenceReasonId?: string;
      notes?: string;
    }>,
  ): Promise<TechnicianSchedule[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repo = queryRunner.manager.getRepository(TechnicianSchedule);

      // 1. Obtener registros activos existentes para esta semana/técnico
      const existingRecords = await repo
        .createQueryBuilder('ts')
        .where('ts.technicianId = :technicianId', { technicianId })
        .andWhere('ts.weekNumber = :weekNumber', { weekNumber })
        .andWhere('ts.year = :year', { year })
        .andWhere('ts.isActive = :active', { active: true })
        .getMany();

      const existingMap = new Map<string, TechnicianSchedule>();
      for (const r of existingRecords) {
        const dateKey =
          r.scheduleDate instanceof Date
            ? r.scheduleDate.toISOString().split('T')[0]
            : String(r.scheduleDate);
        existingMap.set(dateKey, r);
      }

      // 2. Set de fechas que vienen en el payload (días con asignación)
      const incomingDates = new Set(days.map((d) => d.scheduleDate));

      // 3. Soft-delete días que tenían asignación pero ya no (ahora son "Libre")
      const datesToRemove = [...existingMap.entries()]
        .filter(([dateStr]) => !incomingDates.has(dateStr))
        .map(([, entity]) => entity);

      if (datesToRemove.length > 0) {
        const idsToRemove = datesToRemove.map((e) => e.id);
        await repo
          .createQueryBuilder()
          .update(TechnicianSchedule)
          .set({ isActive: false, deletedAt: new Date() })
          .whereInIds(idsToRemove)
          .execute();
      }

      // 4. Upsert cada día del payload
      const resultIds: string[] = [];

      for (const day of days) {
        const existing = existingMap.get(day.scheduleDate);

        if (existing) {
          existing.shiftId = day.shiftId || (null as any);
          existing.absenceReasonId = day.absenceReasonId || (null as any);
          await repo.save(existing);
          resultIds.push(existing.id);
        } else {
          const newEntity = repo.create({
            technicianId,
            scheduleDate: day.scheduleDate as any,
            weekNumber,
            year,
            shiftId: day.shiftId || undefined,
            absenceReasonId: day.absenceReasonId || undefined,
          });
          const saved = await repo.save(newEntity);
          resultIds.push(saved.id);
        }
      }

      await queryRunner.commitTransaction();

      // 5. Retornar los registros con relaciones cargadas
      if (resultIds.length === 0) return [];
      return this.baseQuery()
        .andWhere('ts.id IN (:...ids)', { ids: resultIds })
        .orderBy('ts.scheduleDate', 'ASC')
        .getMany();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
