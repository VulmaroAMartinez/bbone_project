import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Overtime } from '../../domain/entities';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';

const RELATIONS = ['technician', 'technician.user', 'technician.position'];

@Injectable()
export class OvertimeRepository {
  constructor(
    @InjectRepository(Overtime)
    private readonly repository: Repository<Overtime>,
  ) {}

  async findAll(filters?: {
    startDate?: string;
    endDate?: string;
    technicianId?: string;
    positionId?: string;
    reasonForPayment?: ReasonForPayment;
  }): Promise<Overtime[]> {
    const where: FindOptionsWhere<Overtime> = { isActive: true };

    if (filters?.technicianId) {
      where.technicianId = filters.technicianId;
    }
    if (filters?.reasonForPayment) {
      where.reasonForPayment = filters.reasonForPayment;
    }
    if (filters?.startDate && filters?.endDate) {
      where.workDate = Between(
        new Date(filters.startDate),
        new Date(filters.endDate),
      );
    }

    const results = await this.repository.find({
      where,
      relations: RELATIONS,
      order: { workDate: 'DESC', startTime: 'DESC' },
    });

    if (filters?.positionId) {
      return results.filter(
        (ot) => ot.technician?.positionId === filters.positionId,
      );
    }
    return results;
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
}
