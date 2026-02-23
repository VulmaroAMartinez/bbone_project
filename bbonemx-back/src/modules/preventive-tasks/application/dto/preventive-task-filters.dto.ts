import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { FrequencyType, PreventiveTaskStatus } from 'src/common';


@InputType()
export class PreventiveTaskFiltersInput {
  @Field(() => PreventiveTaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PreventiveTaskStatus)
  status?: PreventiveTaskStatus;

  @Field(() => FrequencyType, { nullable: true })
  @IsOptional()
  @IsEnum(FrequencyType)
  frequencyType?: FrequencyType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @Field({ nullable: true, description: 'Próxima ejecución desde (ISO)' })
  @IsOptional()
  @IsDateString()
  nextExecutionFrom?: string;

  @Field({ nullable: true, description: 'Próxima ejecución hasta (ISO)' })
  @IsOptional()
  @IsDateString()
  nextExecutionTo?: string;

  @Field({ nullable: true, description: 'Búsqueda por descripción' })
  @IsOptional()
  search?: string;
}

@InputType()
export class PreventiveTaskPaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

@InputType()
export class PreventiveTaskSortInput {
  @Field({ defaultValue: 'nextExecutionDate' })
  @IsOptional()
  field?: string;

  @Field({ defaultValue: 'ASC' })
  @IsOptional()
  order?: 'ASC' | 'DESC';
}
