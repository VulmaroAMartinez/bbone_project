import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsUUID, IsInt, Min, Max, IsOptional } from 'class-validator';

@InputType()
export class CopyWeekSchedulesInput {
    @Field(() => Int, { description: 'Semana origen' })
    @IsInt()
    @Min(1)
    @Max(53)
    sourceWeekNumber: number;

    @Field(() => Int, { description: 'Año origen' })
    @IsInt()
    @Min(2020)
    sourceYear: number;

    @Field(() => Int, { description: 'Semana destino' })
    @IsInt()
    @Min(1)
    @Max(53)
    targetWeekNumber: number;

    @Field(() => Int, { description: 'Año destino' })
    @IsInt()
    @Min(2020)
    targetYear: number;

    @Field(() => ID, { nullable: true, description: 'Copiar solo para un técnico específico (null = todos)' })
    @IsOptional()
    @IsUUID()
    technicianId?: string;
}