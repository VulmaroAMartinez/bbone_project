import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class CreateDepartmentInput {
  @Field()
  @IsNotEmpty({ message: 'El nombre del departamento es requerido' })
  @IsString()
  @MaxLength(100)
  name: string;
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(255)
  description?: string;
}

@InputType()
export class UpdateDepartmentInput extends PartialType(CreateDepartmentInput) {}
