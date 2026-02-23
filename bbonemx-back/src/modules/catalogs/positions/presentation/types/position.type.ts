import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Position')
export class PositionType {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field() isActive: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}