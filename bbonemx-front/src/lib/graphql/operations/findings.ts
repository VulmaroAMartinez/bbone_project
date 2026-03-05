import { gql } from '@apollo/client';
import { AREA_BASIC_FRAGMENT, MACHINE_BASIC_FRAGMENT } from './fragments';

export const FINDING_BASIC_FRAGMENT = gql`
  ${AREA_BASIC_FRAGMENT}
  ${MACHINE_BASIC_FRAGMENT}
  fragment FindingBasic on Finding {
    id
    folio
    description
    photoPath
    status
    createdAt
    area {
      ...AreaBasic
    }
    machine {
      ...MachineBasic
    }
    shift {
      id
      name
    }
    convertedToWo {
      id
      folio
    }
  }
`;

export const GET_FINDINGS_FILTERED_QUERY = gql`
  ${FINDING_BASIC_FRAGMENT}
  query GetFindingsFiltered($filters: FindingFiltersInput, $pagination: FindingPaginationInput) {
    findingsFiltered(filters: $filters, pagination: $pagination) {
      data {
        ...FindingBasic
      }
      total
    }
  }
`;

export const CREATE_FINDING_MUTATION = gql`
  mutation CreateFinding($input: CreateFindingInput!) {
    createFinding(input: $input) {
      id
      folio
      status
    }
  }
`;

export const CONVERT_TO_WORK_ORDER_MUTATION = gql`
  mutation ConvertToWorkOrder($id: ID!) {
    convertToWorkOrder(id: $id) {
      id
      status
      convertedToWo {
        id
        folio
      }
    }
  }
`;