import { gql } from "@apollo/client";

export const GET_DASHBOARD_DATA_QUERY = gql`
query GetDashboardData($input: DashboardInput!) {
    dashboardData(input: $input) {
      generatedAt
      kpis {
        activeBacklog
        totalWorkOrders
        dueToday
        overdue
        countByStatus {
          status
          count
        }
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
        findingsByArea {
          areaId
          areaName
          value
        }
        workOrdersByArea {
          areaId
          areaName
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
        activitiesByResponsible {
          responsibleId
          responsibleName
          totalActivities
          activitiesWithEndDate
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