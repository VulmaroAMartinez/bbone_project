import { InputType, Field, PartialType, ID } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID } from "class-validator";

@InputType()
export class CreateSubAreaInput {
    @Field(() => ID)
    @IsNotEmpty({message: 'El área es requerida'})
    @IsUUID()
    areaId: string;

    @Field()
    @IsNotEmpty({message: 'El nombre de la sub-área es requerido'})
    @IsString()
    @MaxLength(100)
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString({message: 'La descripción debe ser una cadena de texto'})
    @MaxLength(255)
    description?: string;
}

@InputType()
export class UpdateSubAreaInput extends PartialType(CreateSubAreaInput) {}
