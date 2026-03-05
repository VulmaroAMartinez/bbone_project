import { gql } from '@apollo/client';
import { MACHINE_BASIC_FRAGMENT } from './fragments';

// ─── Queries ────────────────────────────────────────────────

/** Datos de la página principal: máquinas + áreas para filtros */
export const GET_MACHINES_PAGE_DATA = gql`
  ${MACHINE_BASIC_FRAGMENT}
  query GetMachinesPageData {
    machines {
      ...MachineBasic
    }
    areasActive {
      id
      name
      type
    }
    subAreasActive {
      id
      name
    }
  }
`;

/** Máquina individual con todas sus relaciones */
export const GET_MACHINE = gql`
  ${MACHINE_BASIC_FRAGMENT}
  query GetMachine($id: ID!) {
    machine(id: $id) {
      ...MachineBasic
    }
  }
`;

/** Refacciones (spare parts) de una máquina */
export const GET_MACHINE_SPARE_PARTS = gql`
  query GetMachineSpareParts($id: ID!) {
    machine(id: $id) {
      id
      name
      code
      spareParts {
        id
        partNumber
        brand
        model
        supplier
        unitOfMeasure
        isActive
        createdAt
      }
    }
  }
`;

/** Órdenes de trabajo de una máquina */
export const GET_MACHINE_WORK_ORDERS = gql`
  query GetMachineWorkOrders($id: ID!) {
    machine(id: $id) {
      id
      name
      code
      workOrders {
        id
        folio
        description
        status
        priority
        maintenanceType
        startDate
        endDate
        createdAt
        requester {
          id
          fullName
        }
        area {
          id
          name
        }
      }
    }
  }
`;

/** Solicitudes de material de una máquina */
export const GET_MACHINE_MATERIAL_REQUESTS = gql`
  query GetMachineMaterialRequests($id: ID!) {
    machine(id: $id) {
      id
      name
      code
      materialRequests {
        id
        folio
        category
        priority
        importance
        comments
        justification
        isGenericAllowed
        suggestedSupplier
        createdAt
        items {
          id
          requestedQuantity
          unitOfMeasure
          description
          material {
            id
            description
            partNumber
            brand
          }
        }
      }
    }
  }
`;

// ─── Mutations ──────────────────────────────────────────────

export const CREATE_MACHINE = gql`
  ${MACHINE_BASIC_FRAGMENT}
  mutation CreateMachine($input: CreateMachineInput!) {
    createMachine(input: $input) {
      ...MachineBasic
    }
  }
`;

export const UPDATE_MACHINE = gql`
  ${MACHINE_BASIC_FRAGMENT}
  mutation UpdateMachine($id: ID!, $input: UpdateMachineInput!) {
    updateMachine(id: $id, input: $input) {
      ...MachineBasic
    }
  }
`;

export const DEACTIVATE_MACHINE = gql`
  mutation DeactivateMachine($id: ID!) {
    deactivateMachine(id: $id)
  }
`;

export const ACTIVATE_MACHINE = gql`
  ${MACHINE_BASIC_FRAGMENT}
  mutation ActivateMachine($id: ID!) {
    activateMachine(id: $id) {
      ...MachineBasic
    }
  }
`;

export const GET_MACHINES_BY_AREA = gql`
  ${MACHINE_BASIC_FRAGMENT}
  query GetMachinesByArea($areaId: ID, $subAreaId: ID) {
    machinesByArea(areaId: $areaId, subAreaId: $subAreaId) {
      ...MachineBasic
    }
  }
`;