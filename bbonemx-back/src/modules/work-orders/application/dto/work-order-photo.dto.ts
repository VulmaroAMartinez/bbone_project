import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsEnum, MaxLength } from 'class-validator';
import { PhotoType } from '../../../../common/enums';

@InputType()
export class CreateWorkOrderPhotoInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  workOrderId: string;

  @Field(() => PhotoType)
  @IsNotEmpty()
  @IsEnum(PhotoType)
  photoType: PhotoType;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  filePath: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fileName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  mimeType: string;
}
