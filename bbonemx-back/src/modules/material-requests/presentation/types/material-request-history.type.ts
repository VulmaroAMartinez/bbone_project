import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { StatusHistoryMR } from 'src/common';

@ObjectType('MaterialRequestHistory')
export class MaterialRequestHistoryType {
  @Field(() => ID) id: string;
  @Field(() => ID) materialRequestId: string;
  @Field(() => StatusHistoryMR) status: StatusHistoryMR;
  @Field({ nullable: true }) purchaseRequest?: string;
  @Field({ nullable: true }) purchaseOrder?: string;
  @Field({ nullable: true }) deliveryMerchandise?: string;
  @Field(() => Date, { nullable: true }) deliveryDate?: Date | null;
  @Field(() => Int, { nullable: true }) progressPercentage?: number;
  @Field({ nullable: true }) supplier?: string;
  @Field() isActive: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
