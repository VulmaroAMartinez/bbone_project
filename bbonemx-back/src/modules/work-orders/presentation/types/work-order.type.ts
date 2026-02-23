import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  WorkOrderStatus,
  WorkOrderPriority,
  MaintenanceType,
  StopType
} from '../../../../common/enums';
import { UserType } from '../../../users/presentation/types';
import { AreaType } from '../../../catalogs/areas/presentation/types';
import { SubAreaType } from '../../../catalogs/sub-areas/presentation/types';
import { ShiftType } from '../../../catalogs/shifts/presentation/types';
import { MachineType } from '../../../catalogs/machines/presentation/types';

@ObjectType('WorkOrder')
export class WorkOrderType {
  @Field(() => ID) 
  id: string;

  @Field(() => Int)
  sequence: number;

  @Field() 
  folio: string;

  // Relaciones
  @Field(() => ID)
  areaId: string;

  @Field(() => AreaType)
  area: AreaType;

  @Field(() => ID, { nullable: true })
  subAreaId?: string;

  @Field(() => SubAreaType, { nullable: true })
  subArea?: SubAreaType;

  @Field(() => ID)
  requesterId: string;
  
  @Field(() => UserType) 
  requester: UserType;

  @Field(() => ID, { nullable: true }) 
  assignedShiftId?: string;
  
  @Field(() => ShiftType, { nullable: true }) 
  assignedShift?: ShiftType;

  @Field(() => ID, { nullable: true })
  machineId?: string;

  @Field(() => MachineType, { nullable: true })
  machine?: MachineType;


  // Campos principales
  @Field() 
  description: string;

  @Field(() => WorkOrderStatus) 
  status: WorkOrderStatus;

  @Field(() => WorkOrderPriority, { nullable: true }) 
  priority?: WorkOrderPriority;

  @Field(() => MaintenanceType, { nullable: true }) 
  maintenanceType?: MaintenanceType;

  @Field(() => StopType, { nullable: true }) 
  stopType?: StopType;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true }) 
  endDate?: Date;

  @Field({ nullable: true }) 
  observations?: string;

  @Field({ nullable: true }) 
  breakdownDescription?: string;

  @Field({ nullable: true }) 
  cause?: string;

  @Field({ nullable: true }) 
  actionTaken?: string;

  @Field({ nullable: true })
  toolsUsed?: string;

  @Field(() => Int, { nullable: true }) 
  downtimeMinutes?: number;

  @Field({ nullable: true }) 
  pauseReason?: string;

  @Field(() => Int)
  functionalTimeMinutes: number;

  @Field({ nullable: true })
  lastResumedAt?: Date;

  @Field(() => ID, { nullable: true }) 
  findingId?: string;

  @Field(() => ID, { nullable: true }) 
  preventiveTaskId?: string;

  @Field() 
  isActive: boolean;

  @Field() 
  createdAt: Date;

  @Field() 
  updatedAt: Date;
}

@ObjectType()
export class WorkOrderPaginatedResponse {
  @Field(() => [WorkOrderType])
  data: WorkOrderType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}


@ObjectType()
export class WorkOrderStats {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;
}
