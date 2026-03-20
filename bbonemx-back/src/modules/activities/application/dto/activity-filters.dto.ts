import { InputType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ActivityStatus } from '../../../../common/enums';
import { SortOrder } from '../../../work-orders/application/dto/work-order-filters.dto';

export enum ActivitySortField {
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
  CREATED_AT = 'CREATED_AT',
}

registerEnumType(ActivitySortField, {
  name: 'ActivitySortField',
  description: 'Campos disponibles para ordenar actividades',
  valuesMap: {
    START_DATE: { description: 'Fecha de inicio' },
    END_DATE: { description: 'Fecha de fin' },
    CREATED_AT: { description: 'Fecha de creación' },
  },
});

@InputType()
export class ActivityFiltersInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  machineId?: string;

  @Field(() => ActivityStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @Field({ nullable: true, description: 'Filtrar solo actividades prioritarias' })
  @IsOptional()
  @IsBoolean()
  priority?: boolean;

  @Field({ nullable: true, description: 'Búsqueda por nombre de actividad' })
  @IsOptional()
  search?: string;
}

@InputType()
export class ActivityPaginationInput {
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
export class ActivitySortInput {
  @Field(() => ActivitySortField, { defaultValue: ActivitySortField.CREATED_AT })
  @IsOptional()
  @IsEnum(ActivitySortField)
  field?: ActivitySortField;

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}
