import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserType } from '../../../users/presentation/types';

@ObjectType('WorkOrderTechnician')
export class WorkOrderTechnicianType {
  @Field(() => ID) 
  id: string;

  @Field(() => ID) 
  workOrderId: string;

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
  isLead: boolean;

  @Field() 
  isActive: boolean;

  @Field() 
  createdAt: Date;
}