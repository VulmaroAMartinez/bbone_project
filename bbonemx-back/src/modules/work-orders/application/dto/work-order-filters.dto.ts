import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { WorkOrderStatus, WorkOrderPriority, MaintenanceType } from '../../../../common/enums';


@InputType()
export class WorkOrderFiltersInput {
  @Field(() => WorkOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @Field(() => [WorkOrderStatus], { nullable: true })
  @IsOptional()
  @IsEnum(WorkOrderStatus, { each: true })
  statuses?: WorkOrderStatus[];

  @Field(() => WorkOrderPriority, { nullable: true })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @Field(() => MaintenanceType, { nullable: true })
  @IsOptional()
  @IsEnum(MaintenanceType)
  maintenanceType?: MaintenanceType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  requesterId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedShiftId?: string;

  @Field({ nullable: true, description: 'Fecha de creación desde (ISO)' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @Field({ nullable: true, description: 'Fecha de creación hasta (ISO)' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @Field({ nullable: true, description: 'Búsqueda por folio o descripción' })
  @IsOptional()
  search?: string;
}


@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}


@InputType()
export class WorkOrderSortInput {
  @Field({ defaultValue: 'createdAt' })
  @IsOptional()
  field?: string;

  @Field({ defaultValue: 'DESC' })
  @IsOptional()
  order?: 'ASC' | 'DESC';
}
