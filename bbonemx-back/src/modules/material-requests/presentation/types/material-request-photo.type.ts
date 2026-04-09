import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('MaterialRequestPhoto')
export class MaterialRequestPhotoType {
  @Field(() => ID) id: string;
  @Field(() => ID) materialRequestId: string;
  @Field() filePath: string;
  @Field() fileName: string;
  @Field() mimeType: string;
  @Field(() => ID) uploadedBy: string;
  @Field() uploadedAt: Date;
  @Field() isActive: boolean;
  @Field() createdAt: Date;
}
