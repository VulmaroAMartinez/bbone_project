import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ActivityStatus } from '../../../../common/enums';
import { AreaType } from '../../../catalogs/areas/presentation/types';
import { MachineType } from '../../../catalogs/machines/presentation/types';
import { UserType } from '../../../users/presentation/types';
import { WorkOrderType } from '../../../work-orders/presentation/types';
import { MaterialRequestType } from '../../../material-requests/presentation/types';

@ObjectType('Activity')
export class ActivityType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  areaId: string;

  @Field(() => AreaType)
  area: AreaType;

  @Field(() => ID, { nullable: true })
  machineId?: string;

  @Field(() => MachineType, { nullable: true })
  machine?: MachineType;

  @Field()
  activity: string;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int)
  progress: number;

  @Field(() => ActivityStatus)
  status: ActivityStatus;

  @Field({ nullable: true })
  comments?: string;

  @Field()
  priority: boolean;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ActivityPaginatedResponse {
  @Field(() => [ActivityType])
  data: ActivityType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType('ActivityTechnician')
export class ActivityTechnicianType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  activityId: string;

  @Field(() => ID)
  technicianId: string;

  @Field(() => UserType)
  technician: UserType;

  @Field()
  assignedAt: Date;

  @Field(() => ID)
  assignedBy: string;

  @Field(() => UserType)
  assigner: UserType;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType('ActivityWorkOrder')
export class ActivityWorkOrderType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  activityId: string;

  @Field(() => ID)
  workOrderId: string;

  @Field(() => WorkOrderType)
  workOrder: WorkOrderType;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType('ActivityMaterialRequest')
export class ActivityMaterialRequestType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  activityId: string;

  @Field(() => ID)
  materialRequestId: string;

  @Field(() => MaterialRequestType)
  materialRequest: MaterialRequestType;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
