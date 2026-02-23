import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, IsOptional, IsString, IsInt, Min } from 'class-validator';

@InputType()
export class AddWorkOrderMaterialInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  workOrderId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  materialId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
