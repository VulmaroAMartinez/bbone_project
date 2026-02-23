import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TimeCount {
    @Field()
    period: string;

    @Field(() => Int)
    count: number;
}

@ObjectType()
export class MixPoint {
    @Field()
    period: string;
    
    @Field()
    type: string;

    @Field(() => Int)
    count: number;
}

@ObjectType()
export class AreaMetric {
    @Field()
    areaId: string;

    @Field()
    areaName: string;

    @Field(() => Int)
    value: number;
}

@ObjectType()
export class MachineMetric {
    @Field({nullable: true})
    machineId?: string;

    @Field()
    machineName: string;

    @Field(() => Int)
    value: number;
}

@ObjectType()
export class TechnicianMetric {
  @Field()
  technicianId: string;

  @Field()
  technicianName: string;

  @Field(() => Int)
  value: number;
}

@ObjectType()
export class KeyValue {
  @Field()
  key: string;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class DashboardKpis {
  @Field(() => Int)
  activeBacklog: number;

  @Field(() => Float)
  leadTimeHoursAvg: number;

  @Field(() => Float)
  mttrHoursAvg: number;

  @Field(() => Float)
  preventiveComplianceRate: number;
}

@ObjectType()
export class DashboardCharts {
  @Field(() => [TimeCount])
  throughputByWeek: TimeCount[];

  @Field(() => [MixPoint])
  maintenanceMixByPeriod: MixPoint[];

  @Field(() => [AreaMetric])
  downtimeByAreaTop5: AreaMetric[];

  @Field(() => [KeyValue])
  findingsConversion: KeyValue[];
}

@ObjectType()
export class DashboardRankings {
  @Field(() => [MachineMetric])
  topMachinesByDowntime: MachineMetric[];

  @Field(() => [TechnicianMetric])
  topTechniciansByClosures: TechnicianMetric[];
}

@ObjectType()
export class DashboardData {
  @Field(() => DashboardKpis)
  kpis: DashboardKpis;

  @Field(() => DashboardCharts)
  charts: DashboardCharts;

  @Field(() => DashboardRankings)
  rankings: DashboardRankings;

  @Field()
  generatedAt: Date;

  @Field(() => Int)
  cacheTtlSeconds: number;
}