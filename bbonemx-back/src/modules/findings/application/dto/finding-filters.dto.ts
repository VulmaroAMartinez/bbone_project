import { InputType, Field, ID, Int } from "@nestjs/graphql";
import { IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min, Max } from "class-validator";
import { FindingStatus } from "src/common";

@InputType()
export class FindingFiltersInput {
    @Field(() => FindingStatus, { nullable: true })
    @IsOptional()
    @IsEnum(FindingStatus)
    status?: FindingStatus;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    areaId?: string;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    shiftId?: string;

    @Field(() => ID, { nullable: true })
    @IsOptional()
    @IsUUID()
    machineId?: string;

    @Field(() => ID, { nullable: true, description: 'Filtrar por creador' })
    @IsOptional()
    @IsUUID()
    createdBy?: string;

    @Field({ nullable: true, description: 'Fecha de creación desde (ISO)' })
    @IsOptional()
    @IsDateString()
    createdFrom?: string;

    @Field({ nullable: true, description: 'Fecha de creación hasta (ISO)' })
    @IsOptional()
    @IsDateString()
    createdTo?: string;

    @Field({ nullable: true, description: 'Búsqueda por folio o descripción' })
    @IsOptional()
    search?: string;
}

@InputType()
export class FindingPaginationInput {
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
export class FindingSortInput {
    @Field({ defaultValue: 'createdAt' })
    @IsOptional()
    field?: string;

    @Field({ defaultValue: 'DESC' })
    @IsOptional()
    order?: 'ASC' | 'DESC';
}