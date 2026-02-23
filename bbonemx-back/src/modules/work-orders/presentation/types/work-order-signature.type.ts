import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserType } from '../../../users/presentation/types';

@ObjectType('WorkOrderSignature')
export class WorkOrderSignatureType {
  @Field(() => ID) 
  id: string;

  @Field(() => ID) 
  workOrderId: string;

  @Field(() => ID) 
  signerId: string;

  @Field(() => UserType) 
  signer: UserType;

  @Field() 
  signatureImagePath: string;

  @Field() 
  signedAt: Date;

  @Field() 
  isActive: boolean;

  @Field() 
  createdAt: Date;
}
