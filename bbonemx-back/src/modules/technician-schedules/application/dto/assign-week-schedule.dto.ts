import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsUUID, IsInt, Min, Max, ValidateNested, ArrayMinSize, IsOptional, IsString, IsDateString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class DayScheduleInput {
    @Field({ description: 'Fecha del día (YYYY-MM-DD)' })
    @IsDateString()
    scheduleDate: string;

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

@InputType()
export class AssignWeekScheduleInput {
    @Field(() => ID, { description: 'ID del técnico (user)' })
    @IsUUID()
    technicianId: string;

    @Field(() => Int, { description: 'Número de semana del año (1-53)' })
    @IsInt()
    @Min(1)
    @Max(53)
    weekNumber: number;

    @Field(() => Int, { description: 'Año' })
    @IsInt()
    @Min(2020)
    year: number;

    @Field(() => [DayScheduleInput], { description: 'Asignaciones por día (hasta 7)' })
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => DayScheduleInput)
    days: DayScheduleInput[];
}