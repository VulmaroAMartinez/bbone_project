import { InputType, Field, ID, PartialType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum, IsBoolean, MaxLength } from "class-validator";
import { MaterialRequestPriority, MaterialRequestImportance } from "src/common";

@InputType()
export class CreateMaterialRequestInput {
    @Field(() => ID)
    @IsNotEmpty({ message: 'La máquina es requerida' })
    @IsUUID()
    machineId: string;

    @Field()
    @IsNotEmpty({ message: 'El texto de la solicitud es requerido' })
    @IsString()
    requestText: string;

    @Field(() => MaterialRequestPriority)
    @IsNotEmpty({ message: 'La prioridad es requerida' })
    @IsEnum(MaterialRequestPriority)
    priority: MaterialRequestPriority;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    justification?: string;

    @Field({ nullable: true, defaultValue: false })
    @IsOptional()
    @IsBoolean()
    isGenericOrAlternativeModel?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    comments?: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    suggestedSupplier?: string;
}

@InputType()
export class UpdateMaterialRequestInput extends PartialType(CreateMaterialRequestInput) {}

@InputType()
export class AddMaterialToRequestInput {
    @Field(() => ID)
    @IsNotEmpty({ message: 'El material es requerido' })
    @IsUUID()
    materialId: string;

    @Field(() => Int)
    @IsNotEmpty({ message: 'La cantidad es requerida' })
    quantity: number;

    @Field(() => MaterialRequestImportance, { nullable: true })
    @IsOptional()
    @IsEnum(MaterialRequestImportance)
    importance?: MaterialRequestImportance;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    minimumStock?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    maximumStock?: number;
}
