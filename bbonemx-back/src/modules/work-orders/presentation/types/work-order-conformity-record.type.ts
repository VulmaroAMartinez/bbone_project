import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { ConformityQ1Answer } from '../../domain/entities';
import { UserType } from '../../../users/presentation/types';

@ObjectType('WorkOrderConformityRecord')
export class WorkOrderConformityRecordType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  workOrderId: string;

  @Field(() => Int)
  cycleNumber: number;

  @Field(() => ConformityQ1Answer)
  question1Answer: ConformityQ1Answer;

  @Field()
  question2Answer: boolean;

  @Field()
  question3Answer: boolean;

  /** Respuesta a P4: ¿Estoy conforme? */
  @Field()
  isConforming: boolean;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => ID)
  respondedById: string;

  @Field(() => UserType)
  respondedBy: UserType;

  @Field()
  respondedAt: Date;

  @Field()
  previousStatus: string;

  @Field()
  createdAt: Date;
}
