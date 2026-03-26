import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  RequestPriority,
  RequestImportance,
  RequestCategory,
} from 'src/common';
import { UserType } from 'src/modules/users';
import { MaterialRequestItemType } from './material-request-item.type';
import { MaterialRequestMachineType } from './material-request-machine.type';
import { MaterialRequestHistoryType } from './material-request-history.type';

@ObjectType('MaterialRequest')
export class MaterialRequestType {
  @Field(() => ID) id: string;
  @Field(() => Int) sequence: number;
  @Field() boss: string;
  @Field() folio: string;
  @Field({ nullable: true }) customMachineName?: string;
  @Field({ nullable: true }) customMachineBrand?: string;
  @Field({ nullable: true }) customMachineModel?: string;
  @Field({ nullable: true }) customMachineManufacturer?: string;
  @Field(() => [MaterialRequestMachineType])
  machines: MaterialRequestMachineType[];
  @Field(() => ID) requesterId: string;
  @Field(() => UserType) requester: UserType;
  @Field(() => RequestPriority) priority: RequestPriority;
  @Field(() => RequestImportance) importance: RequestImportance;
  @Field(() => RequestCategory) category: RequestCategory;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) justification?: string;
  @Field({ nullable: true }) comments?: string;
  @Field({ nullable: true }) suggestedSupplier?: string;
  @Field(() => [MaterialRequestItemType]) items: MaterialRequestItemType[];
  @Field(() => [MaterialRequestHistoryType], { nullable: true })
  histories?: MaterialRequestHistoryType[];
  @Field(() => Date, { nullable: true }) emailSentAt?: Date | null;
  @Field() isActive: boolean;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
