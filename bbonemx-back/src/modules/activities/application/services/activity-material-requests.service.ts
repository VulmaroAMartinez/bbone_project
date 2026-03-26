import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityMaterialRequestsRepository } from '../../infrastructure/repositories/activity-material-requests.repository';
import { ActivitiesService } from './activities.service';
import { MaterialRequestsService } from 'src/modules/material-requests/application/services/material-requests.service';
import { ActivityMaterialRequest } from '../../domain/entities';

@Injectable()
export class ActivityMaterialRequestsService {
  constructor(
    private readonly activityMaterialRequestsRepository: ActivityMaterialRequestsRepository,
    private readonly activitiesService: ActivitiesService,
    private readonly materialRequestsService: MaterialRequestsService,
  ) {}

  async findByActivityId(
    activityId: string,
  ): Promise<ActivityMaterialRequest[]> {
    return this.activityMaterialRequestsRepository.findByActivityId(activityId);
  }

  async addByFolio(
    activityId: string,
    folio: string,
  ): Promise<ActivityMaterialRequest> {
    await this.activitiesService.findByIdOrFail(activityId);

    const materialRequest =
      await this.materialRequestsService.findByFolio(folio);
    if (!materialRequest) {
      throw new NotFoundException(
        `Solicitud de material con folio "${folio}" no encontrada`,
      );
    }

    const existing =
      await this.activityMaterialRequestsRepository.findByActivityAndMaterialRequest(
        activityId,
        materialRequest.id,
      );
    if (existing) {
      throw new BadRequestException(
        `La solicitud de material "${folio}" ya está vinculada a esta actividad`,
      );
    }

    return this.activityMaterialRequestsRepository.create({
      activityId,
      materialRequestId: materialRequest.id,
    });
  }

  async remove(activityId: string, materialRequestId: string): Promise<void> {
    await this.activitiesService.findByIdOrFail(activityId);
    await this.activityMaterialRequestsRepository.delete(
      activityId,
      materialRequestId,
    );
  }
}
