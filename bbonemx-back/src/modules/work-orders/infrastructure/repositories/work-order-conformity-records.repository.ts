import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrderConformityRecord } from '../../domain/entities';

@Injectable()
export class WorkOrderConformityRecordsRepository {
  constructor(
    @InjectRepository(WorkOrderConformityRecord)
    private readonly repository: Repository<WorkOrderConformityRecord>,
  ) {}

  async findByWorkOrderId(
    workOrderId: string,
  ): Promise<WorkOrderConformityRecord[]> {
    return this.repository.find({
      where: { workOrderId, isActive: true },
      relations: ['respondedBy'],
      order: { cycleNumber: 'ASC' },
    });
  }

  async findLatestByWorkOrderId(
    workOrderId: string,
  ): Promise<WorkOrderConformityRecord | null> {
    return this.repository.findOne({
      where: { workOrderId, isActive: true },
      relations: ['respondedBy'],
      order: { cycleNumber: 'DESC' },
    });
  }

  async create(
    data: Partial<WorkOrderConformityRecord>,
  ): Promise<WorkOrderConformityRecord> {
    return this.repository.save(this.repository.create(data));
  }
}
