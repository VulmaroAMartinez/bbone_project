import { InputType, Field, PartialType, ID } from "@nestjs/graphql";
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsUUID, IsDateString } from "class-validator";

@InputType()
export class CreateMachineInput {
    @Field()
    @IsNotEmpty({message: 'código requerido'})
    @IsString()
    @MaxLength(50)
    code: string;

    @Field()
    @IsNotEmpty({message: 'nombre requerido'})
    @IsString()
    @MaxLength(200)
    name: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string;

    @Field()
    @IsNotEmpty({message: 'ID de la sub-área requerido'})
    @IsUUID()
    subAreaId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    brand?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    model?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    serialNumber?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsDateString()
    installationDate?: Date;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    machinePhotoUrl?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    operationalManualUrl?: string;
}

@InputType()
export class UpdateMachineInput extends PartialType(CreateMachineInput) {}
