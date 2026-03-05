import { gql } from "@apollo/client";

export const GET_DASHBOARD_DATA_QUERY = gql`
query GetDashboardData($input: DashboardInput!) {
    dashboardData(input: $input) {
      generatedAt
      kpis {
        activeBacklog
        leadTimeHoursAvg
        mttrHoursAvg
        preventiveComplianceRate
      }
      charts {
        downtimeByAreaTop5 {
          areaId
          areaName
          value
        }
        findingsConversion {
          key
          value
        }
        maintenanceMixByPeriod {
          period
          type
          count
        }
        throughputByWeek {
          period
          count
        }
      }
      rankings {
        topMachinesByDowntime {
          machineId
          machineName
          value
        }
        topTechniciansByClosures {
          technicianId
          technicianName
          value
        }
      }
    }
  }
`;