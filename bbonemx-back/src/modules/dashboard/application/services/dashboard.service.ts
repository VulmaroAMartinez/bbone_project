import { Injectable } from "@nestjs/common";
import { DashboardInput } from "../dto";
import { DashboardRepository } from "../../infrastructure/repositories";
import { DashboardData } from "../../presentation/types";

@Injectable()
export class DashboardService {
    constructor(private readonly dashboardRepository: DashboardRepository) { }

    async getDashboardData(input: DashboardInput): Promise<DashboardData> {
        const [
            activeBacklog,
            leadTimeHoursAvg,
            mttrHoursAvg,
            preventiveComplianceRate,
            throughputByWeek,
            maintenanceMixByPeriod,
            downtimeByAreaTop5,
            findingsConversion,
            topMachinesByDowntime,
            topTechniciansByClosures,
        ] = await Promise.all([
            this.dashboardRepository.getActiveBacklog(input),
            this.dashboardRepository.getLeadTimeHoursAvg(input),
            this.dashboardRepository.getMttrHoursAvg(input),
            this.dashboardRepository.getPreventiveComplianceRate(input),
            this.dashboardRepository.getThroughputByWeek(input),
            this.dashboardRepository.getMaintenanceMixByPeriod(input),
            this.dashboardRepository.getDowntimeByAreaTop5(input),
            this.dashboardRepository.getFindingsConversion(input),
            this.dashboardRepository.getTopMachinesByDowntime(input),
            this.dashboardRepository.getTopTechniciansByClosures(input),
        ]);

        return {
            kpis: {
                activeBacklog,
                leadTimeHoursAvg,
                mttrHoursAvg,
                preventiveComplianceRate,
            },
            charts: {
                throughputByWeek,
                maintenanceMixByPeriod,
                downtimeByAreaTop5,
                findingsConversion,
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