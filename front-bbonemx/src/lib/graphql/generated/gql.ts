/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n": typeof types.GetAreasDocument,
    "\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n": typeof types.GetSubAreasByAreaDocument,
    "\n  \n  mutation Login($employeeNumber: String!, $password: String!) {\n    login(input: { employeeNumber: $employeeNumber, password: $password }) {\n      accessToken\n      user {\n        ...UserBasic\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  \n  query Me {\n    me {\n      ...UserBasic\n    }\n  }\n": typeof types.MeDocument,
    "\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n": typeof types.GetTechniciansDocument,
    "\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n": typeof types.GetShiftsDocument,
    "\n  \n  query GetMachines {\n    machinesActive {\n      ...MachineBasic\n      subAreaId\n    }\n  }\n": typeof types.GetMachinesDocument,
    "\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n": typeof types.GetDashboardDataDocument,
    "\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n": typeof types.RoleBasicFragmentDoc,
    "\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    role {\n      ...RoleBasic\n    }\n  }\n": typeof types.UserBasicFragmentDoc,
    "\n  fragment AreaBasic on Area {\n    id\n    name\n    type\n    description\n    isActive\n  }\n": typeof types.AreaBasicFragmentDoc,
    "\n  fragment SubAreaBasic on SubArea {\n    id\n    name\n    description\n    isActive\n    areaId\n  }\n": typeof types.SubAreaBasicFragmentDoc,
    "\n  fragment MachineBasic on Machine {\n    id\n    name\n    code\n    serialNumber\n    isActive\n  }\n": typeof types.MachineBasicFragmentDoc,
    "\n  fragment PositionBasic on Position {\n    id\n    name\n    description\n    isActive\n  }\n": typeof types.PositionBasicFragmentDoc,
    "\n  \n  \n  fragment TechnicianBasic on Technician {\n    id\n    isActive\n    user {\n      ...UserBasic\n    }\n    position {\n      ...PositionBasic\n    }\n  }\n": typeof types.TechnicianBasicFragmentDoc,
    "\n  fragment NotificationItem on Notification {\n    id\n    title\n    body\n    type\n    readAt\n    createdAt\n    data\n  }\n": typeof types.NotificationItemFragmentDoc,
    "\n  \n  query MyNotifications($limit: Int, $page: Int, $unreadOnly: Boolean) {\n    myNotifications(\n      pagination: { limit: $limit, page: $page }\n      filters: { unreadOnly: $unreadOnly }\n    ) {\n      data {\n        ...NotificationItem\n      }\n      unreadCount\n      total\n      totalPages\n    }\n  }\n": typeof types.MyNotificationsDocument,
    "\n  mutation MarkNotificationAsRead($id: ID!) {\n    markNotificationAsRead(id: $id) {\n      id\n      readAt\n    }\n  }\n": typeof types.MarkNotificationAsReadDocument,
    "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n": typeof types.MarkAllNotificationsAsReadDocument,
    "\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n": typeof types.WorkOrderItemFragmentDoc,
    "\n  \n  query MyRequestedWorkOrders {\n    myRequestedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": typeof types.MyRequestedWorkOrdersDocument,
    "\n  \n  query MyAssignedWorkOrders {\n    myAssignedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": typeof types.MyAssignedWorkOrdersDocument,
    "\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n": typeof types.GetWorkOrdersFilteredDocument,
    "\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n": typeof types.CreateWorkOrderDocument,
    "\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n    }\n  }\n": typeof types.AssignWorkOrderDocument,
    "\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n": typeof types.UploadWorkOrderPhotoDocument,
    "\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n    }\n  }\n": typeof types.GetWorkOrderByIdDocument,
    "\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n      }\n    }\n  }\n": typeof types.SignWorkOrderDocument,
    "\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n": typeof types.AssignTechnicianDocument,
    "\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n    }\n  }\n": typeof types.UpdateWorkOrderDocument,
    "\n  mutation ResumeWorkOrder($id: ID!) {\n    resumeWorkOrder(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.ResumeWorkOrderDocument,
    "\n  mutation StartWorkOrder($id: ID!, $input: StartWorkOrderInput!) {\n    startWorkOrder(id: $id, input: $input) {\n      id\n      breakdownDescription\n    }\n  }\n": typeof types.StartWorkOrderDocument,
    "\n  mutation PauseWorkOrder($id: ID!, $input: PauseWorkOrderInput!) {\n    pauseWorkOrder(id: $id, input: $input) {\n      id\n      pauseReason\n    }\n  }\n": typeof types.PauseWorkOrderDocument,
    "\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n    }\n  }\n": typeof types.CompleteWorkOrderDocument,
};
const documents: Documents = {
    "\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n": types.GetAreasDocument,
    "\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n": types.GetSubAreasByAreaDocument,
    "\n  \n  mutation Login($employeeNumber: String!, $password: String!) {\n    login(input: { employeeNumber: $employeeNumber, password: $password }) {\n      accessToken\n      user {\n        ...UserBasic\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  \n  query Me {\n    me {\n      ...UserBasic\n    }\n  }\n": types.MeDocument,
    "\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n": types.GetTechniciansDocument,
    "\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n": types.GetShiftsDocument,
    "\n  \n  query GetMachines {\n    machinesActive {\n      ...MachineBasic\n      subAreaId\n    }\n  }\n": types.GetMachinesDocument,
    "\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n": types.GetDashboardDataDocument,
    "\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n": types.RoleBasicFragmentDoc,
    "\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    role {\n      ...RoleBasic\n    }\n  }\n": types.UserBasicFragmentDoc,
    "\n  fragment AreaBasic on Area {\n    id\n    name\n    type\n    description\n    isActive\n  }\n": types.AreaBasicFragmentDoc,
    "\n  fragment SubAreaBasic on SubArea {\n    id\n    name\n    description\n    isActive\n    areaId\n  }\n": types.SubAreaBasicFragmentDoc,
    "\n  fragment MachineBasic on Machine {\n    id\n    name\n    code\n    serialNumber\n    isActive\n  }\n": types.MachineBasicFragmentDoc,
    "\n  fragment PositionBasic on Position {\n    id\n    name\n    description\n    isActive\n  }\n": types.PositionBasicFragmentDoc,
    "\n  \n  \n  fragment TechnicianBasic on Technician {\n    id\n    isActive\n    user {\n      ...UserBasic\n    }\n    position {\n      ...PositionBasic\n    }\n  }\n": types.TechnicianBasicFragmentDoc,
    "\n  fragment NotificationItem on Notification {\n    id\n    title\n    body\n    type\n    readAt\n    createdAt\n    data\n  }\n": types.NotificationItemFragmentDoc,
    "\n  \n  query MyNotifications($limit: Int, $page: Int, $unreadOnly: Boolean) {\n    myNotifications(\n      pagination: { limit: $limit, page: $page }\n      filters: { unreadOnly: $unreadOnly }\n    ) {\n      data {\n        ...NotificationItem\n      }\n      unreadCount\n      total\n      totalPages\n    }\n  }\n": types.MyNotificationsDocument,
    "\n  mutation MarkNotificationAsRead($id: ID!) {\n    markNotificationAsRead(id: $id) {\n      id\n      readAt\n    }\n  }\n": types.MarkNotificationAsReadDocument,
    "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n": types.MarkAllNotificationsAsReadDocument,
    "\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n": types.WorkOrderItemFragmentDoc,
    "\n  \n  query MyRequestedWorkOrders {\n    myRequestedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": types.MyRequestedWorkOrdersDocument,
    "\n  \n  query MyAssignedWorkOrders {\n    myAssignedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": types.MyAssignedWorkOrdersDocument,
    "\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n": types.GetWorkOrdersFilteredDocument,
    "\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n": types.CreateWorkOrderDocument,
    "\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n    }\n  }\n": types.AssignWorkOrderDocument,
    "\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n": types.UploadWorkOrderPhotoDocument,
    "\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n    }\n  }\n": types.GetWorkOrderByIdDocument,
    "\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n      }\n    }\n  }\n": types.SignWorkOrderDocument,
    "\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n": types.AssignTechnicianDocument,
    "\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n    }\n  }\n": types.UpdateWorkOrderDocument,
    "\n  mutation ResumeWorkOrder($id: ID!) {\n    resumeWorkOrder(id: $id) {\n      id\n      status\n    }\n  }\n": types.ResumeWorkOrderDocument,
    "\n  mutation StartWorkOrder($id: ID!, $input: StartWorkOrderInput!) {\n    startWorkOrder(id: $id, input: $input) {\n      id\n      breakdownDescription\n    }\n  }\n": types.StartWorkOrderDocument,
    "\n  mutation PauseWorkOrder($id: ID!, $input: PauseWorkOrderInput!) {\n    pauseWorkOrder(id: $id, input: $input) {\n      id\n      pauseReason\n    }\n  }\n": types.PauseWorkOrderDocument,
    "\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n    }\n  }\n": types.CompleteWorkOrderDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation Login($employeeNumber: String!, $password: String!) {\n    login(input: { employeeNumber: $employeeNumber, password: $password }) {\n      accessToken\n      user {\n        ...UserBasic\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  mutation Login($employeeNumber: String!, $password: String!) {\n    login(input: { employeeNumber: $employeeNumber, password: $password }) {\n      accessToken\n      user {\n        ...UserBasic\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query Me {\n    me {\n      ...UserBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query Me {\n    me {\n      ...UserBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n"): (typeof documents)["\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetMachines {\n    machinesActive {\n      ...MachineBasic\n      subAreaId\n    }\n  }\n"): (typeof documents)["\n  \n  query GetMachines {\n    machinesActive {\n      ...MachineBasic\n      subAreaId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n"): (typeof documents)["\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    role {\n      ...RoleBasic\n    }\n  }\n"): (typeof documents)["\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    role {\n      ...RoleBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment AreaBasic on Area {\n    id\n    name\n    type\n    description\n    isActive\n  }\n"): (typeof documents)["\n  fragment AreaBasic on Area {\n    id\n    name\n    type\n    description\n    isActive\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment SubAreaBasic on SubArea {\n    id\n    name\n    description\n    isActive\n    areaId\n  }\n"): (typeof documents)["\n  fragment SubAreaBasic on SubArea {\n    id\n    name\n    description\n    isActive\n    areaId\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment MachineBasic on Machine {\n    id\n    name\n    code\n    serialNumber\n    isActive\n  }\n"): (typeof documents)["\n  fragment MachineBasic on Machine {\n    id\n    name\n    code\n    serialNumber\n    isActive\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment PositionBasic on Position {\n    id\n    name\n    description\n    isActive\n  }\n"): (typeof documents)["\n  fragment PositionBasic on Position {\n    id\n    name\n    description\n    isActive\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  \n  fragment TechnicianBasic on Technician {\n    id\n    isActive\n    user {\n      ...UserBasic\n    }\n    position {\n      ...PositionBasic\n    }\n  }\n"): (typeof documents)["\n  \n  \n  fragment TechnicianBasic on Technician {\n    id\n    isActive\n    user {\n      ...UserBasic\n    }\n    position {\n      ...PositionBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment NotificationItem on Notification {\n    id\n    title\n    body\n    type\n    readAt\n    createdAt\n    data\n  }\n"): (typeof documents)["\n  fragment NotificationItem on Notification {\n    id\n    title\n    body\n    type\n    readAt\n    createdAt\n    data\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query MyNotifications($limit: Int, $page: Int, $unreadOnly: Boolean) {\n    myNotifications(\n      pagination: { limit: $limit, page: $page }\n      filters: { unreadOnly: $unreadOnly }\n    ) {\n      data {\n        ...NotificationItem\n      }\n      unreadCount\n      total\n      totalPages\n    }\n  }\n"): (typeof documents)["\n  \n  query MyNotifications($limit: Int, $page: Int, $unreadOnly: Boolean) {\n    myNotifications(\n      pagination: { limit: $limit, page: $page }\n      filters: { unreadOnly: $unreadOnly }\n    ) {\n      data {\n        ...NotificationItem\n      }\n      unreadCount\n      total\n      totalPages\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation MarkNotificationAsRead($id: ID!) {\n    markNotificationAsRead(id: $id) {\n      id\n      readAt\n    }\n  }\n"): (typeof documents)["\n  mutation MarkNotificationAsRead($id: ID!) {\n    markNotificationAsRead(id: $id) {\n      id\n      readAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n"): (typeof documents)["\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query MyRequestedWorkOrders {\n    myRequestedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n"): (typeof documents)["\n  \n  query MyRequestedWorkOrders {\n    myRequestedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query MyAssignedWorkOrders {\n    myAssignedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n"): (typeof documents)["\n  \n  query MyAssignedWorkOrders {\n    myAssignedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n"): (typeof documents)["\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n    }\n  }\n"): (typeof documents)["\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n"): (typeof documents)["\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResumeWorkOrder($id: ID!) {\n    resumeWorkOrder(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation ResumeWorkOrder($id: ID!) {\n    resumeWorkOrder(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation StartWorkOrder($id: ID!, $input: StartWorkOrderInput!) {\n    startWorkOrder(id: $id, input: $input) {\n      id\n      breakdownDescription\n    }\n  }\n"): (typeof documents)["\n  mutation StartWorkOrder($id: ID!, $input: StartWorkOrderInput!) {\n    startWorkOrder(id: $id, input: $input) {\n      id\n      breakdownDescription\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation PauseWorkOrder($id: ID!, $input: PauseWorkOrderInput!) {\n    pauseWorkOrder(id: $id, input: $input) {\n      id\n      pauseReason\n    }\n  }\n"): (typeof documents)["\n  mutation PauseWorkOrder($id: ID!, $input: PauseWorkOrderInput!) {\n    pauseWorkOrder(id: $id, input: $input) {\n      id\n      pauseReason\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;