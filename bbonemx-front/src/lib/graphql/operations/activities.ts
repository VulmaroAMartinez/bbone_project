import { gql } from '@apollo/client';
import { AREA_BASIC_FRAGMENT, USER_BASIC_FRAGMENT } from './fragments';

export const ACTIVITY_ITEM_FRAGMENT = gql`
  ${AREA_BASIC_FRAGMENT}
  ${USER_BASIC_FRAGMENT}
  fragment ActivityItem on Activity {
    id
    activity
    startDate
    endDate
    progress
    status
    comments
    priority
    isActive
    createdAt
    updatedAt
    areaId
    area {
      ...AreaBasic
    }
    machineId
    machine {
      id
      name
      code
    }
    technicians {
      id
      technicianId
      assignedAt
      technician {
        ...UserBasic
      }
    }
  }
`;

// ======= QUERIES =======

export const GET_ACTIVITIES_FILTERED_QUERY = gql`
  ${ACTIVITY_ITEM_FRAGMENT}
  query GetActivitiesFiltered(
    $filters: ActivityFiltersInput
    $pagination: ActivityPaginationInput
    $sort: ActivitySortInput
  ) {
    activitiesFiltered(filters: $filters, pagination: $pagination, sort: $sort) {
      data {
        ...ActivityItem
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_ACTIVITY_BY_ID_QUERY = gql`
  ${ACTIVITY_ITEM_FRAGMENT}
  query GetActivityById($id: ID!) {
    activity(id: $id) {
      ...ActivityItem
      workOrders {
        id
        workOrderId
        createdAt
        workOrder {
          id
          folio
          description
          status
          area {
            id
            name
          }
          createdAt
        }
      }
      materialRequests {
        id
        materialRequestId
        createdAt
        materialRequest {
          id
          folio
          category
          importance
          priority
          createdAt
        }
      }
    }
  }
`;

export const GET_ACTIVITY_WORK_ORDERS_QUERY = gql`
  query GetActivityWorkOrders($id: ID!) {
    activity(id: $id) {
      id
      activity
      area {
        id
        name
      }
      machine {
        id
        name
      }
      workOrders {
        id
        workOrderId
        createdAt
        workOrder {
          id
          folio
          description
          status
          area {
            id
            name
          }
          createdAt
        }
      }
    }
  }
`;

export const GET_ACTIVITY_MATERIAL_REQUESTS_QUERY = gql`
  query GetActivityMaterialRequests($id: ID!) {
    activity(id: $id) {
      id
      activity
      area {
        id
        name
      }
      machine {
        id
        name
      }
      materialRequests {
        id
        materialRequestId
        createdAt
        materialRequest {
          id
          folio
          category
          importance
          priority
          createdAt
        }
      }
    }
  }
`;

// ======= MUTATIONS =======

export const CREATE_ACTIVITY_MUTATION = gql`
  ${ACTIVITY_ITEM_FRAGMENT}
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      ...ActivityItem
    }
  }
`;

export const UPDATE_ACTIVITY_MUTATION = gql`
  ${ACTIVITY_ITEM_FRAGMENT}
  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      ...ActivityItem
    }
  }
`;

export const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

export const UPDATE_ACTIVITY_PRIORITY_MUTATION = gql`
  mutation UpdateActivityPriority($id: ID!, $priority: Boolean!) {
    updateActivityPriority(id: $id, priority: $priority) {
      id
      priority
    }
  }
`;

export const ADD_ACTIVITY_WORK_ORDER_MUTATION = gql`
  mutation AddActivityWorkOrder($input: AddActivityWorkOrderByFolioInput!) {
    addActivityWorkOrder(input: $input) {
      id
      activityId
      workOrderId
      workOrder {
        id
        folio
        description
        status
        area {
          id
          name
        }
        createdAt
      }
      createdAt
    }
  }
`;

export const REMOVE_ACTIVITY_WORK_ORDER_MUTATION = gql`
  mutation RemoveActivityWorkOrder($activityId: ID!, $workOrderId: ID!) {
    removeActivityWorkOrder(activityId: $activityId, workOrderId: $workOrderId)
  }
`;

export const ADD_ACTIVITY_MATERIAL_REQUEST_MUTATION = gql`
  mutation AddActivityMaterialRequest($input: AddActivityMaterialRequestByFolioInput!) {
    addActivityMaterialRequest(input: $input) {
      id
      activityId
      materialRequestId
      materialRequest {
        id
        folio
        category
        importance
        priority
        createdAt
      }
      createdAt
    }
  }
`;

export const REMOVE_ACTIVITY_MATERIAL_REQUEST_MUTATION = gql`
  mutation RemoveActivityMaterialRequest($activityId: ID!, $materialRequestId: ID!) {
    removeActivityMaterialRequest(activityId: $activityId, materialRequestId: $materialRequestId)
  }
`;
