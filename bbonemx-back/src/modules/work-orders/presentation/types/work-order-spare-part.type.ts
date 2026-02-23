import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { SparePartType } from '../../../catalogs/spare-parts/presentation/types';

@ObjectType('WorkOrderSparePart')
export class WorkOrderSparePartType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  workOrderId: string;

  @Field(() => ID)
  sparePartId: string;

  @Field(() => SparePartType)
  sparePart: SparePartType;

  @Field(() => Int)
  quantity: number;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
