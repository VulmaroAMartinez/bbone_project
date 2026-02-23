import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';

@InputType()
export class ScheduleFiltersInput {
    @Field(() => ID, { nullable: true, description: 'Filtrar por técnico' })
    @IsOptional()
    @IsUUID()
    technicianId?: string;

    @Field(() => ID, { nullable: true, description: 'Filtrar por turno (quién trabaja en turno X)' })
    @IsOptional()
    @IsUUID()
    shiftId?: string;

    @Field({ nullable: true, description: 'Filtrar por fecha específica (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    scheduleDate?: string;

    @Field(() => Int, { nullable: true, description: 'Filtrar por semana del año' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(53)
    weekNumber?: number;

    @Field(() => Int, { nullable: true, description: 'Filtrar por año' })
    @IsOptional()
    @IsInt()
    @Min(2020)
    year?: number;

    @Field(() => ID, { nullable: true, description: 'Filtrar por motivo de ausencia' })
    @IsOptional()
    @IsUUID()
    absenceReasonId?: string;

    @Field({ nullable: true, description: 'Solo días de trabajo (excluir ausencias)' })
    @IsOptional()
    onlyWorkDays?: boolean;

    @Field({ nullable: true, description: 'Solo ausencias' })
    @IsOptional()
    onlyAbsences?: boolean;
}