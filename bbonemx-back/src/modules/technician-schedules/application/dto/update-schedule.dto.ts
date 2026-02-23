import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsString } from 'class-validator';

@InputType()
export class UpdateScheduleInput {
    @Field(() => ID, { nullable: true, description: 'ID del turno (null si ausencia)' })
    @IsOptional()
    @IsUUID()
    shiftId?: string;

    @Field(() => ID, { nullable: true, description: 'ID del motivo de ausencia' })
    @IsOptional()
    @IsUUID()
    absenceReasonId?: string;

    @Field({ nullable: true, description: 'Notas adicionales' })
    @IsOptional()
    @IsString()
    notes?: string;
}