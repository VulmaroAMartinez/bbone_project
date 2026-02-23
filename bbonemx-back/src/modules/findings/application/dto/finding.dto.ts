import { InputType, Field, ID, PartialType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID, IsOptional, MaxLength } from "class-validator";

@InputType()
export class CreateFindingInput {
    @Field(() => ID)
    @IsNotEmpty({message: 'El área es requerida'})
    @IsUUID()
    areaId: string;

    @Field(() => ID)
    @IsNotEmpty({message: 'La máquina es requerida'})
    @IsUUID()
    machineId: string;

    @Field(() => ID)
    @IsNotEmpty({message: 'El turno es requerido'})
    @IsUUID()
    shiftId: string;

    @Field()
    @IsNotEmpty({message: 'La descripción es requerida'})
    @IsString()
    @MaxLength(500)
    description: string;

    @Field()
    @IsNotEmpty({message: 'La foto es requerida'})
    @IsString()
    @MaxLength(500)
    photoPath: string;
}

@InputType()
export class UpdateFindingInput extends PartialType(CreateFindingInput) {}

