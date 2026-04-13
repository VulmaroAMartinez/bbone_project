import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialRequestItem } from '../../domain/entities';

@Injectable()
export class MaterialRequestItemsRepository {
  constructor(
    @InjectRepository(MaterialRequestItem)
    private readonly repository: Repository<MaterialRequestItem>,
  ) {}

  async findById(id: string): Promise<MaterialRequestItem | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['material', 'sparePart'],
    });
  }

  async findByRequestId(
    materialRequestId: string,
  ): Promise<MaterialRequestItem[]> {
    return this.repository.find({
      where: { materialRequestId },
      relations: ['material', 'sparePart'],
    });
  }

  async create(
    data: Partial<MaterialRequestItem>,
  ): Promise<MaterialRequestItem> {
    const saved = await this.repository.save(this.repository.create(data));
    return this.repository.findOne({
      where: { id: saved.id },
      relations: ['material', 'sparePart'],
    }) as Promise<MaterialRequestItem>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
