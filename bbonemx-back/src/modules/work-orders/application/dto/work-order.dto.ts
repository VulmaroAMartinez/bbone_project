import { InputType, Field, ID, PartialType, Int } from '@nestjs/graphql';
import { 
  IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum, IsInt, Min 
} from 'class-validator';
import { 
  WorkOrderStatus, WorkOrderPriority, MaintenanceType, StopType 
} from '../../../../common/enums';

@InputType()
export class CreateWorkOrderInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El área es requerida' })
  @IsUUID()
  areaId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  subAreaId?: string;

  @Field()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString()
  description: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  machineId?: string;
}

@InputType()
export class AssignWorkOrderInput {
  @Field(() => WorkOrderPriority)
  @IsNotEmpty({ message: 'La prioridad es requerida' })
  @IsEnum(WorkOrderPriority)
  priority: WorkOrderPriority;

  @Field(() => MaintenanceType)
  @IsNotEmpty({ message: 'El tipo de mantenimiento es requerido' })
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @Field(() => StopType, { nullable: true })
  @IsOptional()
  @IsEnum(StopType)
  stopType?: StopType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedShiftId?: string;

  @Field(() => ID, { nullable: true, description: 'Máquina asociada (requerida si stopType = BREAKDOWN)' })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @Field(() => [ID], { description: 'IDs de técnicos a asignar' })
  @IsNotEmpty({ message: 'Debe asignar al menos un técnico' })
  @IsUUID('4', { each: true })
  technicianIds: string[];

  @Field(() => ID, { nullable: true, description: 'ID del técnico líder' })
  @IsOptional()
  @IsUUID()
  leadTechnicianId?: string;
}

@InputType()
export class StartWorkOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  breakdownDescription?: string;
}

@InputType()
export class PauseWorkOrderInput {
  @Field()
  @IsNotEmpty({ message: 'La razón de pausa es requerida' })
  @IsString()
  pauseReason: string;
}


@InputType()
export class CompleteWorkOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observations?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cause?: string;

  @Field()
  @IsNotEmpty({ message: 'La acción realizada es requerida' })
  @IsString()
  actionTaken: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  toolsUsed?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  downtimeMinutes?: number;

  @Field(() => WorkOrderStatus, { 
    defaultValue: WorkOrderStatus.COMPLETED,
    description: 'COMPLETED o TEMPORARY_REPAIR' 
  })
  @IsEnum(WorkOrderStatus)
  finalStatus: WorkOrderStatus;
}


@InputType()
export class UpdateWorkOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => WorkOrderPriority, { nullable: true })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @Field(() => MaintenanceType, { nullable: true })
  @IsOptional()
  @IsEnum(MaintenanceType)
  maintenanceType?: MaintenanceType;

  @Field(() => StopType, { nullable: true })
  @IsOptional()
  @IsEnum(StopType)
  stopType?: StopType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedShiftId?: string;

  @Field(() => ID, { nullable: true, description: 'Máquina asociada (requerida si stopType = BREAKDOWN o la OT tiene sub-área)' })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observations?: string;
}
