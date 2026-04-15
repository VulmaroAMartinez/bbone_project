import { Injectable } from '@nestjs/common';
import { DashboardInput } from '../dto';
import { DashboardRepository } from '../../infrastructure/repositories';
import { DashboardData } from '../../presentation/types';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboardData(input: DashboardInput): Promise<DashboardData> {
    const [
      activeBacklog,
      totalWorkOrders,
      dueToday,
      overdue,
      countByStatus,
      throughputByWeek,
      maintenanceMixByPeriod,
      downtimeByAreaTop5,
      findingsConversion,
      topMachinesByDowntime,
      topTechniciansByClosures,
      findingsByArea,
      workOrdersByArea,
      activitiesByResponsible,
    ] = await Promise.all([
      this.dashboardRepository.getActiveBacklog(input),
      this.dashboardRepository.getTotalWorkOrders(input),
      this.dashboardRepository.getDueToday(input),
      this.dashboardRepository.getOverdue(input),
      this.dashboardRepository.getCountByStatus(input),
      this.dashboardRepository.getThroughputByWeek(input),
      this.dashboardRepository.getMaintenanceMixByPeriod(input),
      this.dashboardRepository.getDowntimeByAreaTop5(input),
      this.dashboardRepository.getFindingsConversion(input),
      this.dashboardRepository.getTopMachinesByDowntime(input),
      this.dashboardRepository.getTopTechniciansByClosures(input),
      this.dashboardRepository.getFindingsByArea(input),
      this.dashboardRepository.getWorkOrdersByArea(input),
      this.dashboardRepository.getActivitiesByResponsible(input),
    ]);

    return {
      kpis: {
        activeBacklog,
        totalWorkOrders,
        dueToday,
        overdue,
        countByStatus,
      },
      charts: {
        throughputByWeek,
        maintenanceMixByPeriod,
        downtimeByAreaTop5,
        findingsConversion,
        findingsByArea,
        workOrdersByArea,
        activitiesByResponsible,
      },
      rankings: {
        topMachinesByDowntime,
        topTechniciansByClosures,
      },
      generatedAt: new Date(),
      cacheTtlSeconds: 60,
    };
  }
}
