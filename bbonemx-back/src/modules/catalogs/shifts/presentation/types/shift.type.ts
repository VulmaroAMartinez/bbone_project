import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType('Shift')
export class ShiftType {
    @Field(() => ID) id: string;
    @Field() name: string;
    @Field() startTime: string;
    @Field() endTime: string;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}