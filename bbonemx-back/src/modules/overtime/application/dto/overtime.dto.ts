import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';

@InputType()
export class CreateOvertimeInput {
  @Field()
  @IsNotEmpty({ message: 'La fecha de trabajo es requerida' })
  @IsString()
  workDate: string;

  @Field()
  @IsNotEmpty({ message: 'La hora de inicio es requerida' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Formato de hora inválido (HH:mm)' })
  startTime: string;

  @Field()
  @IsNotEmpty({ message: 'La hora de fin es requerida' })
  @Matches(/^\d{2}:\d{2}$/, { message: 'Formato de hora inválido (HH:mm)' })
  endTime: string;

  @Field()
  @IsNotEmpty({ message: 'La actividad es requerida' })
  @IsString()
  activity: string;

  @Field(() => ReasonForPayment, { nullable: true })
  @IsOptional()
  @IsEnum(ReasonForPayment, { message: 'Razón de pago inválida' })
  reasonForPayment?: ReasonForPayment;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del técnico debe ser un UUID válido' })
  technicianId?: string;
}

@InputType()
export class UpdateOvertimeInput {
  @Field(() => ID)
  @IsNotEmpty({ message: 'El ID es requerido' })
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Formato de hora inválido (HH:mm)' })
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Formato de hora inválido (HH:mm)' })
  endTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  activity?: string;

  @Field(() => ReasonForPayment, { nullable: true })
  @IsOptional()
  @IsEnum(ReasonForPayment, { message: 'Razón de pago inválida' })
  reasonForPayment?: ReasonForPayment;
}
