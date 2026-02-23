import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class CreateWorkOrderSignatureInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  workOrderId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  signatureImagePath: string;

}