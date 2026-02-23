import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType('AbsenceReason')
export class AbsenceReasonType {
    @Field(() => ID) id: string;
    @Field() name: string;
    @Field(() => Int, { nullable: true }) maxPerWeek?: number;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}