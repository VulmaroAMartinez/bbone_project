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
    scheduledDate
    workType
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
  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority, $assignedShiftId: ID) {
    workOrdersFiltered(
      filters: { status: $status, priority: $priority, assignedShiftId: $assignedShiftId }
      pagination: { limit: 100, page: 1 }
    ) {
      data {
        ...WorkOrderItem
      }
      total
    }
  }
`;


export const GET_SCHEDULED_WORK_ORDERS_QUERY = gql`
  ${WORK_ORDER_ITEM_FRAGMENT}
  query GetScheduledWorkOrders($scheduledFrom: String, $scheduledTo: String, $assignedShiftId: ID) {
    workOrdersFiltered(
      filters: {
        maintenanceType: CORRECTIVE_SCHEDULED
        scheduledFrom: $scheduledFrom
        scheduledTo: $scheduledTo
        assignedShiftId: $assignedShiftId
      }
      pagination: { limit: 100, page: 1 }
      sort: { field: SCHEDULED_DATE, order: ASC }
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
      scheduledDate
      workType
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
          roles {
            name
          }
        }
      }
      photos {
        id
        photoType
        filePath
      }
      customSparePart
      customMaterial
      spareParts {
        id
        quantity
        sparePart {
          id
          partNumber
          brand
          model
        }
      }
      materials {
        id
        quantity
        material {
          id
          description
          brand
        }
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
        roles {
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
      scheduledDate
      workType
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
      breakdownDescription
      cause
      actionTaken
      toolsUsed
      observations
      status
      customSparePart
      customMaterial
    }
  }
`;

export const ADD_WORK_ORDER_SPARE_PART_MUTATION = gql`
  mutation AddWorkOrderSparePart($input: AddWorkOrderSparePartInput!) {
    addWorkOrderSparePart(input: $input) {
      id
      quantity
      sparePart {
        id
        partNumber
        brand
        model
      }
    }
  }
`;

export const ADD_WORK_ORDER_MATERIAL_MUTATION = gql`
  mutation AddWorkOrderMaterial($input: AddWorkOrderMaterialInput!) {
    addWorkOrderMaterial(input: $input) {
      id
      quantity
      material {
        id
        description
        brand
      }
    }
  }
`;

export const GET_ACTIVE_MATERIALS_QUERY = gql`
  query GetActiveMaterials {
    materialsActive {
      id
      description
      brand
      model
      partNumber
      unitOfMeasure
    }
  }
`;

export const GET_MACHINE_SPARE_PARTS_FOR_WO = gql`
  query GetMachineSparePartsForWO($machineId: ID!) {
    sparePartsByMachine(machineId: $machineId) {
      id
      partNumber
      brand
      model
      unitOfMeasure
      isActive
    }
  }
`;