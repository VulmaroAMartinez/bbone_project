import { InputType, Field } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
} from "class-validator";

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty({ message: "El número de empleado es requerido" })
  @IsString()
  @MaxLength(50, { message: "El número de empleado debe tener menos de 50 caracteres" })
  employeeNumber: string;

  @Field()
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(100)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "La contraseña debe contener mayúsculas, minúsculas y números",
  })
  password: string;

  @Field()
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString()
  @MaxLength(100, { message: "El nombre debe tener menos de 100 caracteres" })
  firstName: string;

  @Field()
  @IsNotEmpty({ message: "Los apellidos son requeridos" })
  @IsString()
  @MaxLength(100, { message: "Los apellidos deben tener menos de 100 caracteres" })
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: "El correo debe ser un email válido" })
  @MaxLength(255)
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(13, { message: "El teléfono debe tener máximo 13 caracteres" })
  phone?: string;

  @Field()
  @IsNotEmpty({ message: "El rol es requerido" })
  @IsUUID("4", { message: "El ID del rol debe ser un UUID válido" })
  roleId: string;

  @Field()
  @IsNotEmpty({ message: "El departamento es requerido" })
  @IsUUID("4", { message: "El ID del departamento debe ser un UUID válido" })
  departmentId: string;
}
