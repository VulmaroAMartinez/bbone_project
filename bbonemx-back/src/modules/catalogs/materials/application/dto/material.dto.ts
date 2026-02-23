import { InputType, Field, PartialType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength, IsOptional } from "class-validator";

@InputType()
export class CreateMaterialInput {
    @Field()
    @IsNotEmpty({message: 'La descripción es requerida'})
    @IsString()
    description: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    brand?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    model?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    partNumber?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    sku?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    manufacturer?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    unitOfMeasure?: string;
}

@InputType()
export class UpdateMaterialInput extends PartialType(CreateMaterialInput) {}
