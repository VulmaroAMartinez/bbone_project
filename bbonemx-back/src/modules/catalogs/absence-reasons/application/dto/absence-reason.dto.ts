import { InputType, Field, PartialType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsOptional, IsInt, Min, MaxLength } from "class-validator";

@InputType()
export class CreateAbsenceReasonInput {
    @Field()
    @IsNotEmpty({message: 'El nombre de la razón de ausencia es requerido'})
    @IsString()
    @MaxLength(100)
    name: string;

    @Field(() => Int, { nullable: true, description: 'Máximo permitido por semana (NULL = Sin límite)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    maxPerWeek?: number;
}

@InputType()
export class UpdateAbsenceReasonInput extends PartialType(CreateAbsenceReasonInput) {}