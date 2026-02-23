import { InputType, Field } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

@InputType()
export class LoginInput {
    @Field()
    @IsNotEmpty({message: 'El número de empleado es requerido'})
    @IsString({message: 'El número de empleado debe ser una cadena de texto'})
    employeeNumber: string;

    @Field()
    @IsNotEmpty({message: 'La contraseña es requerida'})
    @IsString({message: 'La contraseña debe ser una cadena de texto'})
    @MinLength(4, {message: 'La contraseña debe tener al menos 4 caracteres'})
    password: string;
}