import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { MaterialRequestPriority, MaterialRequestImportance } from "src/common";
import { MachineType } from "src/modules/catalogs/machines/presentation/types";
import { MaterialType } from "src/modules/catalogs/materials/presentation/types";

@ObjectType('MaterialRequestMaterial')
export class MaterialRequestMaterialType {
    @Field(() => ID) id: string;
    @Field(() => ID) materialRequestId: string;
    @Field(() => ID) materialId: string;
    @Field(() => MaterialType) material: MaterialType;
    @Field(() => Int) quantity: number;
    @Field(() => MaterialRequestImportance, { nullable: true }) importance?: MaterialRequestImportance;
    @Field(() => Int, { nullable: true }) minimumStock?: number;
    @Field(() => Int, { nullable: true }) maximumStock?: number;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}

@ObjectType('MaterialRequest')
export class MaterialRequestType {
    @Field(() => ID) id: string;
    @Field(() => Int) sequence: number;
    @Field() folio: string;
    @Field(() => ID) machineId: string;
    @Field(() => MachineType) machine: MachineType;
    @Field() requestText: string;
    @Field(() => MaterialRequestPriority) priority: MaterialRequestPriority;
    @Field({ nullable: true }) justification?: string;
    @Field() isGenericOrAlternativeModel: boolean;
    @Field({ nullable: true }) comments?: string;
    @Field({ nullable: true }) suggestedSupplier?: string;
    @Field(() => [MaterialRequestMaterialType]) materials: MaterialRequestMaterialType[];
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}
