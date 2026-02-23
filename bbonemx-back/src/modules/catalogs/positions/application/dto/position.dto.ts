import { InputType, Field, ID, PartialType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

@InputType()
export class CreatePositionInput {
    @Field()
    @IsNotEmpty({ message: 'El nombre de la posición es requerido' })
    @IsString({ message: 'El nombre de la posición debe ser una cadena de texto' })
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    description?: string;
}

@InputType()
export class UpdatePositionInput extends PartialType(CreatePositionInput) {}