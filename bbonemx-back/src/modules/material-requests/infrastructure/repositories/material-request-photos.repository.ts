import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialRequestPhoto } from '../../domain/entities';

@Injectable()
export class MaterialRequestPhotosRepository {
  constructor(
    @InjectRepository(MaterialRequestPhoto)
    private readonly repository: Repository<MaterialRequestPhoto>,
  ) {}

  async findByMaterialRequestId(
    materialRequestId: string,
  ): Promise<MaterialRequestPhoto[]> {
    return this.repository.find({
      where: { materialRequestId, isActive: true },
      order: { uploadedAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<MaterialRequestPhoto | null> {
    return this.repository.findOne({ where: { id, isActive: true } });
  }

  async create(
    data: Partial<MaterialRequestPhoto>,
  ): Promise<MaterialRequestPhoto> {
    return this.repository.save(this.repository.create(data));
  }

  async softDelete(id: string): Promise<void> {
    const photo = await this.repository.findOne({ where: { id } });
    if (!photo) return;
    photo.isActive = false;
    photo.deletedAt = new Date();
    await this.repository.save(photo);
  }

  async countByMaterialRequestId(materialRequestId: string): Promise<number> {
    return this.repository.count({
      where: { materialRequestId, isActive: true },
    });
  }
}
