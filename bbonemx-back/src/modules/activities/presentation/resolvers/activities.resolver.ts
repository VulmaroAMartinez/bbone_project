import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  ActivitiesService,
  ActivityWorkOrdersService,
  ActivityMaterialRequestsService,
} from '../../application/services';
import {
  CreateActivityInput,
  UpdateActivityInput,
} from '../../application/dto/activity.dto';
import {
  ActivityFiltersInput,
  ActivityPaginationInput,
  ActivitySortInput,
  ActivitySortField,
} from '../../application/dto/activity-filters.dto';
import {
  AddActivityWorkOrderByFolioInput,
  AddActivityMaterialRequestByFolioInput,
} from '../../application/dto/activity-relation.dto';
import { SortOrder } from '../../../work-orders/application/dto/work-order-filters.dto';
import {
  ActivityType,
  ActivityPaginatedResponse,
  ActivityTechnicianType,
  ActivityWorkOrderType,
  ActivityMaterialRequestType,
} from '../types';
import {
  JwtAuthGuard,
  RolesGuard,
  Role,
  Roles,
  CurrentUser,
} from 'src/common';
import { User } from 'src/modules/users/domain/entities';
import { ActivityTechniciansRepository } from '../../infrastructure/repositories/activity-technicians.repository';
import { ActivityWorkOrdersRepository } from '../../infrastructure/repositories/activity-work-orders.repository';
import { ActivityMaterialRequestsRepository } from '../../infrastructure/repositories/activity-material-requests.repository';

@Resolver(() => ActivityType)
@UseGuards(JwtAuthGuard)
export class ActivitiesResolver {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly activityWorkOrdersService: ActivityWorkOrdersService,
    private readonly activityMaterialRequestsService: ActivityMaterialRequestsService,
    private readonly activityTechniciansRepository: ActivityTechniciansRepository,
    private readonly activityWorkOrdersRepository: ActivityWorkOrdersRepository,
    private readonly activityMaterialRequestsRepository: ActivityMaterialRequestsRepository,
  ) {}

  // =============================== QUERIES ===============================

  @Query(() => ActivityPaginatedResponse, { name: 'activitiesFiltered' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async findFiltered(
    @Args('filters', { nullable: true }) filters?: ActivityFiltersInput,
    @Args('pagination', { nullable: true }) pagination?: ActivityPaginationInput,
    @Args('sort', { nullable: true }) sort?: ActivitySortInput,
  ): Promise<ActivityPaginatedResponse> {
    const { data, total } = await this.activitiesService.findWithFilters(
      filters || {},
      pagination || { page: 1, limit: 20 },
      sort || { field: ActivitySortField.CREATED_AT, order: SortOrder.DESC },
    );
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    return {
      data: data as unknown as ActivityType[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Query(() => String, {
    name: 'exportActivitiesExcel',
    description: 'Exportar actividades a Excel (Base64)',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async exportActivitiesExcel(
    @Args('filters', { nullable: true }) filters?: ActivityFiltersInput,
    @Args('sort', { nullable: true }) sort?: ActivitySortInput,
  ): Promise<string> {
    return this.activitiesService.exportToExcel(
      filters || {},
      sort || { field: ActivitySortField.CREATED_AT, order: SortOrder.DESC },
    );
  }

  @Query(() => ActivityType, { name: 'activity', nullable: true })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS)
  async findById(
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.activitiesService.findById(id);
  }

  // =============================== MUTATIONS ===============================

  @Mutation(() => ActivityType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createActivity(
    @Args('input') input: CreateActivityInput,
    @CurrentUser() user: User,
  ) {
    return this.activitiesService.create(input, user.id);
  }

  @Mutation(() => ActivityType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateActivity(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateActivityInput,
    @CurrentUser() user: User,
  ) {
    return this.activitiesService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteActivity(
    @Args('id', { type: () => ID }) id: string,
  ) {
    await this.activitiesService.deactivate(id);
    return true;
  }

  @Mutation(() => ActivityType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateActivityPriority(
    @Args('id', { type: () => ID }) id: string,
    @Args('priority') priority: boolean,
  ) {
    return this.activitiesService.updatePriority(id, priority);
  }

  // ======= Work Order Relations =======

  @Mutation(() => ActivityWorkOrderType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addActivityWorkOrder(
    @Args('input') input: AddActivityWorkOrderByFolioInput,
  ) {
    return this.activityWorkOrdersService.addByFolio(
      input.activityId,
      input.folio,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async removeActivityWorkOrder(
    @Args('activityId', { type: () => ID }) activityId: string,
    @Args('workOrderId', { type: () => ID }) workOrderId: string,
  ) {
    await this.activityWorkOrdersService.remove(activityId, workOrderId);
    return true;
  }

  // ======= Material Request Relations =======

  @Mutation(() => ActivityMaterialRequestType)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addActivityMaterialRequest(
    @Args('input') input: AddActivityMaterialRequestByFolioInput,
  ) {
    return this.activityMaterialRequestsService.addByFolio(
      input.activityId,
      input.folio,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async removeActivityMaterialRequest(
    @Args('activityId', { type: () => ID }) activityId: string,
    @Args('materialRequestId', { type: () => ID }) materialRequestId: string,
  ) {
    await this.activityMaterialRequestsService.remove(
      activityId,
      materialRequestId,
    );
    return true;
  }

  // =============================== RESOLVE FIELDS ===============================

  @ResolveField('technicians', () => [ActivityTechnicianType])
  async technicians(@Parent() activity: ActivityType) {
    return this.activityTechniciansRepository.findByActivityId(activity.id);
  }

  @ResolveField('workOrders', () => [ActivityWorkOrderType])
  async workOrders(@Parent() activity: ActivityType) {
    return this.activityWorkOrdersRepository.findByActivityId(activity.id);
  }

  @ResolveField('materialRequests', () => [ActivityMaterialRequestType])
  async materialRequests(@Parent() activity: ActivityType) {
    return this.activityMaterialRequestsRepository.findByActivityId(activity.id);
  }
}
