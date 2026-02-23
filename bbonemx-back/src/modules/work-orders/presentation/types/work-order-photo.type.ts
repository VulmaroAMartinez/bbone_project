import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PhotoType } from '../../../../common/enums';
import { UserType } from '../../../users/presentation/types';

@ObjectType('WorkOrderPhoto')
export class WorkOrderPhotoType {
  @Field(() => ID) 
  id: string;

  @Field(() => ID) 
  workOrderId: string;

  @Field(() => PhotoType) 
  photoType: PhotoType;

  @Field() 
  filePath: string;

  @Field() 
  fileName: string;

  @Field() 
  mimeType: string;

  @Field() 
  uploadedAt: Date;

  @Field(() => ID) 
  uploadedBy: string;

  @Field(() => UserType) 
  uploader: UserType;

  @Field() 
  isActive: boolean;

  @Field() 
  createdAt: Date;
}