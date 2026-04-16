import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsUUID,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ConformityQ1Answer } from '../../domain/entities';

registerEnumType(ConformityQ1Answer, {
  name: 'ConformityQ1Answer',
  description:
    'Respuesta a P1: ¿El equipo/estructura quedó en condiciones operativas adecuadas?',
  valuesMap: {
    YES: { description: 'Sí' },
    NO: { description: 'No' },
    NOT_APPLICABLE: { description: 'No aplica' },
  },
});

@InputType()
export class RespondConformityInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  workOrderId: string;

  /**
   * P1: ¿El equipo/estructura quedó en condiciones operativas adecuadas?
   * Opciones: YES / NO / NOT_APPLICABLE
   */
  @Field(() => ConformityQ1Answer)
  @IsEnum(ConformityQ1Answer)
  question1Answer: ConformityQ1Answer;

  /** P2: ¿El área de trabajo quedó limpia y segura tras la intervención? */
  @Field()
  @IsBoolean()
  question2Answer: boolean;

  /** P3: ¿El problema reportado fue resuelto satisfactoriamente? */
  @Field()
  @IsBoolean()
  question3Answer: boolean;

  /**
   * P4 (decisiva): ¿Estoy conforme con el trabajo realizado?
   * true → flujo de firma. false → reinicio de OT.
   */
  @Field()
  @IsBoolean()
  isConforming: boolean;

  /**
   * Razón de no conformidad.
   * Obligatoria cuando isConforming = false.
   */
  @Field({ nullable: true })
  @ValidateIf((o: RespondConformityInput) => !o.isConforming)
  @IsNotEmpty({ message: 'La razón de no conformidad es obligatoria' })
  @IsString()
  reason?: string;
}

@InputType()
export class PendingConformityCountInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  requesterId?: string;
}
