import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType('Role')
export class RoleType {
    @Field(() => ID) id: string;
    @Field() name: string;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}