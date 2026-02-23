import { Args, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { DashboardData } from "../types";
import { DashboardInput } from "../../application/dto";
import { DashboardService } from "../../application/services";
import { JwtAuthGuard, RolesGuard, Role, Roles } from "src/common";

@Resolver(() => DashboardData)
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardData, { name: 'dashboardData' })
  @Roles(Role.ADMIN)
  dashboardData(@Args('input') input: DashboardInput): Promise<DashboardData> {
    return this.dashboardService.getDashboardData(input);
  }
}