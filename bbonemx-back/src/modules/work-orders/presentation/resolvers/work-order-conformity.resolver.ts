import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  RolesGuard,
  Role,
  Roles,
  CurrentUser,
} from 'src/common';
import { User } from 'src/modules/users/domain/entities';
import { WorkOrderConformityService } from '../../application/services/work-order-conformity.service';
import { WorkOrderSignaturesService } from '../../application/services';
import { RespondConformityInput } from '../../application/dto/conformity.dto';
import {
  WorkOrderConformityRecordType,
} from '../types/work-order-conformity-record.type';
import { WorkOrderType } from '../types/work-order.type';

@Resolver(() => WorkOrderType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrderConformityResolver {
  constructor(
    private readonly conformityService: WorkOrderConformityService,
    private readonly signaturesService: WorkOrderSignaturesService,
  ) {}

  /**
   * Responde el cuestionario de conformidad de una OT.
   * - Si conforme: desbloquea firmas (pendingConformity = false)
   * - Si no conforme: reinicia OT a IN_PROGRESS
   */
  @Mutation(() => WorkOrderConformityRecordType)
  @Roles(Role.REQUESTER, Role.ADMIN)
  async respondConformity(
    @Args('input') input: RespondConformityInput,
    @CurrentUser() user: User,
  ): Promise<WorkOrderConformityRecordType> {
    return this.conformityService.respondConformity(
      input,
      user,
    ) as unknown as WorkOrderConformityRecordType;
  }

  /**
   * Historial de respuestas de conformidad para una OT.
   */
  @Query(() => [WorkOrderConformityRecordType])
  @Roles(Role.REQUESTER, Role.ADMIN, Role.TECHNICIAN, Role.BOSS)
  async conformityRecords(
    @Args('workOrderId') workOrderId: string,
  ): Promise<WorkOrderConformityRecordType[]> {
    return this.conformityService.findByWorkOrderId(
      workOrderId,
    ) as unknown as WorkOrderConformityRecordType[];
  }

  /** ResolveField: historial de conformidad embebido en WorkOrder */
  @ResolveField('conformityRecords', () => [WorkOrderConformityRecordType], {
    nullable: true,
  })
  async resolveConformityRecords(
    @Parent() workOrder: WorkOrderType,
  ): Promise<WorkOrderConformityRecordType[]> {
    return this.conformityService.findByWorkOrderId(
      workOrder.id,
    ) as unknown as WorkOrderConformityRecordType[];
  }

  /** ResolveField: indica si la OT tiene las firmas requeridas */
  @ResolveField('isFullySigned', () => Boolean)
  async resolveIsFullySigned(
    @Parent() workOrder: WorkOrderType,
  ): Promise<boolean> {
    return this.signaturesService.isFullySigned(workOrder.id);
  }
}
