import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class CronJobStatus {
    @Field()
    name: string;

    @Field()
    enabled: boolean;

    @Field()
    cronExpression: string;

    @Field({nullable: true})
    nextRunAt?: Date;

    @Field(() => Int, {nullable: true})
    retentionDays?: number;
}

@ObjectType()
export class SchedulerStatus {

    @Field()
    globalEnabled: boolean;

    @Field(() => [CronJobStatus])
    jobs: CronJobStatus[];
}

@ObjectType()
export class CleanupTableResult {
  @Field()
  table: string;

  @Field(() => Int)
  deleted: number;
}

@ObjectType()
export class CleanupResult {
  @Field(() => [CleanupTableResult])
  results: CleanupTableResult[];

  @Field(() => Int)
  totalDeleted: number;
}