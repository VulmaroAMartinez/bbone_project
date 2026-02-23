import { InputType, Field, PartialType } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsEnum } from "class-validator";
import { AreaType } from "src/common";

@InputType()
export class CreateAreaInput {
    @Field()
    @IsNotEmpty({message: 'El nombre del área es requerido'})
    @IsString()
    @MaxLength(100)
    name: string;
    @Field({ nullable: true })
    @IsOptional()
    @IsString({message: 'La descripción debe ser una cadena de texto'})
    @MaxLength(255)
    description?: string;
    @Field(() => AreaType)
    @IsNotEmpty({message: 'El tipo de área es requerido'})
    @IsEnum(AreaType)
    type: AreaType;
}

@InputType()
export class UpdateAreaInput extends PartialType(CreateAreaInput) {}