import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { FindingStatus } from "src/common";
import { AreaType, MachineType, ShiftType } from "src/modules/catalogs";    
import { UserType } from "src/modules/users/presentation/types";
import { WorkOrderType } from "src/modules/work-orders";

@ObjectType('Finding')
export class FindingType {
    @Field(() => ID) id: string;
    @Field(() => Int) sequence: number;
    @Field() folio: string;
    @Field(() => AreaType) area: AreaType;
    @Field(() => ID) machineId: string;
    @Field(() => MachineType) machine: MachineType;
    @Field(() => ShiftType) shift: ShiftType;
    @Field() description: string;
    @Field() photoPath: string;
    @Field(() => FindingStatus) status: FindingStatus;
    @Field(() => WorkOrderType, { nullable: true }) convertedToWo?: WorkOrderType;
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
}

@ObjectType()
export class FindingPaginatedResponse {
  @Field(() => [FindingType])
  data: FindingType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class FindingStats {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;
}