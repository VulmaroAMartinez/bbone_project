import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { CreateMaterialRequestItemInput } from './material-request-item.dto';
import { Type } from 'class-transformer';
import {
  RequestCategory,
  RequestImportance,
  RequestPriority,
} from 'src/common';

@InputType()
export class CreateMaterialRequestMachineInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customMachineName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customMachineModel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customMachineManufacturer?: string;
}

@InputType()
export class CreateMaterialRequestInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El solicitante es requerido' })
  @IsUUID()
  requesterId: string;

  @Field(() => [CreateMaterialRequestMachineInput])
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una máquina' })
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestMachineInput)
  machines: CreateMaterialRequestMachineInput[];

  @Field(() => [CreateMaterialRequestItemInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialRequestItemInput)
  items?: CreateMaterialRequestItemInput[];

  @Field()
  @IsNotEmpty({ message: 'El jefe es requerido' })
  @IsString()
  boss: string;

  @Field()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  @IsEnum(RequestCategory)
  category: RequestCategory;

  @Field()
  @IsNotEmpty({ message: 'La importancia es requerida' })
  @IsEnum(RequestImportance)
  importance: RequestImportance;

  @Field()
  @IsNotEmpty({ message: 'La prioridad es requerida' })
  @IsEnum(RequestPriority)
  priority: RequestPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  justification?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  suggestedSupplier?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comments?: string;
}

@InputType()
export class UpdateMaterialRequestInput extends PartialType(
  CreateMaterialRequestInput,
) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El ID de la solicitud de material es requerido' })
  @IsUUID()
  id: string;
}
