import { gql } from '@apollo/client';
import { AREA_BASIC_FRAGMENT, MACHINE_BASIC_FRAGMENT } from './fragments';

export const FINDING_PHOTO_FRAGMENT = gql`
  fragment FindingPhotoBasic on FindingPhoto {
    id
    findingId
    filePath
    fileName
    mimeType
    uploadedAt
  }
`;

export const FINDING_BASIC_FRAGMENT = gql`
  ${AREA_BASIC_FRAGMENT}
  ${MACHINE_BASIC_FRAGMENT}
  ${FINDING_PHOTO_FRAGMENT}
  fragment FindingBasic on Finding {
    id
    folio
    description
    photoPath
    collection
    photos {
      ...FindingPhotoBasic
    }
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

export const GET_FINDING_BY_ID_QUERY = gql`
  ${FINDING_BASIC_FRAGMENT}
  query GetFindingById($id: ID!) {
    finding(id: $id) {
      ...FindingBasic
      machineId
    }
  }
`;

export const UPDATE_FINDING_MUTATION = gql`
  ${FINDING_BASIC_FRAGMENT}
  mutation UpdateFinding($id: ID!, $input: UpdateFindingInput!) {
    updateFinding(id: $id, input: $input) {
      ...FindingBasic
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

export const ADD_FINDING_PHOTO_MUTATION = gql`
  ${FINDING_PHOTO_FRAGMENT}
  mutation AddFindingPhoto(
    $findingId: ID!
    $filePath: String!
    $fileName: String!
    $mimeType: String!
  ) {
    addFindingPhoto(
      findingId: $findingId
      filePath: $filePath
      fileName: $fileName
      mimeType: $mimeType
    ) {
      ...FindingPhotoBasic
    }
  }
`;

export const REMOVE_FINDING_PHOTO_MUTATION = gql`
  mutation RemoveFindingPhoto($id: ID!) {
    removeFindingPhoto(id: $id)
  }
`;

export const GET_FINDINGS_COUNT_BY_DATE_QUERY = gql`
  query GetFindingsCountByDate($date: String!) {
    findingsCountByDate(date: $date)
  }
`;

export const ASSIGN_COLLECTION_BY_DATE_MUTATION = gql`
  mutation AssignCollectionByDate($input: AssignCollectionByDateInput!) {
    assignCollectionByDate(input: $input)
  }
`;

export const HARD_DELETE_FINDING_MUTATION = gql`
  mutation HardDeleteFinding($id: ID!) {
    hardDeleteFinding(id: $id)
  }
`;