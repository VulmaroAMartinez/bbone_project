import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Overtime } from '../../domain/entities';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';

const RELATIONS = ['technician', 'technician.user', 'technician.position'];

@Injectable()
export class OvertimeRepository {
  constructor(
    @InjectRepository(Overtime)
    private readonly repository: Repository<Overtime>,
  ) {}

  private createBaseQuery(): SelectQueryBuilder<Overtime> {
    return this.repository
      .createQueryBuilder('overtime')
      .leftJoinAndSelect('overtime.technician', 'technician')
      .leftJoinAndSelect('technician.user', 'user')
      .leftJoinAndSelect('technician.position', 'position')
      .where('overtime.is_active = :active', { active: true });
  }

  private applyFilters(
    qb: SelectQueryBuilder<Overtime>,
    filters?: {
      startDate?: string;
      endDate?: string;
      technicianId?: string;
      positionId?: string;
      reasonForPayment?: ReasonForPayment;
    },
  ): void {
    if (!filters) return;

    if (filters.technicianId) {
      qb.andWhere('overtime.technician_id = :technicianId', {
        technicianId: filters.technicianId,
      });
    }
    if (filters.reasonForPayment) {
      qb.andWhere('overtime.reason_for_payment = :reasonForPayment', {
        reasonForPayment: filters.reasonForPayment,
      });
    }
    if (filters.positionId) {
      qb.andWhere('technician.position_id = :positionId', {
        positionId: filters.positionId,
      });
    }
    if (filters.startDate) {
      qb.andWhere('overtime.work_date >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      qb.andWhere('overtime.work_date <= :endDate', {
        endDate: filters.endDate,
      });
    }
  }

  private applyDefaultOrder(qb: SelectQueryBuilder<Overtime>): void {
    qb.orderBy('overtime.workDate', 'DESC').addOrderBy('overtime.startTime', 'DESC');
  }

  async findAll(filters?: {
    startDate?: string;
    endDate?: string;
    technicianId?: string;
    positionId?: string;
    reasonForPayment?: ReasonForPayment;
  }): Promise<Overtime[]> {
    const qb = this.createBaseQuery();
    this.applyFilters(qb, filters);
    this.applyDefaultOrder(qb);
    return qb.getMany();
  }

  async findByTechnicianId(technicianId: string): Promise<Overtime[]> {
    return this.repository.find({
      where: { technicianId, isActive: true },
      relations: RELATIONS,
      order: { workDate: 'DESC', startTime: 'DESC' },
    });
  }

  async findById(id: string): Promise<Overtime | null> {
    return this.repository.findOne({
      where: { id },
      relations: RELATIONS,
    });
  }

  async create(data: Partial<Overtime>): Promise<Overtime> {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);
    return (await this.findById(saved.id))!;
  }

  async update(id: string, data: Partial<Overtime>): Promise<Overtime | null> {
    const record = await this.repository.findOne({ where: { id } });
    if (!record) return null;
    Object.assign(record, data);
    await this.repository.save(record);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    const record = await this.repository.findOne({ where: { id } });
    if (!record) return;
    record.isActive = false;
    record.deletedAt = new Date();
    await this.repository.save(record);
  }

  async countForExport(filters?: {
    startDate?: string;
    endDate?: string;
    technicianId?: string;
    positionId?: string;
    reasonForPayment?: ReasonForPayment;
  }): Promise<number> {
    const qb = this.createBaseQuery();
    this.applyFilters(qb, filters);
    return qb.getCount();
  }

  async findForExportBatch(
    filters: {
      startDate?: string;
      endDate?: string;
      technicianId?: string;
      positionId?: string;
      reasonForPayment?: ReasonForPayment;
    } | undefined,
    pagination: { page?: number; limit?: number },
  ): Promise<Overtime[]> {
    const qb = this.createBaseQuery();
    this.applyFilters(qb, filters);
    this.applyDefaultOrder(qb);

    const page = pagination.page || 1;
    const limit = pagination.limit || 100;
    qb.skip((page - 1) * limit).take(limit);

    return qb.getMany();
  }
}
