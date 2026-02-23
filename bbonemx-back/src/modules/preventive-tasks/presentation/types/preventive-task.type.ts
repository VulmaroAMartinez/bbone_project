import { ID, ObjectType, Field, Int } from "@nestjs/graphql";
import { FrequencyType, FrequencyUnit, PreventiveTaskStatus } from "src/common";
import { MachineType } from "src/modules/catalogs";

@ObjectType('PreventiveTask')
export class PreventiveTaskType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  machineId: string;

  @Field(() => MachineType)
  machine: MachineType;

  @Field()
  description: string;

  @Field(() => FrequencyType)
  frequencyType: FrequencyType;

  @Field(() => Int, { nullable: true })
  frequencyValue?: number;

  @Field(() => FrequencyUnit, { nullable: true })
  frequencyUnit?: FrequencyUnit;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  nextExecutionDate?: Date;

  @Field(() => Int)
  advanceHours: number;

  @Field(() => PreventiveTaskStatus)
  status: PreventiveTaskStatus;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  policyChangeNote?: string;

  @Field(() => ID, { nullable: true })
  parentTaskId?: string;

  @Field(() => PreventiveTaskType, { nullable: true })
  parentTask?: PreventiveTaskType;

  @Field({ nullable: true })
  lastWoGeneratedAt?: Date;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ description: 'Descripción legible de la frecuencia' })
  frequencyDescription: string;
}

@ObjectType()
export class PreventiveTaskPaginatedResponse {
  @Field(() => [PreventiveTaskType])
  data: PreventiveTaskType[];

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
export class PreventiveTaskStats {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class GenerateWorkOrdersResult {
  @Field(() => Int)
  generated: number;

  @Field(() => [String])
  tasks: string[];
}