import { InputType, Field, ID } from "@nestjs/graphql";
import { IsArray, IsDateString, IsOptional, IsUUID } from "class-validator";

@InputType()
export class DashboardInput { 
    @Field({description: 'RANGO DE INICIO'})
    @IsDateString()
    dateFrom: string;

    @Field({description: 'RANGO DE FIN'})
    @IsDateString()
    dateTo: string;

    @Field(() => [ID], {nullable: true})
    @IsOptional()
    @IsArray()
    @IsUUID(4, {each: true})
    areaIds?: string[];

    @Field(() => [ID], {nullable: true})
    @IsOptional()
    @IsArray()
    @IsUUID(4, {each: true})
    machineIds?: string[];

    @Field(() => [ID], {nullable: true})
    @IsOptional()
    @IsArray()
    @IsUUID(4, {each: true})
    shiftIds?: string[];

    @Field(() => [ID], {nullable: true})
    @IsOptional()
    @IsArray()
    @IsUUID(4, {each: true})
    technicianIds?: string[];

    @Field({defaultValue: 'America/Mexico_City'})
    @IsOptional()
    timezone?: string;
}