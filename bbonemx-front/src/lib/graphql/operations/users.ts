import { gql } from '@apollo/client';

export const GET_REQUESTERS_DATA_QUERY = gql`
  query GetRequestersData {
    usersWithDeleted {
      id
      employeeNumber
      firstName
      lastName
      fullName
      email
      phone
      isActive
      department {
        id
        name
      }
      role {
        id
        name
      }
    }
    departmentsWithDeleted {
      id
      name
    }
    rolesWithDeleted {
      id
      name
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      fullName
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      fullName
    }
  }
`;

export const DEACTIVATE_USER_MUTATION = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id)
  }
`;

export const ACTIVATE_USER_MUTATION = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id)
  }
`;