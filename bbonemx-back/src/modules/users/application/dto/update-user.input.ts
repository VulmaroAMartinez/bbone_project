import { InputType, Field } from '@nestjs/graphql';
import {
  IsArray,
  IsOptional,
  IsString,
  IsEmail,
  IsUUID,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'El número de empleado debe tener menos de 50 caracteres',
  })
  employeeNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener mayúsculas, minúsculas y números',
  })
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre debe tener menos de 100 caracteres' })
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Los apellidos deben tener menos de 100 caracteres',
  })
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  @MaxLength(255)
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(13, { message: 'El teléfono debe tener máximo 13 caracteres' })
  phone?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray({ message: 'Los roles deben enviarse como arreglo' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de rol debe ser un UUID válido',
  })
  roleIds?: string[];

  @Field({ nullable: true, deprecationReason: 'Usar roleIds' })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del rol debe ser un UUID válido' })
  roleId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del departamento debe ser un UUID válido' })
  departmentId?: string;

  /** Área de alcance del REQUESTER (null = sin restricción) */
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del área debe ser un UUID válido' })
  areaId?: string;

  /** Sub-área de alcance del REQUESTER (requiere areaId) */
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la sub-área debe ser un UUID válido' })
  subAreaId?: string;
}
