import { gql } from '@apollo/client';

export const GET_OVERTIME_RECORDS_QUERY = gql`
  query GetOvertimeRecords(
    $startDate: String
    $endDate: String
    $positionId: ID
    $reasonForPayment: ReasonForPayment
  ) {
    overtimeRecords(
      startDate: $startDate
      endDate: $endDate
      positionId: $positionId
      reasonForPayment: $reasonForPayment
    ) {
      id
      workDate
      startTime
      endTime
      workTime
      activity
      reasonForPayment
      technicianId
      technician {
        id
        user {
          id
          employeeNumber
          firstName
          lastName
        }
        position {
          id
          name
        }
      }
      createdAt
    }
  }
`;

export const GET_MY_OVERTIME_RECORDS_QUERY = gql`
  query GetMyOvertimeRecords {
    myOvertimeRecords {
      id
      workDate
      startTime
      endTime
      workTime
      activity
      reasonForPayment
      technicianId
      technician {
        id
        user {
          id
          employeeNumber
          firstName
          lastName
        }
        position {
          id
          name
        }
      }
      createdAt
    }
  }
`;

export const GET_OVERTIME_RECORD_QUERY = gql`
  query GetOvertimeRecord($id: ID!) {
    overtimeRecord(id: $id) {
      id
      workDate
      startTime
      endTime
      workTime
      activity
      reasonForPayment
      technicianId
      technician {
        id
        user {
          id
          employeeNumber
          firstName
          lastName
        }
        position {
          id
          name
        }
      }
      createdAt
    }
  }
`;

export const CREATE_OVERTIME_MUTATION = gql`
  mutation CreateOvertime($input: CreateOvertimeInput!) {
    createOvertime(input: $input) {
      id
      workDate
      startTime
      endTime
      workTime
      activity
      reasonForPayment
      technicianId
    }
  }
`;

export const UPDATE_OVERTIME_MUTATION = gql`
  mutation UpdateOvertime($input: UpdateOvertimeInput!) {
    updateOvertime(input: $input) {
      id
      workDate
      startTime
      endTime
      workTime
      activity
      reasonForPayment
      technicianId
    }
  }
`;

export const DELETE_OVERTIME_MUTATION = gql`
  mutation DeleteOvertime($id: ID!) {
    deleteOvertime(id: $id)
  }
`;

export const GET_ACTIVE_TECHNICIANS_QUERY = gql`
  query GetActiveTechniciansForOvertime {
    techniciansActive {
      id
      user {
        id
        employeeNumber
        firstName
        lastName
      }
      position {
        id
        name
      }
    }
  }
`;

export const GET_POSITIONS_QUERY = gql`
  query GetOvertimePositions {
    positions {
      id
      name
      isActive
    }
  }
`;
