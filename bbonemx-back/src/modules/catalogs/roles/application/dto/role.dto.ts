import { InputType, Field, PartialType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

@InputType()
export class CreateRoleInput {
    @Field()
    @IsNotEmpty({message: 'El nombre del rol es requerido'})
    @IsString({message: 'El nombre del rol debe ser una cadena de texto'})
    @MaxLength(50, {message: 'El nombre del rol debe tener menos de 50 caracteres'})
    name: string;
}

@InputType()
export class UpdateRoleInput extends PartialType(CreateRoleInput) {}