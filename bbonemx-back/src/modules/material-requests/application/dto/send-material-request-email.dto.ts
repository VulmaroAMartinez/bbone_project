import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  IsEmail,
  ArrayMinSize,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class SendMaterialRequestEmailInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El ID de la solicitud es requerido' })
  @IsUUID()
  materialRequestId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe haber al menos un destinatario' })
  @IsEmail({}, { each: true, message: 'Cada destinatario debe ser un correo válido' })
  to: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true, message: 'Cada correo en copia debe ser válido' })
  cc?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  message?: string;
}
