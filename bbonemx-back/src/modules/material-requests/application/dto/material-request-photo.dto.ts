import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateMaterialRequestPhotoInput {
  @Field(() => ID)
  @IsUUID()
  materialRequestId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
