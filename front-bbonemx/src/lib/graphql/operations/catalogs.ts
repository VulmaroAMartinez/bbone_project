import { gql } from '@apollo/client';
import { MACHINE_BASIC_FRAGMENT, TECHNICIAN_BASIC_FRAGMENT } from './fragments';

export const GET_TECHNICIANS_QUERY = gql`
  ${TECHNICIAN_BASIC_FRAGMENT}
  query GetTechnicians {
    techniciansActive {
      ...TechnicianBasic
    }
  }
`;

export const GET_SHIFTS_QUERY = gql`
  query GetShifts {
    shiftsActive {
      id
      name
      startTime
      endTime
      isActive
    }
  }
`;

export const GET_MACHINES_QUERY = gql`
  ${MACHINE_BASIC_FRAGMENT}
  query GetMachines {
    machinesActive {
      ...MachineBasic
      subAreaId
    }
  }
`;