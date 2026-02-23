import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsDateString, IsOptional, IsString, ValidateIf } from 'class-validator';

@InputType()
export class CreateScheduleInput {
    @Field(() => ID, { description: 'ID del técnico (user)' })
    @IsUUID()
    technicianId: string;

    @Field({ description: 'Fecha de la asignación (YYYY-MM-DD)' })
    @IsDateString()
    scheduleDate: string;

    @Field(() => ID, { nullable: true, description: 'ID del turno (null si ausencia)' })
    @IsOptional()
    @IsUUID()
    @ValidateIf(o => !o.absenceReasonId)
    shiftId?: string;

    @Field(() => ID, { nullable: true, description: 'ID del motivo de ausencia (si aplica)' })
    @IsOptional()
    @IsUUID()
    @ValidateIf(o => !o.shiftId)
    absenceReasonId?: string;

    @Field({ nullable: true, description: 'Notas adicionales' })
    @IsOptional()
    @IsString()
    notes?: string;
}