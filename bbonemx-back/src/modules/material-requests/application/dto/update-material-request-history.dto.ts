import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { StatusHistoryMR } from 'src/common';

@InputType()
export class UpdateMaterialRequestHistoryInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El ID de la solicitud de material es requerido' })
  @IsUUID('4', {
    message: 'El ID de la solicitud de material debe ser un UUID válido',
  })
  materialRequestId: string;

  @Field(() => StatusHistoryMR)
  @IsNotEmpty({ message: 'El estatus es requerido' })
  @IsEnum(StatusHistoryMR, { message: 'El estatus no es válido' })
  status: StatusHistoryMR;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  purchaseRequest?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  purchaseOrder?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryMerchandise?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplier?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'La fecha estimada de entrega debe ser una fecha válida' })
  estimatedDeliveryDate?: Date;
}
