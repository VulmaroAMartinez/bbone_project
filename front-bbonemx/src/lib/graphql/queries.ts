/**
 * BB Maintenance - Queries y Mutations de GraphQL
 * Definiciones de operaciones para consumir el backend NestJS
 */

import { gql } from '@apollo/client';

// ============================================================================
// FRAGMENTS
// ============================================================================

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    employeeNumber
    name
    email
    role
    department
    avatar
    phone
    createdAt
  }
`;

export const AREA_FRAGMENT = gql`
  fragment AreaFragment on Area {
    id
    name
    code
    description
  }
`;

export const WORK_ORDER_FRAGMENT = gql`
  fragment WorkOrderFragment on WorkOrder {
    id
    folioNumber
    createdAt
    updatedAt
    areaId
    activityDescription
    photo
    requesterId
    priority
    maintenanceType
    status
    stoppageType
    assignedTechnicianId
    failureDescription
    cause
    actionSolution
    downtime
    startTime
    endTime
    notes
    machine
    toolsUsed
    partsMaterialsUsed
    adminSignature
    signedAt
    signedBy
  }
`;

export const WORK_ORDER_DETAIL_FRAGMENT = gql`
  fragment WorkOrderDetailFragment on WorkOrder {
    ...WorkOrderFragment
    area {
      ...AreaFragment
    }
    requester {
      ...UserFragment
    }
    assignedTechnician {
      ...UserFragment
    }
  }
  ${WORK_ORDER_FRAGMENT}
  ${AREA_FRAGMENT}
  ${USER_FRAGMENT}
`;

// ============================================================================
// AUTH QUERIES & MUTATIONS
// ============================================================================

export const LOGIN_MUTATION = gql`
  mutation Login($employeeNumber: String!, $password: String!) {
    login(employeeNumber: $employeeNumber, password: $password) {
      token
      user {
        ...UserFragment
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const ME_QUERY = gql`
  query Me {
    me {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

// ============================================================================
// USER QUERIES
// ============================================================================

export const GET_USERS = gql`
  query GetUsers($role: UserRole) {
    users(role: $role) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_TECHNICIANS = gql`
  query GetTechnicians {
    technicians {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

// ============================================================================
// AREA QUERIES
// ============================================================================

export const GET_AREAS = gql`
  query GetAreas {
    areas {
      ...AreaFragment
    }
  }
  ${AREA_FRAGMENT}
`;

export const GET_AREA = gql`
  query GetArea($id: ID!) {
    area(id: $id) {
      ...AreaFragment
    }
  }
  ${AREA_FRAGMENT}
`;

// ============================================================================
// WORK ORDER QUERIES & MUTATIONS
// ============================================================================

export const GET_WORK_ORDERS = gql`
  query GetWorkOrders(
    $status: OTStatus
    $priority: Priority
    $requesterId: ID
    $assignedTechnicianId: ID
    $startDate: String
    $endDate: String
  ) {
    workOrders(
      status: $status
      priority: $priority
      requesterId: $requesterId
      assignedTechnicianId: $assignedTechnicianId
      startDate: $startDate
      endDate: $endDate
    ) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const GET_WORK_ORDER = gql`
  query GetWorkOrder($id: ID!) {
    workOrder(id: $id) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const CREATE_WORK_ORDER = gql`
  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {
    createWorkOrder(input: $input) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const UPDATE_WORK_ORDER = gql`
  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {
    updateWorkOrder(id: $id, input: $input) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const UPDATE_WORK_ORDER_ADMIN = gql`
  mutation UpdateWorkOrderAdmin($id: ID!, $input: UpdateWorkOrderAdminInput!) {
    updateWorkOrderAdmin(id: $id, input: $input) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const UPDATE_WORK_ORDER_TECHNICIAN = gql`
  mutation UpdateWorkOrderTechnician($id: ID!, $input: UpdateWorkOrderTechnicianInput!) {
    updateWorkOrderTechnician(id: $id, input: $input) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const ASSIGN_WORK_ORDER = gql`
  mutation AssignWorkOrder($id: ID!, $technicianId: ID!) {
    assignWorkOrder(id: $id, technicianId: $technicianId) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const COMPLETE_WORK_ORDER = gql`
  mutation CompleteWorkOrder($id: ID!) {
    completeWorkOrder(id: $id) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

export const CANCEL_WORK_ORDER = gql`
  mutation CancelWorkOrder($id: ID!) {
    cancelWorkOrder(id: $id) {
      ...WorkOrderDetailFragment
    }
  }
  ${WORK_ORDER_DETAIL_FRAGMENT}
`;

// ============================================================================
// WORK SHIFT QUERIES & MUTATIONS
// ============================================================================

export const GET_WORK_SHIFTS = gql`
  query GetWorkShifts($technicianId: ID, $startDate: String, $endDate: String) {
    workShifts(technicianId: $technicianId, startDate: $startDate, endDate: $endDate) {
      id
      technicianId
      date
      startTime
      endTime
      notes
      createdAt
      technician {
        ...UserFragment
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const CREATE_WORK_SHIFT = gql`
  mutation CreateWorkShift($input: CreateWorkShiftInput!) {
    createWorkShift(input: $input) {
      id
      technicianId
      date
      startTime
      endTime
      notes
      createdAt
    }
  }
`;

export const DELETE_WORK_SHIFT = gql`
  mutation DeleteWorkShift($id: ID!) {
    deleteWorkShift(id: $id)
  }
`;

// ============================================================================
// NOTIFICATION QUERIES & MUTATIONS
// ============================================================================

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID!) {
    notifications(userId: $userId) {
      id
      userId
      type
      title
      message
      read
      workOrderId
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead($userId: ID!) {
    markAllNotificationsRead(userId: $userId)
  }
`;

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalOTs
      pendingOTs
      inProgressOTs
      completedOTs
      cancelledOTs
      avgResolutionTime
      otsByTechnician {
        technicianId
        name
        count
      }
      otsByPriority {
        priority
        count
      }
      otsByMaintenanceType {
        type
        count
      }
      weeklyTrend {
        date
        count
      }
    }
  }
`;
