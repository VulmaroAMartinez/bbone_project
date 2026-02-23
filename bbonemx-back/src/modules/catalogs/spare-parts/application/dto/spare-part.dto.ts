import { InputType, Field, PartialType, ID } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID } from "class-validator";

@InputType()
export class CreateSparePartInput {
    @Field(() => ID)
    @IsNotEmpty({message: 'La máquina es requerida'})
    @IsUUID()
    machineId: string;

    @Field()
    @IsNotEmpty({message: 'El número de parte es requerido'})
    @IsString()
    @MaxLength(100)
    partNumber: string;

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
    @MaxLength(200)
    supplier?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    unitOfMeasure?: string;
}

@InputType()
export class UpdateSparePartInput extends PartialType(CreateSparePartInput) {}
