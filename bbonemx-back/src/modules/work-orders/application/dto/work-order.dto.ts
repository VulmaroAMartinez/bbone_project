import { InputType, Field, ID, PartialType, Int } from '@nestjs/graphql';
import {
  IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum, IsInt, Min, ValidateIf, IsDateString, IsObject
} from 'class-validator';
import { 
  WorkOrderStatus, WorkOrderPriority, MaintenanceType, StopType, WorkType 
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


  @Field({ nullable: true, description: 'Fecha programada (requerida cuando maintenanceType = CORRECTIVE_SCHEDULED)' })
  @ValidateIf((o: AssignWorkOrderInput) => o.maintenanceType === MaintenanceType.CORRECTIVE_SCHEDULED)
  @IsNotEmpty({ message: 'La fecha programada es requerida para mantenimiento correctivo programado' })
  @IsDateString({}, { message: 'La fecha programada debe tener un formato de fecha válido' })
  scheduledDate?: string;

  @Field(() => WorkType)
  @IsNotEmpty({ message: 'El tipo de trabajo es requerido' })
  @IsEnum(WorkType)
  workType: WorkType;

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

  @Field({ nullable: true, description: 'Descripción de la avería al iniciar (si aplica)' })
  @IsOptional()
  @IsString()
  observations?: string;
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

  @Field({ nullable: true, description: 'Refacción no listada en catálogo' })
  @IsOptional()
  @IsString()
  customSparePart?: string;

  @Field({ nullable: true, description: 'Material no listado en catálogo' })
  @IsOptional()
  @IsString()
  customMaterial?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  downtimeMinutes?: number;

  @Field(() => WorkOrderStatus, {
    defaultValue: WorkOrderStatus.COMPLETED,
    description: 'COMPLETED o TEMPORARY_REPAIR',
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
  @IsDateString({}, { message: 'La fecha programada debe tener un formato de fecha válido' })
  scheduledDate?: string;

  @Field(() => WorkType, { nullable: true })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  observations?: string;
}
