import { gql } from '@apollo/client';

export const SCHEDULE_ITEM_FRAGMENT = gql`
  fragment ScheduleItem on TechnicianSchedule {
    id
    technicianId
    shiftId
    absenceReasonId
    scheduleDate
    weekNumber
    year
    notes
    isActive
    shift {
      id
      name
      startTime
      endTime
    }
    absenceReason {
      id
      name
      isActive
      maxPerWeek
    }
    technician {
      id
      fullName
    }
  }
`;

export const GET_WEEK_SCHEDULE_QUERY = gql`
  ${SCHEDULE_ITEM_FRAGMENT}
  query GetWeekSchedule($weekNumber: Int!, $year: Int!) {
    weekSchedule(weekNumber: $weekNumber, year: $year) {
      weekNumber
      year
      totalAssignments
      totalAbsences
      totalWorkDays
      schedules {
        ...ScheduleItem
      }
    }
  }
`;

export const GET_SCHEDULE_TECHNICIANS_QUERY = gql`
  query GetScheduleTechnicians {
    techniciansWithDeleted {
      id
      isActive
      user {
        id
        fullName
        employeeNumber
      }
      position {
        name
      }
    }
  }
`;

export const GET_ABSENCE_REASONS_ACTIVE_QUERY = gql`
  query GetAbsenceReasonsActive {
    absenceReasonsActive {
      id
      name
      isActive
      maxPerWeek
    }
  }
`;

export const ASSIGN_WEEK_SCHEDULE_MUTATION = gql`
  ${SCHEDULE_ITEM_FRAGMENT}
  mutation AssignWeekSchedule($input: AssignWeekScheduleInput!) {
    assignWeekSchedule(input: $input) {
      ...ScheduleItem
    }
  }
`;

export const CREATE_TECHNICIAN_SCHEDULE_MUTATION = gql`
  ${SCHEDULE_ITEM_FRAGMENT}
  mutation CreateTechnicianSchedule($input: CreateScheduleInput!) {
    createTechnicianSchedule(input: $input) {
      ...ScheduleItem
    }
  }
`;

export const UPDATE_TECHNICIAN_SCHEDULE_MUTATION = gql`
  ${SCHEDULE_ITEM_FRAGMENT}
  mutation UpdateTechnicianSchedule($id: ID!, $input: UpdateScheduleInput!) {
    updateTechnicianSchedule(id: $id, input: $input) {
      ...ScheduleItem
    }
  }
`;

export const DELETE_TECHNICIAN_SCHEDULE_MUTATION = gql`
  mutation DeleteTechnicianSchedule($id: ID!) {
    deleteTechnicianSchedule(id: $id)
  }
`;

export const COPY_WEEK_SCHEDULES_MUTATION = gql`
  ${SCHEDULE_ITEM_FRAGMENT}
  mutation CopyWeekSchedules($input: CopyWeekSchedulesInput!) {
    copyWeekSchedules(input: $input) {
      ...ScheduleItem
    }
  }
`;

export const GET_TECHNICIAN_WEEK_SCHEDULE_QUERY = gql`
  ${SCHEDULE_ITEM_FRAGMENT}
  query GetTechnicianWeekSchedule($technicianId: ID!, $weekNumber: Int!, $year: Int!) {
    technicianWeekSchedule(technicianId: $technicianId, weekNumber: $weekNumber, year: $year) {
      ...ScheduleItem
    }
  }
`;
