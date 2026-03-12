import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { MaterialType } from "src/modules/catalogs/materials/presentation/types";
import { SparePartType } from "src/modules/catalogs/spare-parts/presentation/types";

@ObjectType('MaterialRequestItem')
export class MaterialRequestItemType {
    @Field(() => ID) id: string;
    @Field(() => ID, { nullable: true }) materialId?: string;
    @Field(() => MaterialType, { nullable: true }) material?: MaterialType;
    @Field(() => ID, { nullable: true }) sparePartId?: string;
    @Field(() => SparePartType, { nullable: true }) sparePart?: SparePartType;
    @Field({ nullable: true }) description?: string;
    @Field({ nullable: true }) sku?: string;
    @Field({ nullable: true }) partNumber?: string;
    @Field({ nullable: true }) brand?: string;
    @Field({ nullable: true }) model?: string;
    @Field({ nullable: true }) unitOfMeasure?: string;
    @Field(() => Int, { nullable: true }) requestedQuantity?: number;
    @Field(() => Int, { nullable: true }) proposedMaxStock?: number;
    @Field(() => Int, { nullable: true }) proposedMinStock?: number;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}
