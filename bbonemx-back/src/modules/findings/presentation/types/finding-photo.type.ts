import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('FindingPhoto')
export class FindingPhotoType {
  @Field(() => ID) id: string;
  @Field() findingId: string;
  @Field() filePath: string;
  @Field() fileName: string;
  @Field() mimeType: string;
  @Field() uploadedAt: Date;
  @Field() uploadedBy: string;
  @Field() createdAt: Date;
}
