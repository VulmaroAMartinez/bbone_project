import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum, IsInt, Min, IsDateString, ValidateIf } from 'class-validator';
import { FrequencyType, FrequencyUnit, PreventiveTaskStatus } from 'src/common';

@InputType()
export class CreatePreventiveTaskInput {
    @Field()
    @IsNotEmpty({ message: 'descripción requerida' })
    @IsString()
    description: string;

    @Field(() => ID)
    @IsNotEmpty({ message: 'La máquina es requerida' })
    @IsUUID()
    machineId: string;

    @Field(() => FrequencyType)
    @IsNotEmpty({ message: 'frecuencia requerida' })
    @IsEnum(FrequencyType)
    frequencyType: FrequencyType;

    @Field(() => Int, { nullable: true })
    @ValidateIf(o => o.frequencyType === FrequencyType.CUSTOM)
    @IsNotEmpty({ message: 'valor de la frecuencia requerido' })
    @IsInt()
    @Min(1)
    frequencyValue?: number;

    @Field(() => FrequencyUnit, { nullable: true })
    @ValidateIf(o => o.frequencyType === FrequencyType.CUSTOM)
    @IsNotEmpty({ message: 'unidad de la frecuencia requerida' })
    @IsEnum(FrequencyUnit)
    frequencyUnit?: FrequencyUnit;

    @Field()
    @IsNotEmpty({ message: 'fecha de inicio requerida' })
    @IsDateString()
    startDate: Date;

    @Field(() => Int, { defaultValue: 24 })
    @IsOptional()
    @IsInt()
    @Min(1)
    advanceHours?: number;
}

@InputType()
export class UpdatePreventiveTaskInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    machineId?: string;

    @Field(() => PreventiveTaskStatus, { nullable: true })
    @IsOptional()
    @IsEnum(PreventiveTaskStatus)
    status?: PreventiveTaskStatus;
}

@InputType()
export class ClosePreventiveTaskInput {
    @Field()
    @IsNotEmpty({ message: 'La nota de cambio de política es requerida' })
    @IsString()
    policyChangeNote: string;

    @Field({ nullable: true, description: 'Si se debe crear una nueva tarea de continuación' })
    @IsOptional()
    createContinuation?: boolean;

    @Field(() => CreatePreventiveTaskInput, { nullable: true })
    @IsOptional()
    continuationTask?: CreatePreventiveTaskInput;
}