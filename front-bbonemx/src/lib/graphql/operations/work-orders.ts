import { gql } from '@apollo/client';
import {
  AREA_BASIC_FRAGMENT,
  SUB_AREA_BASIC_FRAGMENT,
  USER_BASIC_FRAGMENT,
  MACHINE_BASIC_FRAGMENT
} from './fragments';

export const WORK_ORDER_ITEM_FRAGMENT = gql`
  ${AREA_BASIC_FRAGMENT}
  ${SUB_AREA_BASIC_FRAGMENT}
  ${USER_BASIC_FRAGMENT}
  ${MACHINE_BASIC_FRAGMENT}
  fragment WorkOrderItem on WorkOrder {
    id
    folio
    description
    status
    priority
    maintenanceType
    stopType
    assignedShiftId
    machineId
    createdAt
    isFullySigned
    area {
      ...AreaBasic
    }
    subArea {
      ...SubAreaBasic
    }
    machine {
      ...MachineBasic
    }
    requester {
      ...UserBasic
    }
    technicians {
      isLead
      technician {
        ...UserBasic
      }
    }
  }
`;

// Query para el Solicitante (Solo ve las suyas)
export const MY_REQUESTED_WORK_ORDERS_QUERY = gql`
  ${WORK_ORDER_ITEM_FRAGMENT}
  query MyRequestedWorkOrders {
    myRequestedWorkOrders {
      ...WorkOrderItem
    }
  }
`;

// Query General (Para el Administrador - Listado global)
export const MY_ASSIGNED_WORK_ORDERS_QUERY = gql`
  ${WORK_ORDER_ITEM_FRAGMENT}
  query MyAssignedWorkOrders {
    myAssignedWorkOrders {
      ...WorkOrderItem
    }
  }
`;

export const GET_WORK_ORDERS_FILTERED_QUERY = gql`
  ${WORK_ORDER_ITEM_FRAGMENT}
  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority) {
    workOrdersFiltered(
      filters: { status: $status, priority: $priority }
      pagination: { limit: 100, page: 1 }
    ) {
      data {
        ...WorkOrderItem
      }
      total
    }
  }
`;

export const CREATE_WORK_ORDER_MUTATION = gql`
  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {
    createWorkOrder(input: $input) {
      id
      folio
      status
    }
  }
`;

export const ASSIGN_WORK_ORDER_MUTATION = gql`
  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {
    assignWorkOrder(id: $id, input: $input) {
      id
      status
      priority
      maintenanceType
      stopType
    }
  }
`;

export const UPLOAD_WORK_ORDER_PHOTO_MUTATION = gql`
  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {
    uploadWorkOrderPhoto(input: $input) {
      id
      filePath
    }
  }
`;

export const GET_WORK_ORDER_BY_ID_QUERY = gql`
  ${WORK_ORDER_ITEM_FRAGMENT}
  query GetWorkOrderById($id: ID!) {
    workOrder(id: $id) {
      ...WorkOrderItem
      cause
      actionTaken
      toolsUsed
      observations
      functionalTimeMinutes
      downtimeMinutes
      breakdownDescription
      startDate
      endDate
      pauseReason
      signatures {
        id
        signatureImagePath
        signedAt
        signer {
          id
          firstName
          lastName
          role {
            name
          }
        }
      }
      photos {
        id
        photoType
        filePath
      }
    }
  }
`;

export const SIGN_WORK_ORDER_MUTATION = gql`
  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {
    signWorkOrder(input: $input) {
      id
      signatureImagePath
      signedAt
      workOrderId
      signer {
        id
        firstName
        lastName
        role {
          name
        }
      }
    }
  }
`;

export const ASSIGN_TECHNICIAN_MUTATION = gql`
  mutation AssignTechnician($input: AssignTechnicianInput!) {
    assignTechnician(input: $input) {
      id
      isLead
      technician {
        id
        firstName
        lastName
      }
    }
  }
`;

export const UPDATE_WORK_ORDER_MUTATION = gql`
  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {
    updateWorkOrder(id: $id, input: $input) {
      id
      status
      priority
      maintenanceType
      stopType
      assignedShiftId
      machineId
    }
  }
`;

export const RESUME_WORK_ORDER_MUTATION = gql`
  mutation ResumeWorkOrder($id: ID!) {
    resumeWorkOrder(id: $id) {
      id
      status
    }
  }
`;

export const START_WORK_ORDER_MUTATION = gql`
  mutation StartWorkOrder($id: ID!, $input: StartWorkOrderInput!) {
    startWorkOrder(id: $id, input: $input) {
      id
      breakdownDescription
    }
  }
`;

export const PAUSE_WORK_ORDER_MUTATION = gql`
  mutation PauseWorkOrder($id: ID!, $input: PauseWorkOrderInput!) {
    pauseWorkOrder(id: $id, input: $input) {
      id
      pauseReason
    }
  }
`;

export const COMPLETE_WORK_ORDER_MUTATION = gql`
  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {
    completeWorkOrder(id: $id, input: $input) {
      id
      downtimeMinutes
      cause
      actionTaken
      toolsUsed
      observations
      status
    }
  }
`;