import { ObjectType, Field, ID } from "@nestjs/graphql";
import { AreaType } from "src/modules/catalogs/areas/presentation/types";

@ObjectType('SubArea')
export class SubAreaType {
    @Field(() => ID) id: string;
    @Field(() => ID) areaId: string;
    @Field(() => AreaType) area: AreaType;
    @Field() name: string;
    @Field({ nullable: true }) description?: string;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}
