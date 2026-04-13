import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { MachineType } from 'src/modules/catalogs/machines/presentation/types';

@ObjectType('SparePart')
export class SparePartType {
  @Field(() => ID) id: string;
  @Field(() => ID) machineId: string;
  @Field(() => MachineType) machine: MachineType;
  @Field() partNumber: string;
  @Field({ nullable: true }) sku?: string;
  @Field({ nullable: true }) brand?: string;
  @Field({ nullable: true }) model?: string;
  @Field({ nullable: true }) supplier?: string;
  @Field({ nullable: true }) unitOfMeasure?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Float, { nullable: true }) cantidad?: number;
  @Field(() => Float, { nullable: true }) costo?: number;
  @Field(() => Float, { nullable: true }) precioTotal?: number;
  @Field() isActive: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
