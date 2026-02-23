import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType('Material')
export class MaterialType {
    @Field(() => ID) id: string;
    @Field() description: string;
    @Field({ nullable: true }) brand?: string;
    @Field({ nullable: true }) model?: string;
    @Field({ nullable: true }) partNumber?: string;
    @Field({ nullable: true }) sku?: string;
    @Field({ nullable: true }) manufacturer?: string;
    @Field({ nullable: true }) unitOfMeasure?: string;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}
