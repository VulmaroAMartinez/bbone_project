import { gql } from '@apollo/client';

export const ROLE_BASIC_FRAGMENT = gql`
  fragment RoleBasic on Role {
    id
    name
  }
`;

export const USER_BASIC_FRAGMENT = gql`
  ${ROLE_BASIC_FRAGMENT}
  fragment UserBasic on User {
    id
    employeeNumber
    firstName
    lastName
    fullName
    email
    isActive
    roleIds
    areaId
    subAreaId
    role {
      ...RoleBasic
    }
    roles {
      ...RoleBasic
    }
  }
`;

export const AREA_BASIC_FRAGMENT = gql`
  fragment AreaBasic on Area {
    id
    name
    type
    description
    isActive
  }
`;

export const SUB_AREA_BASIC_FRAGMENT = gql`
  fragment SubAreaBasic on SubArea {
    id
    name
    description
    isActive
    areaId
  }
`;

export const MACHINE_BASIC_FRAGMENT = gql`
  fragment MachineBasic on Machine {
    id
    code
    name
    description
    brand
    model
    serialNumber
    installationDate
    machinePhotoUrl
    operationalManualUrl
    isActive
    subAreaId
    areaId
    subArea {
      id
      name
      area {
        id
        name
        type
      }
    }
    area {
      id
      name
      type
    }
    createdAt
    updatedAt
  }
`;



export const POSITION_BASIC_FRAGMENT = gql`
  fragment PositionBasic on Position {
    id
    name
    description
    isActive
  }
`;

export const TECHNICIAN_BASIC_FRAGMENT = gql`
  ${USER_BASIC_FRAGMENT}
  ${POSITION_BASIC_FRAGMENT}
  fragment TechnicianBasic on Technician {
    id
    isActive
    user {
      ...UserBasic
    }
    position {
      ...PositionBasic
    }
  }
`;
