import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from './fragments';

export const LOGIN_MUTATION = gql`
  ${USER_BASIC_FRAGMENT}
  mutation Login($employeeNumber: String!, $password: String!) {
    login(input: { employeeNumber: $employeeNumber, password: $password }) {
      accessToken
      user {
        ...UserBasic
      }
    }
  }
`;

export const ME_QUERY = gql`
  ${USER_BASIC_FRAGMENT}
  query Me {
    me {
      ...UserBasic
    }
  }
`;