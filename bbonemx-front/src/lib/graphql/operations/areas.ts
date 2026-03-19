import { gql } from '@apollo/client';
import { AREA_BASIC_FRAGMENT, SUB_AREA_BASIC_FRAGMENT } from './fragments';

// ─── Fragment extendido ──────────────────────────────────────────────────────
export const AREA_DETAIL_FRAGMENT = gql`
  fragment AreaDetail on Area {
    id
    name
    type
    description
    isActive
    createdAt
    updatedAt
  }
`;

export const SUB_AREA_DETAIL_FRAGMENT = gql`
  fragment SubAreaDetail on SubArea {
    id
    name
    description
    isActive
    createdAt
    updatedAt
  }
`;

// ─── Queries ─────────────────────────────────────────────────────────────────
export const GET_AREAS_QUERY = gql`
  ${AREA_BASIC_FRAGMENT}
  query GetAreas {
    areas {
      ...AreaBasic
    }
  }
`;

export const GET_AREAS_WITH_DELETED_QUERY = gql`
  ${AREA_DETAIL_FRAGMENT}
  query GetAreasWithDeleted {
    areasWithDeleted {
      ...AreaDetail
    }
  }
`;

export const GET_AREA_QUERY = gql`
  ${AREA_DETAIL_FRAGMENT}
  query GetArea($id: ID!) {
    area(id: $id) {
      ...AreaDetail
    }
  }
`;

export const GET_SUBAREAS_BY_AREA_QUERY = gql`
  ${SUB_AREA_BASIC_FRAGMENT}
  query GetSubAreasByArea($areaId: ID!) {
    subAreasByArea(areaId: $areaId) {
      ...SubAreaBasic
    }
  }
`;

// ─── Queries para páginas relacionadas ───────────────────────────────────────
export const GET_WORK_ORDERS_BY_AREA_QUERY = gql`
  query GetWorkOrdersByArea($areaId: ID!, $page: Int, $limit: Int) {
    workOrdersFiltered(
      filters: { areaId: $areaId }
      pagination: { page: $page, limit: $limit }
      sort: { field: CREATED_AT, order: DESC }
    ) {
      data {
        id
        folio
        description
        status
        priority
        maintenanceType
        createdAt
        subArea { id  name }
        machine { id  name  code }
        requester { id  fullName }
        technicians { isLead  technician { id  fullName } }
      }
      total
      page
      limit
      totalPages
    }
  }
`;


export const GET_FINDINGS_BY_AREA_QUERY = gql`
  query GetFindingsByArea(
    $areaId: ID!
    $page: Int
    $limit: Int
    $status: FindingStatus
    $createdFrom: String
    $createdTo: String
    $search: String
  ) {
    findingsFiltered(
      filters: {
        areaId: $areaId
        status: $status
        createdFrom: $createdFrom
        createdTo: $createdTo
        search: $search
      }
      pagination: { page: $page, limit: $limit }
      sort: { field: "createdAt", order: "DESC" }
    ) {
      data {
        id
        folio
        description
        photoPath
        status
        createdAt
        machine { id  name  code }
        shift { id  name }
        convertedToWo { id  folio }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

// ─── Mutations ───────────────────────────────────────────────────────────────
export const CREATE_AREA_MUTATION = gql`
  ${AREA_DETAIL_FRAGMENT}
  mutation CreateArea($input: CreateAreaInput!) {
    createArea(input: $input) {
      ...AreaDetail
    }
  }
`;

export const UPDATE_AREA_MUTATION = gql`
  ${AREA_DETAIL_FRAGMENT}
  mutation UpdateArea($id: ID!, $input: UpdateAreaInput!) {
    updateArea(id: $id, input: $input) {
      ...AreaDetail
    }
  }
`;

export const DEACTIVATE_AREA_MUTATION = gql`
  mutation DeactivateArea($id: ID!) {
    deactivateArea(id: $id)
  }
`;

export const ACTIVATE_AREA_MUTATION = gql`
  ${AREA_DETAIL_FRAGMENT}
  mutation ActivateArea($id: ID!) {
    activateArea(id: $id) {
      ...AreaDetail
    }
  }
`;

export const CREATE_SUB_AREA_MUTATION = gql`
  ${SUB_AREA_DETAIL_FRAGMENT}
  mutation CreateSubArea($input: CreateSubAreaInput!) {
    createSubArea(input: $input) {
      ...SubAreaDetail
    }
  }
`;

export const UPDATE_SUB_AREA_MUTATION = gql`
  ${SUB_AREA_DETAIL_FRAGMENT}
  mutation UpdateSubArea($id: ID!, $input: UpdateSubAreaInput!) {
    updateSubArea(id: $id, input: $input) {
      ...SubAreaDetail
    }
  }
`;

export const DEACTIVATE_SUB_AREA_MUTATION = gql`
  mutation DeactivateSubArea($id: ID!) {
    deactivateSubArea(id: $id)
  }
`;