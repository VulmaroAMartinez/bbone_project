import { TECHNICIAN_BASIC_FRAGMENT } from "./fragments";
import { gql } from "@apollo/client";

export const GET_TECHNICIANS_QUERY = gql`
  ${TECHNICIAN_BASIC_FRAGMENT}
  query GetTechnicians {
    techniciansActive {
      ...TechnicianBasic
    }
  }
`;

export const GET_TECHNICIANS_DATA_QUERY = gql`
  query GetTechniciansData {
    techniciansWithDeleted {
      id
      isActive
      address
      allergies
      birthDate
      bloodType
      childrenCount
      education
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      hireDate
      nss
      pantsSize
      rfc
      shirtSize
      shoeSize
      transportRoute
      vacationPeriod
      vacationDays
      user {
        id
        firstName
        lastName
        fullName
        employeeNumber
        email
        phone
        departmentId
        roleIds
        roles {
          id
          name
        }
      }
      position {
        id
        name
      }
    }
    departmentsWithDeleted {
      id
      name
    }
    positionsWithDeleted {
      id
      name
    }
    rolesWithDeleted {
      id
      name
    }
  }
`;

export const GET_TECHNICIAN_DETAIL_QUERY = gql`
query GetTechnicianDetail($id: ID!) {
technician(id: $id) {
    id
    isActive
      address
      allergies
      birthDate
      bloodType
      childrenCount
      education
      emergencyContactName
      emergencyContactPhone
      emergencyContactRelationship
      hireDate
      nss
      pantsSize
      rfc
      shirtSize
      shoeSize
      transportRoute
      vacationPeriod
      vacationDays
      user {
        id
        fullName
        employeeNumber
        email
        phone
        department {
          id
          name
        }
      }
      position {
        id
        name
      }
    }
  }
`;

export const CREATE_TECHNICIAN_PROFILE_MUTATION = gql`
  mutation CreateTechnicianProfile($input: CreateTechnicianInput!) {
    createTechnician(input: $input) {
      id
    }
  }
`;

export const UPDATE_TECHNICIAN_PROFILE_MUTATION = gql`
  mutation UpdateTechnicianProfile($id: ID!, $input: UpdateTechnicianInput!) {
    updateTechnician(id: $id, input: $input) {
      id
    }
  }
`;

export const ACTIVATE_TECHNICIAN_MUTATION = gql`
  mutation ActivateTechnician($id: ID!) {
    activateTechnician(id: $id) {
      id
      isActive
    }
  }
`;

export const DEACTIVATE_TECHNICIAN_MUTATION = gql`
  mutation DeactivateTechnician($id: ID!) {
    deactivateTechnician(id: $id)
  }
`;
