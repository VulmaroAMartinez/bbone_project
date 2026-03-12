import { gql } from '@apollo/client';
import { MACHINE_BASIC_FRAGMENT } from './fragments';

export const GET_MACHINES_PAGE_DATA = gql`
  ${MACHINE_BASIC_FRAGMENT}
  query GetMachinesPageData {
    machinesWithDeleted {
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

export const GET_MACHINE = gql`
  ${MACHINE_BASIC_FRAGMENT}
  query GetMachine($id: ID!) {
    machine(id: $id) {
      ...MachineBasic
    }
  }
`;

export const GET_MACHINE_SPARE_PARTS = gql`
  query GetMachineSpareParts($id: ID!) {
    sparePartsByMachine(machineId: $id) {
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
`;

export const GET_MACHINE_WORK_ORDERS = gql`
  query GetMachineWorkOrders($id: String!) {
    workOrdersFiltered(
      filters: { search: $id }
      pagination: { page: 1, limit: 50 }
      sort: { field: "createdAt", order: "DESC" }
    ) {
      data {
        id
        folio
        description
        status
        priority
        maintenanceType
        startDate
        endDate
        createdAt
      }
      total
    }
  }
`;

export const GET_MACHINE_MATERIAL_REQUESTS = gql`
  query GetMachineMaterialRequests($id: ID!) {
    machine(id: $id) {
      id
      code
      name
      materialRequests {
        id
        folio
        category
        priority
        importance
        boss
        isGenericAllowed
        suggestedSupplier
        comments
        justification
        isActive
        createdAt
        items {
          id
          requestedQuantity
          unitOfMeasure
          description
          brand
          partNumber
          material {
            description
            partNumber
            brand
          }
        }
      }
    }
  }
`;

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
