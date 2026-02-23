import { ObjectType, Field, ID } from "@nestjs/graphql";
import { AreaType as AreaTypeEnum } from "src/common";

@ObjectType('Area')
export class AreaType {
    @Field(() => ID) id: string;
    @Field() name: string;
    @Field({ nullable: true }) description?: string;
    @Field(() => AreaTypeEnum) type: AreaTypeEnum;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}