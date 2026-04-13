import { gql } from '@apollo/client';
import { MACHINE_BASIC_FRAGMENT } from './fragments';


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

export const GET_MATERIALS_QUERY = gql`
  query GetMaterials {
    materialsWithDeleted {
      id
      description
      brand
      manufacturer
      model
      partNumber
      sku
      unitOfMeasure
      isActive
      createdAt
    }
  }
`;

export const CREATE_MATERIAL_MUTATION = gql`
  mutation CreateMaterial($input: CreateMaterialInput!) {
    createMaterial(input: $input) {
      id
      description
      isActive
    }
  }
`;

export const UPDATE_MATERIAL_MUTATION = gql`
  mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {
    updateMaterial(id: $id, input: $input) {
      id
      description
    }
  }
`;

export const ACTIVATE_MATERIAL_MUTATION = gql`
  mutation ActivateMaterial($id: ID!) {
    activateMaterial(id: $id) {
      id
      isActive
    }
  }
`;

export const DEACTIVATE_MATERIAL_MUTATION = gql`
  mutation DeactivateMaterial($id: ID!) {
    deactivateMaterial(id: $id)
  }
`;

// ================= REFACCIONES (SPARE PARTS) =================
export const GET_SPARE_PARTS_QUERY = gql`
  ${MACHINE_BASIC_FRAGMENT}
  query GetSpareParts {
    sparePartsWithDeleted {
      id
      partNumber
      sku
      brand
      model
      supplier
      unitOfMeasure
      description
      cantidad
      costo
      precioTotal
      isActive
      createdAt
      machine {
        ...MachineBasic
      }
    }
  }
`;

export const CREATE_SPARE_PART_MUTATION = gql`
  mutation CreateSparePart($input: CreateSparePartInput!) {
    createSparePart(input: $input) {
      id
      partNumber
      isActive
    }
  }
`;

export const UPDATE_SPARE_PART_MUTATION = gql`
  mutation UpdateSparePart($id: ID!, $input: UpdateSparePartInput!) {
    updateSparePart(id: $id, input: $input) {
      id
      partNumber
    }
  }
`;

export const ACTIVATE_SPARE_PART_MUTATION = gql`
  mutation ActivateSparePart($id: ID!) {
    activateSparePart(id: $id) {
      id
      isActive
    }
  }
`;

export const DEACTIVATE_SPARE_PART_MUTATION = gql`
  mutation DeactivateSparePart($id: ID!) {
    deactivateSparePart(id: $id)
  }
`;


// ================= POSITIONS (CARGOS) =================
export const GET_POSITIONS_QUERY = gql`
  query GetPositions {
    positionsWithDeleted {
      id
      name
      description
      isActive
      createdAt
    }
  }
`;

export const CREATE_POSITION_MUTATION = gql`
  mutation CreatePosition($input: CreatePositionInput!) {
    createPosition(input: $input) {
      id
      name
      isActive
    }
  }
`;

export const UPDATE_POSITION_MUTATION = gql`
  mutation UpdatePosition($id: ID!, $input: UpdatePositionInput!) {
    updatePosition(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;

export const ACTIVATE_POSITION_MUTATION = gql`
  mutation ActivatePosition($id: ID!) {
    activatePosition(id: $id) {
      id
      isActive
    }
  }
`;

export const DEACTIVATE_POSITION_MUTATION = gql`
  mutation DeactivatePosition($id: ID!) {
    deactivatePosition(id: $id)
  }
`;

// ================= SHIFTS (TURNOS) =================
export const GET_SHIFTS_ALL_QUERY = gql`
  query GetShiftsAll {
    shiftsWithDeleted {
      id
      name
      startTime
      endTime
      isActive
      createdAt
    }
  }
`;

export const CREATE_SHIFT_MUTATION = gql`
  mutation CreateShift($input: CreateShiftInput!) {
    createShift(input: $input) {
      id
      name
      isActive
    }
  }
`;

export const UPDATE_SHIFT_MUTATION = gql`
  mutation UpdateShift($id: ID!, $input: UpdateShiftInput!) {
    updateShift(id: $id, input: $input) {
      id
      name
      startTime
      endTime
    }
  }
`;

export const ACTIVATE_SHIFT_MUTATION = gql`
  mutation ActivateShift($id: ID!) {
    activateShift(id: $id) {
      id
      isActive
    }
  }
`;

export const DEACTIVATE_SHIFT_MUTATION = gql`
  mutation DeactivateShift($id: ID!) {
    deactivateShift(id: $id)
  }
`;

// ================= DEPARTMENTS (DEPARTAMENTOS) =================
export const GET_DEPARTMENTS_QUERY = gql`
  query GetDepartments {
    departmentsWithDeleted {
      id
      name
      description
      isActive
      createdAt
    }
  }
`;

export const CREATE_DEPARTMENT_MUTATION = gql`
  mutation CreateDepartment($input: CreateDepartmentInput!) {
    createDepartment(input: $input) {
      id
      name
      isActive
    }
  }
`;

export const UPDATE_DEPARTMENT_MUTATION = gql`
  mutation UpdateDepartment($id: ID!, $input: UpdateDepartmentInput!) {
    updateDepartment(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;

export const ACTIVATE_DEPARTMENT_MUTATION = gql`
  mutation ActivateDepartment($id: ID!) {
    activateDepartment(id: $id) {
      id
      isActive
    }
  }
`;

export const DEACTIVATE_DEPARTMENT_MUTATION = gql`
  mutation DeactivateDepartment($id: ID!) {
    deactivateDepartment(id: $id)
  }
`;