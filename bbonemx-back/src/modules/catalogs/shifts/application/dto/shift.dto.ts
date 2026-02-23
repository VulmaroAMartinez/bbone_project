import { InputType, Field, PartialType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength, Matches } from "class-validator";

@InputType()
export class CreateShiftInput {
    @Field()
    @IsNotEmpty({message: 'El nombre del turno es requerido'})
    @IsString()
    @MaxLength(100)
    name: string;

    @Field()
    @IsNotEmpty({message: 'La hora de inicio es requerida'})
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {message: 'Formato de hora inválido (HH:MM)'})
    startTime: string;

    @Field()
    @IsNotEmpty({message: 'La hora de fin es requerida'})
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {message: 'Formato de hora inválido (HH:MM)'})
    endTime: string;

}

@InputType()
export class UpdateShiftInput extends PartialType(CreateShiftInput) {}