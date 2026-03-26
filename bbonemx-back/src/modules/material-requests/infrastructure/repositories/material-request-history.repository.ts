import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialRequestHistory } from '../../domain/entities';

@Injectable()
export class MaterialRequestHistoryRepository {
  constructor(
    @InjectRepository(MaterialRequestHistory)
    private readonly repository: Repository<MaterialRequestHistory>,
  ) {}

  async findByMaterialRequestId(
    materialRequestId: string,
  ): Promise<MaterialRequestHistory | null> {
    return this.repository.findOne({
      where: { materialRequestId, isActive: true },
    });
  }

  async upsert(
    materialRequestId: string,
    data: Partial<MaterialRequestHistory>,
  ): Promise<MaterialRequestHistory> {
    const existing = await this.repository.findOne({
      where: { materialRequestId },
      withDeleted: true,
    });

    if (existing) {
      Object.assign(existing, data);
      return this.repository.save(existing);
    }

    const entity = this.repository.create({ ...data, materialRequestId });
    return this.repository.save(entity);
  }
}
