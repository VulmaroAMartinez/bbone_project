import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsBoolean,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';
import { ActivityStatus } from '../../../../common/enums';

@InputType()
export class CreateActivityInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El área es requerida' })
  @IsUUID()
  areaId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @Field()
  @IsNotEmpty({ message: 'La actividad es requerida' })
  @IsString()
  activity: string;

  @Field()
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  startDate: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsDateString({}, { message: 'La fecha de fin debe ser válida' })
  endDate?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt({ message: 'El avance debe ser un número entero' })
  @Min(0, { message: 'El avance mínimo es 0' })
  @Max(100, { message: 'El avance máximo es 100' })
  progress?: number;

  @Field(() => ActivityStatus, { defaultValue: ActivityStatus.PENDING })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comments?: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  priority?: boolean;

  @Field(() => [ID], { description: 'IDs de técnicos a asignar' })
  @IsNotEmpty({ message: 'Debe asignar al menos un técnico' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un técnico' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de técnico debe ser un UUID válido',
  })
  technicianIds: string[];
}

@InputType()
export class UpdateActivityInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  activity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsDateString({}, { message: 'La fecha de fin debe ser válida' })
  endDate?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt({ message: 'El avance debe ser un número entero' })
  @Min(0, { message: 'El avance mínimo es 0' })
  @Max(100, { message: 'El avance máximo es 100' })
  progress?: number;

  @Field(() => ActivityStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comments?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  priority?: boolean;

  @Field(() => [ID], {
    nullable: true,
    description: 'IDs de técnicos (reemplaza todos los existentes)',
  })
  @IsOptional()
  @ArrayMinSize(1, { message: 'Debe asignar al menos un técnico' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de técnico debe ser un UUID válido',
  })
  technicianIds?: string[];
}
