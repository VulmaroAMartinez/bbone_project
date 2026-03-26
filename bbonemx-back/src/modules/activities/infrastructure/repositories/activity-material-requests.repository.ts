import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityMaterialRequest } from '../../domain/entities';

@Injectable()
export class ActivityMaterialRequestsRepository {
  constructor(
    @InjectRepository(ActivityMaterialRequest)
    private readonly repository: Repository<ActivityMaterialRequest>,
  ) {}

  async findByActivityId(
    activityId: string,
  ): Promise<ActivityMaterialRequest[]> {
    return this.repository.find({
      where: { activityId, isActive: true },
      relations: ['materialRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByActivityAndMaterialRequest(
    activityId: string,
    materialRequestId: string,
  ): Promise<ActivityMaterialRequest | null> {
    return this.repository.findOne({
      where: { activityId, materialRequestId, isActive: true },
    });
  }

  async create(
    data: Partial<ActivityMaterialRequest>,
  ): Promise<ActivityMaterialRequest> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async delete(activityId: string, materialRequestId: string): Promise<void> {
    await this.repository.delete({ activityId, materialRequestId });
  }
}
