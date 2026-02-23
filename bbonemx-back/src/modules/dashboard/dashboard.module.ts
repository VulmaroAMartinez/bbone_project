import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from '../work-orders/domain/entities';
import { Finding } from '../findings/domain/entities';
import { PreventiveTask } from '../preventive-tasks/domain/entities';
import { DashboardRepository } from './infrastructure/repositories';
import { DashboardService } from './application/services';
import { DashboardResolver } from './presentation/resolvers';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, Finding, PreventiveTask])],
  providers: [DashboardRepository, DashboardService, DashboardResolver],
  exports: [DashboardService],
})
export class DashboardModule {}
