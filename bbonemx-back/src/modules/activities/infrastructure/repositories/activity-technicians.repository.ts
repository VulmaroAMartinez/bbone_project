import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ActivityTechnician } from '../../domain/entities';

@Injectable()
export class ActivityTechniciansRepository {
  constructor(
    @InjectRepository(ActivityTechnician)
    private readonly repository: Repository<ActivityTechnician>,
  ) {}

  async findByActivityId(activityId: string): Promise<ActivityTechnician[]> {
    return this.repository.find({
      where: { activityId, isActive: true },
      relations: [
        'technician',
        'technician.userRoles',
        'technician.userRoles.role',
        'assigner',
      ],
      order: { assignedAt: 'ASC' },
    });
  }

  async create(data: Partial<ActivityTechnician>): Promise<ActivityTechnician> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async saveMany(entities: Partial<ActivityTechnician>[]): Promise<ActivityTechnician[]> {
    const created = entities.map((e) => this.repository.create(e));
    return this.repository.save(created);
  }

  async deleteByActivityId(activityId: string): Promise<void> {
    await this.repository.delete({ activityId });
  }

  async delete(where: FindOptionsWhere<ActivityTechnician>): Promise<void> {
    await this.repository.delete(where);
  }
}
