import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { CreateMaterialRequestItemInput } from './material-request-item.dto';
import { Type } from 'class-transformer';
import {
  RequestCategory,
  RequestImportance,
  RequestPriority,
} from 'src/common';

@InputType()
export class CreateMaterialRequestInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El solicitante es requerido' })
  @IsUUID()
  requesterId: string;

  @Field(() => ID)
  @IsNotEmpty({ message: 'La máquina es requerida' })
  @IsUUID()
  machineId: string;

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

  @Field()
  @IsOptional()
  @IsString()
  customMachineName?: string;

  @Field()
  @IsOptional()
  @IsString()
  customMachineBrand?: string;

  @Field()
  @IsOptional()
  @IsString()
  customMachineModel?: string;

  @Field()
  @IsOptional()
  @IsString()
  customMachineManufacturer?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  justification?: string;

  @Field()
  @IsNotEmpty({ message: 'La autorización de material genérico es requerida' })
  @IsBoolean()
  isGenericAllowed: boolean;

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
