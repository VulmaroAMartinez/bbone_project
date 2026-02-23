import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { MaterialType } from '../../../catalogs/materials/presentation/types';

@ObjectType('WorkOrderMaterial')
export class WorkOrderMaterialType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  workOrderId: string;

  @Field(() => ID)
  materialId: string;

  @Field(() => MaterialType)
  material: MaterialType;

  @Field(() => Int)
  quantity: number;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
