import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsDate,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'AreaOrSubAreaRequired', async: false })
export class AreaOrSubAreaRequiredConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const obj = args.object as Record<string, unknown>;
    const hasArea = !!obj.areaId;
    const hasSubArea = !!obj.subAreaId;
    return (hasArea || hasSubArea) && !(hasArea && hasSubArea);
  }

  defaultMessage(): string {
    return 'Debe especificar exactamente uno: areaId (máquina directa al área) o subAreaId (máquina en sub-área). No ambos ni ninguno.';
  }
}

@InputType()
export class CreateMachineInput {
  @Field()
  @IsNotEmpty({ message: 'código requerido' })
  @IsString()
  @MaxLength(50)
  code: string;

  @Field()
  @IsNotEmpty({ message: 'nombre requerido' })
  @IsString()
  @MaxLength(200)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID, {
    nullable: true,
    description: 'ID del área (si la máquina pertenece directamente al área)',
  })
  @ValidateIf((o: CreateMachineInput) => !o.subAreaId)
  @IsUUID('4', { message: 'areaId debe ser un UUID válido' })
  @Validate(AreaOrSubAreaRequiredConstraint)
  areaId?: string;

  @Field(() => ID, {
    nullable: true,
    description: 'ID de la sub-área (si la máquina pertenece a una sub-área)',
  })
  @ValidateIf((o: CreateMachineInput) => !o.areaId)
  @IsUUID('4', { message: 'subAreaId debe ser un UUID válido' })
  subAreaId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  installationDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  machinePhotoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  operationalManualUrl?: string;
}

@InputType()
export class UpdateMachineInput extends PartialType(CreateMachineInput) {}
