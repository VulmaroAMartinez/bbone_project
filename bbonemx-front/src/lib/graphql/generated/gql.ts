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
    "\n  \n  \n  fragment ActivityItem on Activity {\n    id\n    activity\n    startDate\n    endDate\n    progress\n    status\n    comments\n    priority\n    isActive\n    createdAt\n    updatedAt\n    areaId\n    area {\n      ...AreaBasic\n    }\n    machineId\n    machine {\n      id\n      name\n      code\n    }\n    technicians {\n      id\n      technicianId\n      assignedAt\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n": typeof types.ActivityItemFragmentDoc,
    "\n  \n  query GetActivitiesFiltered(\n    $filters: ActivityFiltersInput\n    $pagination: ActivityPaginationInput\n    $sort: ActivitySortInput\n  ) {\n    activitiesFiltered(filters: $filters, pagination: $pagination, sort: $sort) {\n      data {\n        ...ActivityItem\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.GetActivitiesFilteredDocument,
    "\n  \n  query GetActivityById($id: ID!) {\n    activity(id: $id) {\n      ...ActivityItem\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n": typeof types.GetActivityByIdDocument,
    "\n  query GetActivityWorkOrders($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n    }\n  }\n": typeof types.GetActivityWorkOrdersDocument,
    "\n  query GetActivityMaterialRequests($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n": typeof types.GetActivityMaterialRequestsDocument,
    "\n  query ExportActivitiesExcel(\n    $filters: ActivityFiltersInput\n    $sort: ActivitySortInput\n  ) {\n    exportActivitiesExcel(filters: $filters, sort: $sort)\n  }\n": typeof types.ExportActivitiesExcelDocument,
    "\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityItem\n    }\n  }\n": typeof types.CreateActivityDocument,
    "\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityItem\n    }\n  }\n": typeof types.UpdateActivityDocument,
    "\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n": typeof types.DeleteActivityDocument,
    "\n  mutation UpdateActivityPriority($id: ID!, $priority: Boolean!) {\n    updateActivityPriority(id: $id, priority: $priority) {\n      id\n      priority\n    }\n  }\n": typeof types.UpdateActivityPriorityDocument,
    "\n  mutation AddActivityWorkOrder($input: AddActivityWorkOrderByFolioInput!) {\n    addActivityWorkOrder(input: $input) {\n      id\n      activityId\n      workOrderId\n      workOrder {\n        id\n        folio\n        description\n        status\n        area {\n          id\n          name\n        }\n        createdAt\n      }\n      createdAt\n    }\n  }\n": typeof types.AddActivityWorkOrderDocument,
    "\n  mutation RemoveActivityWorkOrder($activityId: ID!, $workOrderId: ID!) {\n    removeActivityWorkOrder(activityId: $activityId, workOrderId: $workOrderId)\n  }\n": typeof types.RemoveActivityWorkOrderDocument,
    "\n  mutation AddActivityMaterialRequest($input: AddActivityMaterialRequestByFolioInput!) {\n    addActivityMaterialRequest(input: $input) {\n      id\n      activityId\n      materialRequestId\n      materialRequest {\n        id\n        folio\n        category\n        importance\n        priority\n        createdAt\n      }\n      createdAt\n    }\n  }\n": typeof types.AddActivityMaterialRequestDocument,
    "\n  mutation RemoveActivityMaterialRequest($activityId: ID!, $materialRequestId: ID!) {\n    removeActivityMaterialRequest(activityId: $activityId, materialRequestId: $materialRequestId)\n  }\n": typeof types.RemoveActivityMaterialRequestDocument,
    "\n  fragment AreaDetail on Area {\n    id\n    name\n    type\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n": typeof types.AreaDetailFragmentDoc,
    "\n  fragment SubAreaDetail on SubArea {\n    id\n    name\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n": typeof types.SubAreaDetailFragmentDoc,
    "\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n": typeof types.GetAreasDocument,
    "\n  \n  query GetAreasWithDeleted {\n    areasWithDeleted {\n      ...AreaDetail\n    }\n  }\n": typeof types.GetAreasWithDeletedDocument,
    "\n  \n  query GetArea($id: ID!) {\n    area(id: $id) {\n      ...AreaDetail\n    }\n  }\n": typeof types.GetAreaDocument,
    "\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n": typeof types.GetSubAreasByAreaDocument,
    "\n  query GetWorkOrdersByArea($areaId: ID!, $page: Int, $limit: Int) {\n    workOrdersFiltered(\n      filters: { areaId: $areaId }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: CREATED_AT, order: DESC }\n    ) {\n      data {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        createdAt\n        subArea { id  name }\n        machine { id  name  code }\n        requester { id  fullName }\n        technicians { isLead  technician { id  fullName } }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.GetWorkOrdersByAreaDocument,
    "\n  query GetFindingsByArea(\n    $areaId: ID!\n    $page: Int\n    $limit: Int\n    $status: FindingStatus\n    $createdFrom: String\n    $createdTo: String\n    $search: String\n  ) {\n    findingsFiltered(\n      filters: {\n        areaId: $areaId\n        status: $status\n        createdFrom: $createdFrom\n        createdTo: $createdTo\n        search: $search\n      }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: \"createdAt\", order: \"DESC\" }\n    ) {\n      data {\n        id\n        folio\n        description\n        photoPath\n        status\n        createdAt\n        machine { id  name  code }\n        shift { id  name }\n        convertedToWo { id  folio }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.GetFindingsByAreaDocument,
    "\n  \n  mutation CreateArea($input: CreateAreaInput!) {\n    createArea(input: $input) {\n      ...AreaDetail\n    }\n  }\n": typeof types.CreateAreaDocument,
    "\n  \n  mutation UpdateArea($id: ID!, $input: UpdateAreaInput!) {\n    updateArea(id: $id, input: $input) {\n      ...AreaDetail\n    }\n  }\n": typeof types.UpdateAreaDocument,
    "\n  mutation DeactivateArea($id: ID!) {\n    deactivateArea(id: $id)\n  }\n": typeof types.DeactivateAreaDocument,
    "\n  \n  mutation ActivateArea($id: ID!) {\n    activateArea(id: $id) {\n      ...AreaDetail\n    }\n  }\n": typeof types.ActivateAreaDocument,
    "\n  \n  mutation CreateSubArea($input: CreateSubAreaInput!) {\n    createSubArea(input: $input) {\n      ...SubAreaDetail\n    }\n  }\n": typeof types.CreateSubAreaDocument,
    "\n  \n  mutation UpdateSubArea($id: ID!, $input: UpdateSubAreaInput!) {\n    updateSubArea(id: $id, input: $input) {\n      ...SubAreaDetail\n    }\n  }\n": typeof types.UpdateSubAreaDocument,
    "\n  mutation DeactivateSubArea($id: ID!) {\n    deactivateSubArea(id: $id)\n  }\n": typeof types.DeactivateSubAreaDocument,
    "\n  \n  mutation Login($employeeNumber: String!, $password: String!) {\n    login(input: { employeeNumber: $employeeNumber, password: $password }) {\n      accessToken\n      user {\n        ...UserBasic\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  \n  query Me {\n    me {\n      ...UserBasic\n    }\n  }\n": typeof types.MeDocument,
    "\n  mutation RefreshAuth {\n    refreshAuth\n  }\n": typeof types.RefreshAuthDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n": typeof types.GetShiftsDocument,
    "\n  query GetMaterials {\n    materialsWithDeleted {\n      id\n      description\n      brand\n      manufacturer\n      model\n      partNumber\n      sku\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n": typeof types.GetMaterialsDocument,
    "\n  mutation CreateMaterial($input: CreateMaterialInput!) {\n    createMaterial(input: $input) {\n      id\n      description\n      isActive\n    }\n  }\n": typeof types.CreateMaterialDocument,
    "\n  mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {\n    updateMaterial(id: $id, input: $input) {\n      id\n      description\n    }\n  }\n": typeof types.UpdateMaterialDocument,
    "\n  mutation ActivateMaterial($id: ID!) {\n    activateMaterial(id: $id) {\n      id\n      isActive\n    }\n  }\n": typeof types.ActivateMaterialDocument,
    "\n  mutation DeactivateMaterial($id: ID!) {\n    deactivateMaterial(id: $id)\n  }\n": typeof types.DeactivateMaterialDocument,
    "\n  \n  query GetSpareParts {\n    sparePartsWithDeleted {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n      machine {\n        ...MachineBasic\n      }\n    }\n  }\n": typeof types.GetSparePartsDocument,
    "\n  mutation CreateSparePart($input: CreateSparePartInput!) {\n    createSparePart(input: $input) {\n      id\n      partNumber\n      isActive\n    }\n  }\n": typeof types.CreateSparePartDocument,
    "\n  mutation UpdateSparePart($id: ID!, $input: UpdateSparePartInput!) {\n    updateSparePart(id: $id, input: $input) {\n      id\n      partNumber\n    }\n  }\n": typeof types.UpdateSparePartDocument,
    "\n  mutation ActivateSparePart($id: ID!) {\n    activateSparePart(id: $id) {\n      id\n      isActive\n    }\n  }\n": typeof types.ActivateSparePartDocument,
    "\n  mutation DeactivateSparePart($id: ID!) {\n    deactivateSparePart(id: $id)\n  }\n": typeof types.DeactivateSparePartDocument,
    "\n  query GetPositions {\n    positionsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n": typeof types.GetPositionsDocument,
    "\n  mutation CreatePosition($input: CreatePositionInput!) {\n    createPosition(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n": typeof types.CreatePositionDocument,
    "\n  mutation UpdatePosition($id: ID!, $input: UpdatePositionInput!) {\n    updatePosition(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n": typeof types.UpdatePositionDocument,
    "\n  mutation ActivatePosition($id: ID!) {\n    activatePosition(id: $id) {\n      id\n      isActive\n    }\n  }\n": typeof types.ActivatePositionDocument,
    "\n  mutation DeactivatePosition($id: ID!) {\n    deactivatePosition(id: $id)\n  }\n": typeof types.DeactivatePositionDocument,
    "\n  query GetShiftsAll {\n    shiftsWithDeleted {\n      id\n      name\n      startTime\n      endTime\n      isActive\n      createdAt\n    }\n  }\n": typeof types.GetShiftsAllDocument,
    "\n  mutation CreateShift($input: CreateShiftInput!) {\n    createShift(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n": typeof types.CreateShiftDocument,
    "\n  mutation UpdateShift($id: ID!, $input: UpdateShiftInput!) {\n    updateShift(id: $id, input: $input) {\n      id\n      name\n      startTime\n      endTime\n    }\n  }\n": typeof types.UpdateShiftDocument,
    "\n  mutation ActivateShift($id: ID!) {\n    activateShift(id: $id) {\n      id\n      isActive\n    }\n  }\n": typeof types.ActivateShiftDocument,
    "\n  mutation DeactivateShift($id: ID!) {\n    deactivateShift(id: $id)\n  }\n": typeof types.DeactivateShiftDocument,
    "\n  query GetDepartments {\n    departmentsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n": typeof types.GetDepartmentsDocument,
    "\n  mutation CreateDepartment($input: CreateDepartmentInput!) {\n    createDepartment(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n": typeof types.CreateDepartmentDocument,
    "\n  mutation UpdateDepartment($id: ID!, $input: UpdateDepartmentInput!) {\n    updateDepartment(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n": typeof types.UpdateDepartmentDocument,
    "\n  mutation ActivateDepartment($id: ID!) {\n    activateDepartment(id: $id) {\n      id\n      isActive\n    }\n  }\n": typeof types.ActivateDepartmentDocument,
    "\n  mutation DeactivateDepartment($id: ID!) {\n    deactivateDepartment(id: $id)\n  }\n": typeof types.DeactivateDepartmentDocument,
    "\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        findingsByArea {\n          areaId\n          areaName\n          value\n        }\n        workOrdersByArea {\n          areaId\n          areaName\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n": typeof types.GetDashboardDataDocument,
    "\n  \n  \n  fragment FindingBasic on Finding {\n    id\n    folio\n    description\n    photoPath\n    status\n    createdAt\n    area {\n      ...AreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    shift {\n      id\n      name\n    }\n    convertedToWo {\n      id\n      folio\n    }\n  }\n": typeof types.FindingBasicFragmentDoc,
    "\n  \n  query GetFindingsFiltered($filters: FindingFiltersInput, $pagination: FindingPaginationInput) {\n    findingsFiltered(filters: $filters, pagination: $pagination) {\n      data {\n        ...FindingBasic\n      }\n      total\n    }\n  }\n": typeof types.GetFindingsFilteredDocument,
    "\n  mutation CreateFinding($input: CreateFindingInput!) {\n    createFinding(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n": typeof types.CreateFindingDocument,
    "\n  \n  query GetFindingById($id: ID!) {\n    finding(id: $id) {\n      ...FindingBasic\n      machineId\n    }\n  }\n": typeof types.GetFindingByIdDocument,
    "\n  \n  mutation UpdateFinding($id: ID!, $input: UpdateFindingInput!) {\n    updateFinding(id: $id, input: $input) {\n      ...FindingBasic\n    }\n  }\n": typeof types.UpdateFindingDocument,
    "\n  mutation ConvertToWorkOrder($id: ID!) {\n    convertToWorkOrder(id: $id) {\n      id\n      status\n      convertedToWo {\n        id\n        folio\n      }\n    }\n  }\n": typeof types.ConvertToWorkOrderDocument,
    "\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n": typeof types.RoleBasicFragmentDoc,
    "\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    roleIds\n    role {\n      ...RoleBasic\n    }\n    roles {\n      ...RoleBasic\n    }\n  }\n": typeof types.UserBasicFragmentDoc,
    "\n  fragment AreaBasic on Area {\n    id\n    name\n    type\n    description\n    isActive\n  }\n": typeof types.AreaBasicFragmentDoc,
    "\n  fragment SubAreaBasic on SubArea {\n    id\n    name\n    description\n    isActive\n    areaId\n  }\n": typeof types.SubAreaBasicFragmentDoc,
    "\n  fragment MachineBasic on Machine {\n    id\n    code\n    name\n    description\n    brand\n    model\n    serialNumber\n    installationDate\n    machinePhotoUrl\n    operationalManualUrl\n    isActive\n    subAreaId\n    areaId\n    subArea {\n      id\n      name\n      area {\n        id\n        name\n        type\n      }\n    }\n    area {\n      id\n      name\n      type\n    }\n    createdAt\n    updatedAt\n  }\n": typeof types.MachineBasicFragmentDoc,
    "\n  fragment PositionBasic on Position {\n    id\n    name\n    description\n    isActive\n  }\n": typeof types.PositionBasicFragmentDoc,
    "\n  \n  \n  fragment TechnicianBasic on Technician {\n    id\n    isActive\n    user {\n      ...UserBasic\n    }\n    position {\n      ...PositionBasic\n    }\n  }\n": typeof types.TechnicianBasicFragmentDoc,
    "\n  \n  query GetMachinesPageData {\n    machinesWithDeleted {\n      ...MachineBasic\n    }\n    areasActive {\n      id\n      name\n      type\n    }\n    subAreasActive {\n      id\n      name\n    }\n  }\n": typeof types.GetMachinesPageDataDocument,
    "\n  \n  query GetMachine($id: ID!) {\n    machine(id: $id) {\n      ...MachineBasic\n    }\n  }\n": typeof types.GetMachineDocument,
    "\n  query GetMachineSpareParts($id: ID!) {\n    sparePartsByMachine(machineId: $id) {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n": typeof types.GetMachineSparePartsDocument,
    "\n  query GetMachineWorkOrders($id: ID!) {\n    machine(id: $id) {\n      id\n      workOrders {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        startDate\n        endDate\n        createdAt\n        area {\n          name\n        }\n        requester {\n          fullName\n        }\n      }\n    }\n  }\n": typeof types.GetMachineWorkOrdersDocument,
    "\n  query GetMachineMaterialRequests($id: ID!) {\n    machine(id: $id) {\n      id\n      code\n      name\n      materialRequests {\n        id\n        folio\n        category\n        priority\n        importance\n        boss\n        suggestedSupplier\n        comments\n        justification\n        isActive\n        createdAt\n        items {\n          id\n          requestedQuantity\n          unitOfMeasure\n          description\n          brand\n          partNumber\n          material {\n            description\n            partNumber\n            brand\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetMachineMaterialRequestsDocument,
    "\n  \n  mutation CreateMachine($input: CreateMachineInput!) {\n    createMachine(input: $input) {\n      ...MachineBasic\n    }\n  }\n": typeof types.CreateMachineDocument,
    "\n  \n  mutation UpdateMachine($id: ID!, $input: UpdateMachineInput!) {\n    updateMachine(id: $id, input: $input) {\n      ...MachineBasic\n    }\n  }\n": typeof types.UpdateMachineDocument,
    "\n  mutation DeactivateMachine($id: ID!) {\n    deactivateMachine(id: $id)\n  }\n": typeof types.DeactivateMachineDocument,
    "\n  \n  mutation ActivateMachine($id: ID!) {\n    activateMachine(id: $id) {\n      ...MachineBasic\n    }\n  }\n": typeof types.ActivateMachineDocument,
    "\n  \n  query GetMachinesByArea($areaId: ID, $subAreaId: ID) {\n    machinesByArea(areaId: $areaId, subAreaId: $subAreaId) {\n      ...MachineBasic\n    }\n  }\n": typeof types.GetMachinesByAreaDocument,
    "\n  query GetMaterialRequestFormData {\n    techniciansActive {\n      id\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        id\n        name\n      }\n    }\n    usersWithDeleted {\n      id\n      fullName\n      employeeNumber\n      isActive\n      roles {\n        id\n        name\n      }\n    }\n    machinesActive {\n      id\n      name\n      brand\n      model\n      manufacturer\n      areaId\n      area {\n        id\n        name\n      }\n      subAreaId\n      subArea {\n        id\n        name\n        area {\n          id\n          name\n        }\n      }\n    }\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      sku\n      unitOfMeasure\n    }\n    sparePartsActive {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      machineId\n    }\n  }\n": typeof types.GetMaterialRequestFormDataDocument,
    "\n  query GetMaterialRequests {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      suggestedSupplier\n      isActive\n      emailSentAt\n      createdAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        partNumber\n        isGenericAllowed\n      }\n    }\n  }\n": typeof types.GetMaterialRequestsDocument,
    "\n  query GetMaterialRequest($id: ID!) {\n    materialRequest(id: $id) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      customMachineBrand\n      customMachineModel\n      customMachineManufacturer\n      suggestedSupplier\n      justification\n      comments\n      isActive\n      emailSentAt\n      createdAt\n      updatedAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        model\n        partNumber\n        sku\n        proposedMaxStock\n        proposedMinStock\n        materialId\n        isGenericAllowed\n        sparePartId\n        material {\n          id\n          description\n          partNumber\n          brand\n          sku\n          unitOfMeasure\n        }\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n          unitOfMeasure\n        }\n      }\n    }\n  }\n": typeof types.GetMaterialRequestDocument,
    "\n  mutation CreateMaterialRequest($input: CreateMaterialRequestInput!) {\n    createMaterialRequest(input: $input) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n        }\n      }\n      items {\n        id\n      }\n    }\n  }\n": typeof types.CreateMaterialRequestDocument,
    "\n  mutation AddMaterialToRequest(\n    $materialRequestId: ID!\n    $input: CreateMaterialRequestItemInput!\n  ) {\n    addMaterialToRequest(\n      materialRequestId: $materialRequestId\n      input: $input\n    ) {\n      id\n      requestedQuantity\n      unitOfMeasure\n      description\n      customName\n      brand\n      model\n      partNumber\n      sku\n      proposedMaxStock\n      proposedMinStock\n      materialId\n      sparePartId\n    }\n  }\n": typeof types.AddMaterialToRequestDocument,
    "\n  mutation UpdateMaterialRequest($id: ID!, $input: UpdateMaterialRequestInput!) {\n    updateMaterialRequest(id: $id, input: $input) {\n      id\n      folio\n    }\n  }\n": typeof types.UpdateMaterialRequestDocument,
    "\n  mutation RemoveMaterialFromRequest($materialRequestMaterialId: ID!) {\n    removeMaterialFromRequest(materialRequestMaterialId: $materialRequestMaterialId)\n  }\n": typeof types.RemoveMaterialFromRequestDocument,
    "\n  mutation DeactivateMaterialRequest($id: ID!) {\n    deactivateMaterialRequest(id: $id)\n  }\n": typeof types.DeactivateMaterialRequestDocument,
    "\n  mutation SendMaterialRequestEmail($input: SendMaterialRequestEmailInput!) {\n    sendMaterialRequestEmail(input: $input)\n  }\n": typeof types.SendMaterialRequestEmailDocument,
    "\n  query GetMaterialRequestHistories {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      justification\n      description\n      emailSentAt\n      isActive\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        sku\n        description\n        customName\n        requestedQuantity\n        unitOfMeasure\n        isGenericAllowed\n      }\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n": typeof types.GetMaterialRequestHistoriesDocument,
    "\n  mutation UpdateMaterialRequestHistory($input: UpdateMaterialRequestHistoryInput!) {\n    updateMaterialRequestHistory(input: $input) {\n      id\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n": typeof types.UpdateMaterialRequestHistoryDocument,
    "\n  fragment NotificationItem on Notification {\n    id\n    title\n    body\n    type\n    readAt\n    createdAt\n    data\n  }\n": typeof types.NotificationItemFragmentDoc,
    "\n  \n  query MyNotifications($limit: Int, $page: Int, $unreadOnly: Boolean) {\n    myNotifications(\n      pagination: { limit: $limit, page: $page }\n      filters: { unreadOnly: $unreadOnly }\n    ) {\n      data {\n        ...NotificationItem\n      }\n      unreadCount\n      total\n      totalPages\n    }\n  }\n": typeof types.MyNotificationsDocument,
    "\n  mutation MarkNotificationAsRead($id: ID!) {\n    markNotificationAsRead(id: $id) {\n      id\n      readAt\n    }\n  }\n": typeof types.MarkNotificationAsReadDocument,
    "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n": typeof types.MarkAllNotificationsAsReadDocument,
    "\n  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n    registerDeviceToken(input: $input) {\n      id\n      fcmToken\n      platform\n      deviceName\n    }\n  }\n": typeof types.RegisterDeviceTokenDocument,
    "\n  mutation UnregisterDeviceToken($input: UnregisterDeviceTokenInput!) {\n    unregisterDeviceToken(input: $input)\n  }\n": typeof types.UnregisterDeviceTokenDocument,
    "\n  query MyNotificationPreferences {\n    myNotificationPreferences {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n": typeof types.MyNotificationPreferencesDocument,
    "\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n": typeof types.UpdateNotificationPreferenceDocument,
    "\n  query GetOvertimeRecords(\n    $startDate: String\n    $endDate: String\n    $positionId: ID\n    $reasonForPayment: ReasonForPayment\n  ) {\n    overtimeRecords(\n      startDate: $startDate\n      endDate: $endDate\n      positionId: $positionId\n      reasonForPayment: $reasonForPayment\n    ) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n": typeof types.GetOvertimeRecordsDocument,
    "\n  query GetMyOvertimeRecords {\n    myOvertimeRecords {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n": typeof types.GetMyOvertimeRecordsDocument,
    "\n  query GetOvertimeRecord($id: ID!) {\n    overtimeRecord(id: $id) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n": typeof types.GetOvertimeRecordDocument,
    "\n  mutation CreateOvertime($input: CreateOvertimeInput!) {\n    createOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n": typeof types.CreateOvertimeDocument,
    "\n  mutation UpdateOvertime($input: UpdateOvertimeInput!) {\n    updateOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n": typeof types.UpdateOvertimeDocument,
    "\n  mutation DeleteOvertime($id: ID!) {\n    deleteOvertime(id: $id)\n  }\n": typeof types.DeleteOvertimeDocument,
    "\n  query GetActiveTechniciansForOvertime {\n    techniciansActive {\n      id\n      user {\n        id\n        employeeNumber\n        firstName\n        lastName\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n": typeof types.GetActiveTechniciansForOvertimeDocument,
    "\n  query GetOvertimePositions {\n    positions {\n      id\n      name\n      isActive\n    }\n  }\n": typeof types.GetOvertimePositionsDocument,
    "\n  fragment ScheduleItem on TechnicianSchedule {\n    id\n    technicianId\n    shiftId\n    absenceReasonId\n    scheduleDate\n    weekNumber\n    year\n    notes\n    isActive\n    shift {\n      id\n      name\n      startTime\n      endTime\n    }\n    absenceReason {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n    technician {\n      id\n      fullName\n    }\n  }\n": typeof types.ScheduleItemFragmentDoc,
    "\n  \n  query GetWeekSchedule($weekNumber: Int!, $year: Int!) {\n    weekSchedule(weekNumber: $weekNumber, year: $year) {\n      weekNumber\n      year\n      totalAssignments\n      totalAbsences\n      totalWorkDays\n      schedules {\n        ...ScheduleItem\n      }\n    }\n  }\n": typeof types.GetWeekScheduleDocument,
    "\n  query GetScheduleTechnicians {\n    techniciansWithDeleted {\n      id\n      isActive\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        name\n      }\n    }\n  }\n": typeof types.GetScheduleTechniciansDocument,
    "\n  query GetAbsenceReasonsActive {\n    absenceReasonsActive {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n  }\n": typeof types.GetAbsenceReasonsActiveDocument,
    "\n  \n  mutation AssignWeekSchedule($input: AssignWeekScheduleInput!) {\n    assignWeekSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n": typeof types.AssignWeekScheduleDocument,
    "\n  \n  mutation CreateTechnicianSchedule($input: CreateScheduleInput!) {\n    createTechnicianSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n": typeof types.CreateTechnicianScheduleDocument,
    "\n  \n  mutation UpdateTechnicianSchedule($id: ID!, $input: UpdateScheduleInput!) {\n    updateTechnicianSchedule(id: $id, input: $input) {\n      ...ScheduleItem\n    }\n  }\n": typeof types.UpdateTechnicianScheduleDocument,
    "\n  mutation DeleteTechnicianSchedule($id: ID!) {\n    deleteTechnicianSchedule(id: $id)\n  }\n": typeof types.DeleteTechnicianScheduleDocument,
    "\n  \n  mutation CopyWeekSchedules($input: CopyWeekSchedulesInput!) {\n    copyWeekSchedules(input: $input) {\n      ...ScheduleItem\n    }\n  }\n": typeof types.CopyWeekSchedulesDocument,
    "\n  \n  query GetTechnicianWeekSchedule($technicianId: ID!, $weekNumber: Int!, $year: Int!) {\n    technicianWeekSchedule(technicianId: $technicianId, weekNumber: $weekNumber, year: $year) {\n      ...ScheduleItem\n    }\n  }\n": typeof types.GetTechnicianWeekScheduleDocument,
    "\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n": typeof types.GetTechniciansDocument,
    "\n  query GetTechniciansData {\n    techniciansWithDeleted {\n      id\n      isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        firstName\n        lastName\n        fullName\n        employeeNumber\n        email\n        phone\n        departmentId\n        roleIds\n        roles {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    positionsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n": typeof types.GetTechniciansDataDocument,
    "\nquery GetTechnicianDetail($id: ID!) {\ntechnician(id: $id) {\n    id\n    isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        fullName\n        employeeNumber\n        email\n        phone\n        department {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n": typeof types.GetTechnicianDetailDocument,
    "\n  mutation CreateTechnicianProfile($input: CreateTechnicianInput!) {\n    createTechnician(input: $input) {\n      id\n    }\n  }\n": typeof types.CreateTechnicianProfileDocument,
    "\n  mutation UpdateTechnicianProfile($id: ID!, $input: UpdateTechnicianInput!) {\n    updateTechnician(id: $id, input: $input) {\n      id\n    }\n  }\n": typeof types.UpdateTechnicianProfileDocument,
    "\n  mutation ActivateTechnician($id: ID!) {\n    activateTechnician(id: $id) {\n      id\n      isActive\n    }\n  }\n": typeof types.ActivateTechnicianDocument,
    "\n  mutation DeactivateTechnician($id: ID!) {\n    deactivateTechnician(id: $id)\n  }\n": typeof types.DeactivateTechnicianDocument,
    "\n  query GetRequestersData {\n    usersWithDeleted {\n      id\n      employeeNumber\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      isActive\n      roleIds\n      department {\n        id\n        name\n      }\n      role {\n        id\n        name\n      }\n      roles {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n": typeof types.GetRequestersDataDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      fullName\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      id\n      fullName\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation DeactivateUser($id: ID!) {\n    deactivateUser(id: $id)\n  }\n": typeof types.DeactivateUserDocument,
    "\n  mutation ActivateUser($id: ID!) {\n    activateUser(id: $id) {\n      id\n      isActive\n    }\n  }\n": typeof types.ActivateUserDocument,
    "\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    scheduledDate\n    workType\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n": typeof types.WorkOrderItemFragmentDoc,
    "\n  \n  query MyRequestedWorkOrders {\n    myRequestedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": typeof types.MyRequestedWorkOrdersDocument,
    "\n  \n  query MyAssignedWorkOrders {\n    myAssignedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": typeof types.MyAssignedWorkOrdersDocument,
    "\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority, assignedShiftId: $assignedShiftId }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n": typeof types.GetWorkOrdersFilteredDocument,
    "\n  \n  query GetScheduledWorkOrders($scheduledFrom: String, $scheduledTo: String, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: {\n        maintenanceType: CORRECTIVE_SCHEDULED\n        scheduledFrom: $scheduledFrom\n        scheduledTo: $scheduledTo\n        assignedShiftId: $assignedShiftId\n      }\n      pagination: { limit: 100, page: 1 }\n      sort: { field: SCHEDULED_DATE, order: ASC }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n": typeof types.GetScheduledWorkOrdersDocument,
    "\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n": typeof types.CreateWorkOrderDocument,
    "\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      scheduledDate\n      workType\n    }\n  }\n": typeof types.AssignWorkOrderDocument,
    "\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n": typeof types.UploadWorkOrderPhotoDocument,
    "\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      functionalTimeMinutes\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n          roles {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n      customSparePart\n      customMaterial\n      spareParts {\n        id\n        quantity\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n        }\n      }\n      materials {\n        id\n        quantity\n        material {\n          id\n          description\n          brand\n        }\n      }\n    }\n  }\n": typeof types.GetWorkOrderByIdDocument,
    "\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n        roles {\n          name\n        }\n      }\n    }\n  }\n": typeof types.SignWorkOrderDocument,
    "\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n": typeof types.AssignTechnicianDocument,
    "\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n      scheduledDate\n      workType\n    }\n  }\n": typeof types.UpdateWorkOrderDocument,
    "\n  mutation ResumeWorkOrder($id: ID!) {\n    resumeWorkOrder(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.ResumeWorkOrderDocument,
    "\n  mutation StartWorkOrder($id: ID!, $input: StartWorkOrderInput!) {\n    startWorkOrder(id: $id, input: $input) {\n      id\n      breakdownDescription\n    }\n  }\n": typeof types.StartWorkOrderDocument,
    "\n  mutation PauseWorkOrder($id: ID!, $input: PauseWorkOrderInput!) {\n    pauseWorkOrder(id: $id, input: $input) {\n      id\n      pauseReason\n    }\n  }\n": typeof types.PauseWorkOrderDocument,
    "\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      breakdownDescription\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n      customSparePart\n      customMaterial\n    }\n  }\n": typeof types.CompleteWorkOrderDocument,
    "\n  mutation AddWorkOrderSparePart($input: AddWorkOrderSparePartInput!) {\n    addWorkOrderSparePart(input: $input) {\n      id\n      quantity\n      sparePart {\n        id\n        partNumber\n        brand\n        model\n      }\n    }\n  }\n": typeof types.AddWorkOrderSparePartDocument,
    "\n  mutation AddWorkOrderMaterial($input: AddWorkOrderMaterialInput!) {\n    addWorkOrderMaterial(input: $input) {\n      id\n      quantity\n      material {\n        id\n        description\n        brand\n      }\n    }\n  }\n": typeof types.AddWorkOrderMaterialDocument,
    "\n  query GetActiveMaterials {\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      unitOfMeasure\n    }\n  }\n": typeof types.GetActiveMaterialsDocument,
    "\n  query GetMachineSparePartsForWO($machineId: ID!) {\n    sparePartsByMachine(machineId: $machineId) {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      isActive\n    }\n  }\n": typeof types.GetMachineSparePartsForWoDocument,
    "\n  mutation ExportWorkOrderPdf($id: ID!) {\n    exportWorkOrderPdf(id: $id)\n  }\n": typeof types.ExportWorkOrderPdfDocument,
};
const documents: Documents = {
    "\n  \n  \n  fragment ActivityItem on Activity {\n    id\n    activity\n    startDate\n    endDate\n    progress\n    status\n    comments\n    priority\n    isActive\n    createdAt\n    updatedAt\n    areaId\n    area {\n      ...AreaBasic\n    }\n    machineId\n    machine {\n      id\n      name\n      code\n    }\n    technicians {\n      id\n      technicianId\n      assignedAt\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n": types.ActivityItemFragmentDoc,
    "\n  \n  query GetActivitiesFiltered(\n    $filters: ActivityFiltersInput\n    $pagination: ActivityPaginationInput\n    $sort: ActivitySortInput\n  ) {\n    activitiesFiltered(filters: $filters, pagination: $pagination, sort: $sort) {\n      data {\n        ...ActivityItem\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.GetActivitiesFilteredDocument,
    "\n  \n  query GetActivityById($id: ID!) {\n    activity(id: $id) {\n      ...ActivityItem\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n": types.GetActivityByIdDocument,
    "\n  query GetActivityWorkOrders($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n    }\n  }\n": types.GetActivityWorkOrdersDocument,
    "\n  query GetActivityMaterialRequests($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n": types.GetActivityMaterialRequestsDocument,
    "\n  query ExportActivitiesExcel(\n    $filters: ActivityFiltersInput\n    $sort: ActivitySortInput\n  ) {\n    exportActivitiesExcel(filters: $filters, sort: $sort)\n  }\n": types.ExportActivitiesExcelDocument,
    "\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityItem\n    }\n  }\n": types.CreateActivityDocument,
    "\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityItem\n    }\n  }\n": types.UpdateActivityDocument,
    "\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n": types.DeleteActivityDocument,
    "\n  mutation UpdateActivityPriority($id: ID!, $priority: Boolean!) {\n    updateActivityPriority(id: $id, priority: $priority) {\n      id\n      priority\n    }\n  }\n": types.UpdateActivityPriorityDocument,
    "\n  mutation AddActivityWorkOrder($input: AddActivityWorkOrderByFolioInput!) {\n    addActivityWorkOrder(input: $input) {\n      id\n      activityId\n      workOrderId\n      workOrder {\n        id\n        folio\n        description\n        status\n        area {\n          id\n          name\n        }\n        createdAt\n      }\n      createdAt\n    }\n  }\n": types.AddActivityWorkOrderDocument,
    "\n  mutation RemoveActivityWorkOrder($activityId: ID!, $workOrderId: ID!) {\n    removeActivityWorkOrder(activityId: $activityId, workOrderId: $workOrderId)\n  }\n": types.RemoveActivityWorkOrderDocument,
    "\n  mutation AddActivityMaterialRequest($input: AddActivityMaterialRequestByFolioInput!) {\n    addActivityMaterialRequest(input: $input) {\n      id\n      activityId\n      materialRequestId\n      materialRequest {\n        id\n        folio\n        category\n        importance\n        priority\n        createdAt\n      }\n      createdAt\n    }\n  }\n": types.AddActivityMaterialRequestDocument,
    "\n  mutation RemoveActivityMaterialRequest($activityId: ID!, $materialRequestId: ID!) {\n    removeActivityMaterialRequest(activityId: $activityId, materialRequestId: $materialRequestId)\n  }\n": types.RemoveActivityMaterialRequestDocument,
    "\n  fragment AreaDetail on Area {\n    id\n    name\n    type\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n": types.AreaDetailFragmentDoc,
    "\n  fragment SubAreaDetail on SubArea {\n    id\n    name\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n": types.SubAreaDetailFragmentDoc,
    "\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n": types.GetAreasDocument,
    "\n  \n  query GetAreasWithDeleted {\n    areasWithDeleted {\n      ...AreaDetail\n    }\n  }\n": types.GetAreasWithDeletedDocument,
    "\n  \n  query GetArea($id: ID!) {\n    area(id: $id) {\n      ...AreaDetail\n    }\n  }\n": types.GetAreaDocument,
    "\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n": types.GetSubAreasByAreaDocument,
    "\n  query GetWorkOrdersByArea($areaId: ID!, $page: Int, $limit: Int) {\n    workOrdersFiltered(\n      filters: { areaId: $areaId }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: CREATED_AT, order: DESC }\n    ) {\n      data {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        createdAt\n        subArea { id  name }\n        machine { id  name  code }\n        requester { id  fullName }\n        technicians { isLead  technician { id  fullName } }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.GetWorkOrdersByAreaDocument,
    "\n  query GetFindingsByArea(\n    $areaId: ID!\n    $page: Int\n    $limit: Int\n    $status: FindingStatus\n    $createdFrom: String\n    $createdTo: String\n    $search: String\n  ) {\n    findingsFiltered(\n      filters: {\n        areaId: $areaId\n        status: $status\n        createdFrom: $createdFrom\n        createdTo: $createdTo\n        search: $search\n      }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: \"createdAt\", order: \"DESC\" }\n    ) {\n      data {\n        id\n        folio\n        description\n        photoPath\n        status\n        createdAt\n        machine { id  name  code }\n        shift { id  name }\n        convertedToWo { id  folio }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.GetFindingsByAreaDocument,
    "\n  \n  mutation CreateArea($input: CreateAreaInput!) {\n    createArea(input: $input) {\n      ...AreaDetail\n    }\n  }\n": types.CreateAreaDocument,
    "\n  \n  mutation UpdateArea($id: ID!, $input: UpdateAreaInput!) {\n    updateArea(id: $id, input: $input) {\n      ...AreaDetail\n    }\n  }\n": types.UpdateAreaDocument,
    "\n  mutation DeactivateArea($id: ID!) {\n    deactivateArea(id: $id)\n  }\n": types.DeactivateAreaDocument,
    "\n  \n  mutation ActivateArea($id: ID!) {\n    activateArea(id: $id) {\n      ...AreaDetail\n    }\n  }\n": types.ActivateAreaDocument,
    "\n  \n  mutation CreateSubArea($input: CreateSubAreaInput!) {\n    createSubArea(input: $input) {\n      ...SubAreaDetail\n    }\n  }\n": types.CreateSubAreaDocument,
    "\n  \n  mutation UpdateSubArea($id: ID!, $input: UpdateSubAreaInput!) {\n    updateSubArea(id: $id, input: $input) {\n      ...SubAreaDetail\n    }\n  }\n": types.UpdateSubAreaDocument,
    "\n  mutation DeactivateSubArea($id: ID!) {\n    deactivateSubArea(id: $id)\n  }\n": types.DeactivateSubAreaDocument,
    "\n  \n  mutation Login($employeeNumber: String!, $password: String!) {\n    login(input: { employeeNumber: $employeeNumber, password: $password }) {\n      accessToken\n      user {\n        ...UserBasic\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  \n  query Me {\n    me {\n      ...UserBasic\n    }\n  }\n": types.MeDocument,
    "\n  mutation RefreshAuth {\n    refreshAuth\n  }\n": types.RefreshAuthDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n": types.GetShiftsDocument,
    "\n  query GetMaterials {\n    materialsWithDeleted {\n      id\n      description\n      brand\n      manufacturer\n      model\n      partNumber\n      sku\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n": types.GetMaterialsDocument,
    "\n  mutation CreateMaterial($input: CreateMaterialInput!) {\n    createMaterial(input: $input) {\n      id\n      description\n      isActive\n    }\n  }\n": types.CreateMaterialDocument,
    "\n  mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {\n    updateMaterial(id: $id, input: $input) {\n      id\n      description\n    }\n  }\n": types.UpdateMaterialDocument,
    "\n  mutation ActivateMaterial($id: ID!) {\n    activateMaterial(id: $id) {\n      id\n      isActive\n    }\n  }\n": types.ActivateMaterialDocument,
    "\n  mutation DeactivateMaterial($id: ID!) {\n    deactivateMaterial(id: $id)\n  }\n": types.DeactivateMaterialDocument,
    "\n  \n  query GetSpareParts {\n    sparePartsWithDeleted {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n      machine {\n        ...MachineBasic\n      }\n    }\n  }\n": types.GetSparePartsDocument,
    "\n  mutation CreateSparePart($input: CreateSparePartInput!) {\n    createSparePart(input: $input) {\n      id\n      partNumber\n      isActive\n    }\n  }\n": types.CreateSparePartDocument,
    "\n  mutation UpdateSparePart($id: ID!, $input: UpdateSparePartInput!) {\n    updateSparePart(id: $id, input: $input) {\n      id\n      partNumber\n    }\n  }\n": types.UpdateSparePartDocument,
    "\n  mutation ActivateSparePart($id: ID!) {\n    activateSparePart(id: $id) {\n      id\n      isActive\n    }\n  }\n": types.ActivateSparePartDocument,
    "\n  mutation DeactivateSparePart($id: ID!) {\n    deactivateSparePart(id: $id)\n  }\n": types.DeactivateSparePartDocument,
    "\n  query GetPositions {\n    positionsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n": types.GetPositionsDocument,
    "\n  mutation CreatePosition($input: CreatePositionInput!) {\n    createPosition(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n": types.CreatePositionDocument,
    "\n  mutation UpdatePosition($id: ID!, $input: UpdatePositionInput!) {\n    updatePosition(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n": types.UpdatePositionDocument,
    "\n  mutation ActivatePosition($id: ID!) {\n    activatePosition(id: $id) {\n      id\n      isActive\n    }\n  }\n": types.ActivatePositionDocument,
    "\n  mutation DeactivatePosition($id: ID!) {\n    deactivatePosition(id: $id)\n  }\n": types.DeactivatePositionDocument,
    "\n  query GetShiftsAll {\n    shiftsWithDeleted {\n      id\n      name\n      startTime\n      endTime\n      isActive\n      createdAt\n    }\n  }\n": types.GetShiftsAllDocument,
    "\n  mutation CreateShift($input: CreateShiftInput!) {\n    createShift(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n": types.CreateShiftDocument,
    "\n  mutation UpdateShift($id: ID!, $input: UpdateShiftInput!) {\n    updateShift(id: $id, input: $input) {\n      id\n      name\n      startTime\n      endTime\n    }\n  }\n": types.UpdateShiftDocument,
    "\n  mutation ActivateShift($id: ID!) {\n    activateShift(id: $id) {\n      id\n      isActive\n    }\n  }\n": types.ActivateShiftDocument,
    "\n  mutation DeactivateShift($id: ID!) {\n    deactivateShift(id: $id)\n  }\n": types.DeactivateShiftDocument,
    "\n  query GetDepartments {\n    departmentsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n": types.GetDepartmentsDocument,
    "\n  mutation CreateDepartment($input: CreateDepartmentInput!) {\n    createDepartment(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n": types.CreateDepartmentDocument,
    "\n  mutation UpdateDepartment($id: ID!, $input: UpdateDepartmentInput!) {\n    updateDepartment(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n": types.UpdateDepartmentDocument,
    "\n  mutation ActivateDepartment($id: ID!) {\n    activateDepartment(id: $id) {\n      id\n      isActive\n    }\n  }\n": types.ActivateDepartmentDocument,
    "\n  mutation DeactivateDepartment($id: ID!) {\n    deactivateDepartment(id: $id)\n  }\n": types.DeactivateDepartmentDocument,
    "\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        findingsByArea {\n          areaId\n          areaName\n          value\n        }\n        workOrdersByArea {\n          areaId\n          areaName\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n": types.GetDashboardDataDocument,
    "\n  \n  \n  fragment FindingBasic on Finding {\n    id\n    folio\n    description\n    photoPath\n    status\n    createdAt\n    area {\n      ...AreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    shift {\n      id\n      name\n    }\n    convertedToWo {\n      id\n      folio\n    }\n  }\n": types.FindingBasicFragmentDoc,
    "\n  \n  query GetFindingsFiltered($filters: FindingFiltersInput, $pagination: FindingPaginationInput) {\n    findingsFiltered(filters: $filters, pagination: $pagination) {\n      data {\n        ...FindingBasic\n      }\n      total\n    }\n  }\n": types.GetFindingsFilteredDocument,
    "\n  mutation CreateFinding($input: CreateFindingInput!) {\n    createFinding(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n": types.CreateFindingDocument,
    "\n  \n  query GetFindingById($id: ID!) {\n    finding(id: $id) {\n      ...FindingBasic\n      machineId\n    }\n  }\n": types.GetFindingByIdDocument,
    "\n  \n  mutation UpdateFinding($id: ID!, $input: UpdateFindingInput!) {\n    updateFinding(id: $id, input: $input) {\n      ...FindingBasic\n    }\n  }\n": types.UpdateFindingDocument,
    "\n  mutation ConvertToWorkOrder($id: ID!) {\n    convertToWorkOrder(id: $id) {\n      id\n      status\n      convertedToWo {\n        id\n        folio\n      }\n    }\n  }\n": types.ConvertToWorkOrderDocument,
    "\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n": types.RoleBasicFragmentDoc,
    "\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    roleIds\n    role {\n      ...RoleBasic\n    }\n    roles {\n      ...RoleBasic\n    }\n  }\n": types.UserBasicFragmentDoc,
    "\n  fragment AreaBasic on Area {\n    id\n    name\n    type\n    description\n    isActive\n  }\n": types.AreaBasicFragmentDoc,
    "\n  fragment SubAreaBasic on SubArea {\n    id\n    name\n    description\n    isActive\n    areaId\n  }\n": types.SubAreaBasicFragmentDoc,
    "\n  fragment MachineBasic on Machine {\n    id\n    code\n    name\n    description\n    brand\n    model\n    serialNumber\n    installationDate\n    machinePhotoUrl\n    operationalManualUrl\n    isActive\n    subAreaId\n    areaId\n    subArea {\n      id\n      name\n      area {\n        id\n        name\n        type\n      }\n    }\n    area {\n      id\n      name\n      type\n    }\n    createdAt\n    updatedAt\n  }\n": types.MachineBasicFragmentDoc,
    "\n  fragment PositionBasic on Position {\n    id\n    name\n    description\n    isActive\n  }\n": types.PositionBasicFragmentDoc,
    "\n  \n  \n  fragment TechnicianBasic on Technician {\n    id\n    isActive\n    user {\n      ...UserBasic\n    }\n    position {\n      ...PositionBasic\n    }\n  }\n": types.TechnicianBasicFragmentDoc,
    "\n  \n  query GetMachinesPageData {\n    machinesWithDeleted {\n      ...MachineBasic\n    }\n    areasActive {\n      id\n      name\n      type\n    }\n    subAreasActive {\n      id\n      name\n    }\n  }\n": types.GetMachinesPageDataDocument,
    "\n  \n  query GetMachine($id: ID!) {\n    machine(id: $id) {\n      ...MachineBasic\n    }\n  }\n": types.GetMachineDocument,
    "\n  query GetMachineSpareParts($id: ID!) {\n    sparePartsByMachine(machineId: $id) {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n": types.GetMachineSparePartsDocument,
    "\n  query GetMachineWorkOrders($id: ID!) {\n    machine(id: $id) {\n      id\n      workOrders {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        startDate\n        endDate\n        createdAt\n        area {\n          name\n        }\n        requester {\n          fullName\n        }\n      }\n    }\n  }\n": types.GetMachineWorkOrdersDocument,
    "\n  query GetMachineMaterialRequests($id: ID!) {\n    machine(id: $id) {\n      id\n      code\n      name\n      materialRequests {\n        id\n        folio\n        category\n        priority\n        importance\n        boss\n        suggestedSupplier\n        comments\n        justification\n        isActive\n        createdAt\n        items {\n          id\n          requestedQuantity\n          unitOfMeasure\n          description\n          brand\n          partNumber\n          material {\n            description\n            partNumber\n            brand\n          }\n        }\n      }\n    }\n  }\n": types.GetMachineMaterialRequestsDocument,
    "\n  \n  mutation CreateMachine($input: CreateMachineInput!) {\n    createMachine(input: $input) {\n      ...MachineBasic\n    }\n  }\n": types.CreateMachineDocument,
    "\n  \n  mutation UpdateMachine($id: ID!, $input: UpdateMachineInput!) {\n    updateMachine(id: $id, input: $input) {\n      ...MachineBasic\n    }\n  }\n": types.UpdateMachineDocument,
    "\n  mutation DeactivateMachine($id: ID!) {\n    deactivateMachine(id: $id)\n  }\n": types.DeactivateMachineDocument,
    "\n  \n  mutation ActivateMachine($id: ID!) {\n    activateMachine(id: $id) {\n      ...MachineBasic\n    }\n  }\n": types.ActivateMachineDocument,
    "\n  \n  query GetMachinesByArea($areaId: ID, $subAreaId: ID) {\n    machinesByArea(areaId: $areaId, subAreaId: $subAreaId) {\n      ...MachineBasic\n    }\n  }\n": types.GetMachinesByAreaDocument,
    "\n  query GetMaterialRequestFormData {\n    techniciansActive {\n      id\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        id\n        name\n      }\n    }\n    usersWithDeleted {\n      id\n      fullName\n      employeeNumber\n      isActive\n      roles {\n        id\n        name\n      }\n    }\n    machinesActive {\n      id\n      name\n      brand\n      model\n      manufacturer\n      areaId\n      area {\n        id\n        name\n      }\n      subAreaId\n      subArea {\n        id\n        name\n        area {\n          id\n          name\n        }\n      }\n    }\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      sku\n      unitOfMeasure\n    }\n    sparePartsActive {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      machineId\n    }\n  }\n": types.GetMaterialRequestFormDataDocument,
    "\n  query GetMaterialRequests {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      suggestedSupplier\n      isActive\n      emailSentAt\n      createdAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        partNumber\n        isGenericAllowed\n      }\n    }\n  }\n": types.GetMaterialRequestsDocument,
    "\n  query GetMaterialRequest($id: ID!) {\n    materialRequest(id: $id) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      customMachineBrand\n      customMachineModel\n      customMachineManufacturer\n      suggestedSupplier\n      justification\n      comments\n      isActive\n      emailSentAt\n      createdAt\n      updatedAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        model\n        partNumber\n        sku\n        proposedMaxStock\n        proposedMinStock\n        materialId\n        isGenericAllowed\n        sparePartId\n        material {\n          id\n          description\n          partNumber\n          brand\n          sku\n          unitOfMeasure\n        }\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n          unitOfMeasure\n        }\n      }\n    }\n  }\n": types.GetMaterialRequestDocument,
    "\n  mutation CreateMaterialRequest($input: CreateMaterialRequestInput!) {\n    createMaterialRequest(input: $input) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n        }\n      }\n      items {\n        id\n      }\n    }\n  }\n": types.CreateMaterialRequestDocument,
    "\n  mutation AddMaterialToRequest(\n    $materialRequestId: ID!\n    $input: CreateMaterialRequestItemInput!\n  ) {\n    addMaterialToRequest(\n      materialRequestId: $materialRequestId\n      input: $input\n    ) {\n      id\n      requestedQuantity\n      unitOfMeasure\n      description\n      customName\n      brand\n      model\n      partNumber\n      sku\n      proposedMaxStock\n      proposedMinStock\n      materialId\n      sparePartId\n    }\n  }\n": types.AddMaterialToRequestDocument,
    "\n  mutation UpdateMaterialRequest($id: ID!, $input: UpdateMaterialRequestInput!) {\n    updateMaterialRequest(id: $id, input: $input) {\n      id\n      folio\n    }\n  }\n": types.UpdateMaterialRequestDocument,
    "\n  mutation RemoveMaterialFromRequest($materialRequestMaterialId: ID!) {\n    removeMaterialFromRequest(materialRequestMaterialId: $materialRequestMaterialId)\n  }\n": types.RemoveMaterialFromRequestDocument,
    "\n  mutation DeactivateMaterialRequest($id: ID!) {\n    deactivateMaterialRequest(id: $id)\n  }\n": types.DeactivateMaterialRequestDocument,
    "\n  mutation SendMaterialRequestEmail($input: SendMaterialRequestEmailInput!) {\n    sendMaterialRequestEmail(input: $input)\n  }\n": types.SendMaterialRequestEmailDocument,
    "\n  query GetMaterialRequestHistories {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      justification\n      description\n      emailSentAt\n      isActive\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        sku\n        description\n        customName\n        requestedQuantity\n        unitOfMeasure\n        isGenericAllowed\n      }\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n": types.GetMaterialRequestHistoriesDocument,
    "\n  mutation UpdateMaterialRequestHistory($input: UpdateMaterialRequestHistoryInput!) {\n    updateMaterialRequestHistory(input: $input) {\n      id\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n": types.UpdateMaterialRequestHistoryDocument,
    "\n  fragment NotificationItem on Notification {\n    id\n    title\n    body\n    type\n    readAt\n    createdAt\n    data\n  }\n": types.NotificationItemFragmentDoc,
    "\n  \n  query MyNotifications($limit: Int, $page: Int, $unreadOnly: Boolean) {\n    myNotifications(\n      pagination: { limit: $limit, page: $page }\n      filters: { unreadOnly: $unreadOnly }\n    ) {\n      data {\n        ...NotificationItem\n      }\n      unreadCount\n      total\n      totalPages\n    }\n  }\n": types.MyNotificationsDocument,
    "\n  mutation MarkNotificationAsRead($id: ID!) {\n    markNotificationAsRead(id: $id) {\n      id\n      readAt\n    }\n  }\n": types.MarkNotificationAsReadDocument,
    "\n  mutation MarkAllNotificationsAsRead {\n    markAllNotificationsAsRead\n  }\n": types.MarkAllNotificationsAsReadDocument,
    "\n  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n    registerDeviceToken(input: $input) {\n      id\n      fcmToken\n      platform\n      deviceName\n    }\n  }\n": types.RegisterDeviceTokenDocument,
    "\n  mutation UnregisterDeviceToken($input: UnregisterDeviceTokenInput!) {\n    unregisterDeviceToken(input: $input)\n  }\n": types.UnregisterDeviceTokenDocument,
    "\n  query MyNotificationPreferences {\n    myNotificationPreferences {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n": types.MyNotificationPreferencesDocument,
    "\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n": types.UpdateNotificationPreferenceDocument,
    "\n  query GetOvertimeRecords(\n    $startDate: String\n    $endDate: String\n    $positionId: ID\n    $reasonForPayment: ReasonForPayment\n  ) {\n    overtimeRecords(\n      startDate: $startDate\n      endDate: $endDate\n      positionId: $positionId\n      reasonForPayment: $reasonForPayment\n    ) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n": types.GetOvertimeRecordsDocument,
    "\n  query GetMyOvertimeRecords {\n    myOvertimeRecords {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n": types.GetMyOvertimeRecordsDocument,
    "\n  query GetOvertimeRecord($id: ID!) {\n    overtimeRecord(id: $id) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n": types.GetOvertimeRecordDocument,
    "\n  mutation CreateOvertime($input: CreateOvertimeInput!) {\n    createOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n": types.CreateOvertimeDocument,
    "\n  mutation UpdateOvertime($input: UpdateOvertimeInput!) {\n    updateOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n": types.UpdateOvertimeDocument,
    "\n  mutation DeleteOvertime($id: ID!) {\n    deleteOvertime(id: $id)\n  }\n": types.DeleteOvertimeDocument,
    "\n  query GetActiveTechniciansForOvertime {\n    techniciansActive {\n      id\n      user {\n        id\n        employeeNumber\n        firstName\n        lastName\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n": types.GetActiveTechniciansForOvertimeDocument,
    "\n  query GetOvertimePositions {\n    positions {\n      id\n      name\n      isActive\n    }\n  }\n": types.GetOvertimePositionsDocument,
    "\n  fragment ScheduleItem on TechnicianSchedule {\n    id\n    technicianId\n    shiftId\n    absenceReasonId\n    scheduleDate\n    weekNumber\n    year\n    notes\n    isActive\n    shift {\n      id\n      name\n      startTime\n      endTime\n    }\n    absenceReason {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n    technician {\n      id\n      fullName\n    }\n  }\n": types.ScheduleItemFragmentDoc,
    "\n  \n  query GetWeekSchedule($weekNumber: Int!, $year: Int!) {\n    weekSchedule(weekNumber: $weekNumber, year: $year) {\n      weekNumber\n      year\n      totalAssignments\n      totalAbsences\n      totalWorkDays\n      schedules {\n        ...ScheduleItem\n      }\n    }\n  }\n": types.GetWeekScheduleDocument,
    "\n  query GetScheduleTechnicians {\n    techniciansWithDeleted {\n      id\n      isActive\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        name\n      }\n    }\n  }\n": types.GetScheduleTechniciansDocument,
    "\n  query GetAbsenceReasonsActive {\n    absenceReasonsActive {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n  }\n": types.GetAbsenceReasonsActiveDocument,
    "\n  \n  mutation AssignWeekSchedule($input: AssignWeekScheduleInput!) {\n    assignWeekSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n": types.AssignWeekScheduleDocument,
    "\n  \n  mutation CreateTechnicianSchedule($input: CreateScheduleInput!) {\n    createTechnicianSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n": types.CreateTechnicianScheduleDocument,
    "\n  \n  mutation UpdateTechnicianSchedule($id: ID!, $input: UpdateScheduleInput!) {\n    updateTechnicianSchedule(id: $id, input: $input) {\n      ...ScheduleItem\n    }\n  }\n": types.UpdateTechnicianScheduleDocument,
    "\n  mutation DeleteTechnicianSchedule($id: ID!) {\n    deleteTechnicianSchedule(id: $id)\n  }\n": types.DeleteTechnicianScheduleDocument,
    "\n  \n  mutation CopyWeekSchedules($input: CopyWeekSchedulesInput!) {\n    copyWeekSchedules(input: $input) {\n      ...ScheduleItem\n    }\n  }\n": types.CopyWeekSchedulesDocument,
    "\n  \n  query GetTechnicianWeekSchedule($technicianId: ID!, $weekNumber: Int!, $year: Int!) {\n    technicianWeekSchedule(technicianId: $technicianId, weekNumber: $weekNumber, year: $year) {\n      ...ScheduleItem\n    }\n  }\n": types.GetTechnicianWeekScheduleDocument,
    "\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n": types.GetTechniciansDocument,
    "\n  query GetTechniciansData {\n    techniciansWithDeleted {\n      id\n      isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        firstName\n        lastName\n        fullName\n        employeeNumber\n        email\n        phone\n        departmentId\n        roleIds\n        roles {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    positionsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n": types.GetTechniciansDataDocument,
    "\nquery GetTechnicianDetail($id: ID!) {\ntechnician(id: $id) {\n    id\n    isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        fullName\n        employeeNumber\n        email\n        phone\n        department {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n": types.GetTechnicianDetailDocument,
    "\n  mutation CreateTechnicianProfile($input: CreateTechnicianInput!) {\n    createTechnician(input: $input) {\n      id\n    }\n  }\n": types.CreateTechnicianProfileDocument,
    "\n  mutation UpdateTechnicianProfile($id: ID!, $input: UpdateTechnicianInput!) {\n    updateTechnician(id: $id, input: $input) {\n      id\n    }\n  }\n": types.UpdateTechnicianProfileDocument,
    "\n  mutation ActivateTechnician($id: ID!) {\n    activateTechnician(id: $id) {\n      id\n      isActive\n    }\n  }\n": types.ActivateTechnicianDocument,
    "\n  mutation DeactivateTechnician($id: ID!) {\n    deactivateTechnician(id: $id)\n  }\n": types.DeactivateTechnicianDocument,
    "\n  query GetRequestersData {\n    usersWithDeleted {\n      id\n      employeeNumber\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      isActive\n      roleIds\n      department {\n        id\n        name\n      }\n      role {\n        id\n        name\n      }\n      roles {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n": types.GetRequestersDataDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      fullName\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      id\n      fullName\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation DeactivateUser($id: ID!) {\n    deactivateUser(id: $id)\n  }\n": types.DeactivateUserDocument,
    "\n  mutation ActivateUser($id: ID!) {\n    activateUser(id: $id) {\n      id\n      isActive\n    }\n  }\n": types.ActivateUserDocument,
    "\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    scheduledDate\n    workType\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n": types.WorkOrderItemFragmentDoc,
    "\n  \n  query MyRequestedWorkOrders {\n    myRequestedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": types.MyRequestedWorkOrdersDocument,
    "\n  \n  query MyAssignedWorkOrders {\n    myAssignedWorkOrders {\n      ...WorkOrderItem\n    }\n  }\n": types.MyAssignedWorkOrdersDocument,
    "\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority, assignedShiftId: $assignedShiftId }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n": types.GetWorkOrdersFilteredDocument,
    "\n  \n  query GetScheduledWorkOrders($scheduledFrom: String, $scheduledTo: String, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: {\n        maintenanceType: CORRECTIVE_SCHEDULED\n        scheduledFrom: $scheduledFrom\n        scheduledTo: $scheduledTo\n        assignedShiftId: $assignedShiftId\n      }\n      pagination: { limit: 100, page: 1 }\n      sort: { field: SCHEDULED_DATE, order: ASC }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n": types.GetScheduledWorkOrdersDocument,
    "\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n": types.CreateWorkOrderDocument,
    "\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      scheduledDate\n      workType\n    }\n  }\n": types.AssignWorkOrderDocument,
    "\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n": types.UploadWorkOrderPhotoDocument,
    "\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      functionalTimeMinutes\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n          roles {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n      customSparePart\n      customMaterial\n      spareParts {\n        id\n        quantity\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n        }\n      }\n      materials {\n        id\n        quantity\n        material {\n          id\n          description\n          brand\n        }\n      }\n    }\n  }\n": types.GetWorkOrderByIdDocument,
    "\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n        roles {\n          name\n        }\n      }\n    }\n  }\n": types.SignWorkOrderDocument,
    "\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n": types.AssignTechnicianDocument,
    "\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n      scheduledDate\n      workType\n    }\n  }\n": types.UpdateWorkOrderDocument,
    "\n  mutation ResumeWorkOrder($id: ID!) {\n    resumeWorkOrder(id: $id) {\n      id\n      status\n    }\n  }\n": types.ResumeWorkOrderDocument,
    "\n  mutation StartWorkOrder($id: ID!, $input: StartWorkOrderInput!) {\n    startWorkOrder(id: $id, input: $input) {\n      id\n      breakdownDescription\n    }\n  }\n": types.StartWorkOrderDocument,
    "\n  mutation PauseWorkOrder($id: ID!, $input: PauseWorkOrderInput!) {\n    pauseWorkOrder(id: $id, input: $input) {\n      id\n      pauseReason\n    }\n  }\n": types.PauseWorkOrderDocument,
    "\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      breakdownDescription\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n      customSparePart\n      customMaterial\n    }\n  }\n": types.CompleteWorkOrderDocument,
    "\n  mutation AddWorkOrderSparePart($input: AddWorkOrderSparePartInput!) {\n    addWorkOrderSparePart(input: $input) {\n      id\n      quantity\n      sparePart {\n        id\n        partNumber\n        brand\n        model\n      }\n    }\n  }\n": types.AddWorkOrderSparePartDocument,
    "\n  mutation AddWorkOrderMaterial($input: AddWorkOrderMaterialInput!) {\n    addWorkOrderMaterial(input: $input) {\n      id\n      quantity\n      material {\n        id\n        description\n        brand\n      }\n    }\n  }\n": types.AddWorkOrderMaterialDocument,
    "\n  query GetActiveMaterials {\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      unitOfMeasure\n    }\n  }\n": types.GetActiveMaterialsDocument,
    "\n  query GetMachineSparePartsForWO($machineId: ID!) {\n    sparePartsByMachine(machineId: $machineId) {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      isActive\n    }\n  }\n": types.GetMachineSparePartsForWoDocument,
    "\n  mutation ExportWorkOrderPdf($id: ID!) {\n    exportWorkOrderPdf(id: $id)\n  }\n": types.ExportWorkOrderPdfDocument,
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
export function gql(source: "\n  \n  \n  fragment ActivityItem on Activity {\n    id\n    activity\n    startDate\n    endDate\n    progress\n    status\n    comments\n    priority\n    isActive\n    createdAt\n    updatedAt\n    areaId\n    area {\n      ...AreaBasic\n    }\n    machineId\n    machine {\n      id\n      name\n      code\n    }\n    technicians {\n      id\n      technicianId\n      assignedAt\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  \n  fragment ActivityItem on Activity {\n    id\n    activity\n    startDate\n    endDate\n    progress\n    status\n    comments\n    priority\n    isActive\n    createdAt\n    updatedAt\n    areaId\n    area {\n      ...AreaBasic\n    }\n    machineId\n    machine {\n      id\n      name\n      code\n    }\n    technicians {\n      id\n      technicianId\n      assignedAt\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetActivitiesFiltered(\n    $filters: ActivityFiltersInput\n    $pagination: ActivityPaginationInput\n    $sort: ActivitySortInput\n  ) {\n    activitiesFiltered(filters: $filters, pagination: $pagination, sort: $sort) {\n      data {\n        ...ActivityItem\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): (typeof documents)["\n  \n  query GetActivitiesFiltered(\n    $filters: ActivityFiltersInput\n    $pagination: ActivityPaginationInput\n    $sort: ActivitySortInput\n  ) {\n    activitiesFiltered(filters: $filters, pagination: $pagination, sort: $sort) {\n      data {\n        ...ActivityItem\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetActivityById($id: ID!) {\n    activity(id: $id) {\n      ...ActivityItem\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query GetActivityById($id: ID!) {\n    activity(id: $id) {\n      ...ActivityItem\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetActivityWorkOrders($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetActivityWorkOrders($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      workOrders {\n        id\n        workOrderId\n        createdAt\n        workOrder {\n          id\n          folio\n          description\n          status\n          area {\n            id\n            name\n          }\n          createdAt\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetActivityMaterialRequests($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetActivityMaterialRequests($id: ID!) {\n    activity(id: $id) {\n      id\n      activity\n      area {\n        id\n        name\n      }\n      machine {\n        id\n        name\n      }\n      materialRequests {\n        id\n        materialRequestId\n        createdAt\n        materialRequest {\n          id\n          folio\n          category\n          importance\n          priority\n          createdAt\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ExportActivitiesExcel(\n    $filters: ActivityFiltersInput\n    $sort: ActivitySortInput\n  ) {\n    exportActivitiesExcel(filters: $filters, sort: $sort)\n  }\n"): (typeof documents)["\n  query ExportActivitiesExcel(\n    $filters: ActivityFiltersInput\n    $sort: ActivitySortInput\n  ) {\n    exportActivitiesExcel(filters: $filters, sort: $sort)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityItem\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateActivity($input: CreateActivityInput!) {\n    createActivity(input: $input) {\n      ...ActivityItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityItem\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {\n    updateActivity(id: $id, input: $input) {\n      ...ActivityItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteActivity($id: ID!) {\n    deleteActivity(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateActivityPriority($id: ID!, $priority: Boolean!) {\n    updateActivityPriority(id: $id, priority: $priority) {\n      id\n      priority\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateActivityPriority($id: ID!, $priority: Boolean!) {\n    updateActivityPriority(id: $id, priority: $priority) {\n      id\n      priority\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddActivityWorkOrder($input: AddActivityWorkOrderByFolioInput!) {\n    addActivityWorkOrder(input: $input) {\n      id\n      activityId\n      workOrderId\n      workOrder {\n        id\n        folio\n        description\n        status\n        area {\n          id\n          name\n        }\n        createdAt\n      }\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation AddActivityWorkOrder($input: AddActivityWorkOrderByFolioInput!) {\n    addActivityWorkOrder(input: $input) {\n      id\n      activityId\n      workOrderId\n      workOrder {\n        id\n        folio\n        description\n        status\n        area {\n          id\n          name\n        }\n        createdAt\n      }\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveActivityWorkOrder($activityId: ID!, $workOrderId: ID!) {\n    removeActivityWorkOrder(activityId: $activityId, workOrderId: $workOrderId)\n  }\n"): (typeof documents)["\n  mutation RemoveActivityWorkOrder($activityId: ID!, $workOrderId: ID!) {\n    removeActivityWorkOrder(activityId: $activityId, workOrderId: $workOrderId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddActivityMaterialRequest($input: AddActivityMaterialRequestByFolioInput!) {\n    addActivityMaterialRequest(input: $input) {\n      id\n      activityId\n      materialRequestId\n      materialRequest {\n        id\n        folio\n        category\n        importance\n        priority\n        createdAt\n      }\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation AddActivityMaterialRequest($input: AddActivityMaterialRequestByFolioInput!) {\n    addActivityMaterialRequest(input: $input) {\n      id\n      activityId\n      materialRequestId\n      materialRequest {\n        id\n        folio\n        category\n        importance\n        priority\n        createdAt\n      }\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveActivityMaterialRequest($activityId: ID!, $materialRequestId: ID!) {\n    removeActivityMaterialRequest(activityId: $activityId, materialRequestId: $materialRequestId)\n  }\n"): (typeof documents)["\n  mutation RemoveActivityMaterialRequest($activityId: ID!, $materialRequestId: ID!) {\n    removeActivityMaterialRequest(activityId: $activityId, materialRequestId: $materialRequestId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment AreaDetail on Area {\n    id\n    name\n    type\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment AreaDetail on Area {\n    id\n    name\n    type\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment SubAreaDetail on SubArea {\n    id\n    name\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment SubAreaDetail on SubArea {\n    id\n    name\n    description\n    isActive\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetAreas {\n    areas {\n      ...AreaBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetAreasWithDeleted {\n    areasWithDeleted {\n      ...AreaDetail\n    }\n  }\n"): (typeof documents)["\n  \n  query GetAreasWithDeleted {\n    areasWithDeleted {\n      ...AreaDetail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetArea($id: ID!) {\n    area(id: $id) {\n      ...AreaDetail\n    }\n  }\n"): (typeof documents)["\n  \n  query GetArea($id: ID!) {\n    area(id: $id) {\n      ...AreaDetail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetSubAreasByArea($areaId: ID!) {\n    subAreasByArea(areaId: $areaId) {\n      ...SubAreaBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetWorkOrdersByArea($areaId: ID!, $page: Int, $limit: Int) {\n    workOrdersFiltered(\n      filters: { areaId: $areaId }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: CREATED_AT, order: DESC }\n    ) {\n      data {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        createdAt\n        subArea { id  name }\n        machine { id  name  code }\n        requester { id  fullName }\n        technicians { isLead  technician { id  fullName } }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): (typeof documents)["\n  query GetWorkOrdersByArea($areaId: ID!, $page: Int, $limit: Int) {\n    workOrdersFiltered(\n      filters: { areaId: $areaId }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: CREATED_AT, order: DESC }\n    ) {\n      data {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        createdAt\n        subArea { id  name }\n        machine { id  name  code }\n        requester { id  fullName }\n        technicians { isLead  technician { id  fullName } }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetFindingsByArea(\n    $areaId: ID!\n    $page: Int\n    $limit: Int\n    $status: FindingStatus\n    $createdFrom: String\n    $createdTo: String\n    $search: String\n  ) {\n    findingsFiltered(\n      filters: {\n        areaId: $areaId\n        status: $status\n        createdFrom: $createdFrom\n        createdTo: $createdTo\n        search: $search\n      }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: \"createdAt\", order: \"DESC\" }\n    ) {\n      data {\n        id\n        folio\n        description\n        photoPath\n        status\n        createdAt\n        machine { id  name  code }\n        shift { id  name }\n        convertedToWo { id  folio }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): (typeof documents)["\n  query GetFindingsByArea(\n    $areaId: ID!\n    $page: Int\n    $limit: Int\n    $status: FindingStatus\n    $createdFrom: String\n    $createdTo: String\n    $search: String\n  ) {\n    findingsFiltered(\n      filters: {\n        areaId: $areaId\n        status: $status\n        createdFrom: $createdFrom\n        createdTo: $createdTo\n        search: $search\n      }\n      pagination: { page: $page, limit: $limit }\n      sort: { field: \"createdAt\", order: \"DESC\" }\n    ) {\n      data {\n        id\n        folio\n        description\n        photoPath\n        status\n        createdAt\n        machine { id  name  code }\n        shift { id  name }\n        convertedToWo { id  folio }\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CreateArea($input: CreateAreaInput!) {\n    createArea(input: $input) {\n      ...AreaDetail\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateArea($input: CreateAreaInput!) {\n    createArea(input: $input) {\n      ...AreaDetail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation UpdateArea($id: ID!, $input: UpdateAreaInput!) {\n    updateArea(id: $id, input: $input) {\n      ...AreaDetail\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateArea($id: ID!, $input: UpdateAreaInput!) {\n    updateArea(id: $id, input: $input) {\n      ...AreaDetail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateArea($id: ID!) {\n    deactivateArea(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateArea($id: ID!) {\n    deactivateArea(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation ActivateArea($id: ID!) {\n    activateArea(id: $id) {\n      ...AreaDetail\n    }\n  }\n"): (typeof documents)["\n  \n  mutation ActivateArea($id: ID!) {\n    activateArea(id: $id) {\n      ...AreaDetail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CreateSubArea($input: CreateSubAreaInput!) {\n    createSubArea(input: $input) {\n      ...SubAreaDetail\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateSubArea($input: CreateSubAreaInput!) {\n    createSubArea(input: $input) {\n      ...SubAreaDetail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation UpdateSubArea($id: ID!, $input: UpdateSubAreaInput!) {\n    updateSubArea(id: $id, input: $input) {\n      ...SubAreaDetail\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateSubArea($id: ID!, $input: UpdateSubAreaInput!) {\n    updateSubArea(id: $id, input: $input) {\n      ...SubAreaDetail\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateSubArea($id: ID!) {\n    deactivateSubArea(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateSubArea($id: ID!) {\n    deactivateSubArea(id: $id)\n  }\n"];
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
export function gql(source: "\n  mutation RefreshAuth {\n    refreshAuth\n  }\n"): (typeof documents)["\n  mutation RefreshAuth {\n    refreshAuth\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n"): (typeof documents)["\n  query GetShifts {\n    shiftsActive {\n      id\n      name\n      startTime\n      endTime\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMaterials {\n    materialsWithDeleted {\n      id\n      description\n      brand\n      manufacturer\n      model\n      partNumber\n      sku\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetMaterials {\n    materialsWithDeleted {\n      id\n      description\n      brand\n      manufacturer\n      model\n      partNumber\n      sku\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateMaterial($input: CreateMaterialInput!) {\n    createMaterial(input: $input) {\n      id\n      description\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation CreateMaterial($input: CreateMaterialInput!) {\n    createMaterial(input: $input) {\n      id\n      description\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {\n    updateMaterial(id: $id, input: $input) {\n      id\n      description\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMaterial($id: ID!, $input: UpdateMaterialInput!) {\n    updateMaterial(id: $id, input: $input) {\n      id\n      description\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ActivateMaterial($id: ID!) {\n    activateMaterial(id: $id) {\n      id\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation ActivateMaterial($id: ID!) {\n    activateMaterial(id: $id) {\n      id\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateMaterial($id: ID!) {\n    deactivateMaterial(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateMaterial($id: ID!) {\n    deactivateMaterial(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetSpareParts {\n    sparePartsWithDeleted {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n      machine {\n        ...MachineBasic\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query GetSpareParts {\n    sparePartsWithDeleted {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n      machine {\n        ...MachineBasic\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateSparePart($input: CreateSparePartInput!) {\n    createSparePart(input: $input) {\n      id\n      partNumber\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSparePart($input: CreateSparePartInput!) {\n    createSparePart(input: $input) {\n      id\n      partNumber\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateSparePart($id: ID!, $input: UpdateSparePartInput!) {\n    updateSparePart(id: $id, input: $input) {\n      id\n      partNumber\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSparePart($id: ID!, $input: UpdateSparePartInput!) {\n    updateSparePart(id: $id, input: $input) {\n      id\n      partNumber\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ActivateSparePart($id: ID!) {\n    activateSparePart(id: $id) {\n      id\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation ActivateSparePart($id: ID!) {\n    activateSparePart(id: $id) {\n      id\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateSparePart($id: ID!) {\n    deactivateSparePart(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateSparePart($id: ID!) {\n    deactivateSparePart(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetPositions {\n    positionsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetPositions {\n    positionsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreatePosition($input: CreatePositionInput!) {\n    createPosition(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePosition($input: CreatePositionInput!) {\n    createPosition(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdatePosition($id: ID!, $input: UpdatePositionInput!) {\n    updatePosition(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePosition($id: ID!, $input: UpdatePositionInput!) {\n    updatePosition(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ActivatePosition($id: ID!) {\n    activatePosition(id: $id) {\n      id\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation ActivatePosition($id: ID!) {\n    activatePosition(id: $id) {\n      id\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivatePosition($id: ID!) {\n    deactivatePosition(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivatePosition($id: ID!) {\n    deactivatePosition(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetShiftsAll {\n    shiftsWithDeleted {\n      id\n      name\n      startTime\n      endTime\n      isActive\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetShiftsAll {\n    shiftsWithDeleted {\n      id\n      name\n      startTime\n      endTime\n      isActive\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateShift($input: CreateShiftInput!) {\n    createShift(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation CreateShift($input: CreateShiftInput!) {\n    createShift(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateShift($id: ID!, $input: UpdateShiftInput!) {\n    updateShift(id: $id, input: $input) {\n      id\n      name\n      startTime\n      endTime\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateShift($id: ID!, $input: UpdateShiftInput!) {\n    updateShift(id: $id, input: $input) {\n      id\n      name\n      startTime\n      endTime\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ActivateShift($id: ID!) {\n    activateShift(id: $id) {\n      id\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation ActivateShift($id: ID!) {\n    activateShift(id: $id) {\n      id\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateShift($id: ID!) {\n    deactivateShift(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateShift($id: ID!) {\n    deactivateShift(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDepartments {\n    departmentsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetDepartments {\n    departmentsWithDeleted {\n      id\n      name\n      description\n      isActive\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateDepartment($input: CreateDepartmentInput!) {\n    createDepartment(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation CreateDepartment($input: CreateDepartmentInput!) {\n    createDepartment(input: $input) {\n      id\n      name\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateDepartment($id: ID!, $input: UpdateDepartmentInput!) {\n    updateDepartment(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateDepartment($id: ID!, $input: UpdateDepartmentInput!) {\n    updateDepartment(id: $id, input: $input) {\n      id\n      name\n      description\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ActivateDepartment($id: ID!) {\n    activateDepartment(id: $id) {\n      id\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation ActivateDepartment($id: ID!) {\n    activateDepartment(id: $id) {\n      id\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateDepartment($id: ID!) {\n    deactivateDepartment(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateDepartment($id: ID!) {\n    deactivateDepartment(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        findingsByArea {\n          areaId\n          areaName\n          value\n        }\n        workOrdersByArea {\n          areaId\n          areaName\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n"): (typeof documents)["\nquery GetDashboardData($input: DashboardInput!) {\n    dashboardData(input: $input) {\n      generatedAt\n      kpis {\n        activeBacklog\n        leadTimeHoursAvg\n        mttrHoursAvg\n        preventiveComplianceRate\n      }\n      charts {\n        downtimeByAreaTop5 {\n          areaId\n          areaName\n          value\n        }\n        findingsConversion {\n          key\n          value\n        }\n        findingsByArea {\n          areaId\n          areaName\n          value\n        }\n        workOrdersByArea {\n          areaId\n          areaName\n          value\n        }\n        maintenanceMixByPeriod {\n          period\n          type\n          count\n        }\n        throughputByWeek {\n          period\n          count\n        }\n      }\n      rankings {\n        topMachinesByDowntime {\n          machineId\n          machineName\n          value\n        }\n        topTechniciansByClosures {\n          technicianId\n          technicianName\n          value\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  \n  fragment FindingBasic on Finding {\n    id\n    folio\n    description\n    photoPath\n    status\n    createdAt\n    area {\n      ...AreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    shift {\n      id\n      name\n    }\n    convertedToWo {\n      id\n      folio\n    }\n  }\n"): (typeof documents)["\n  \n  \n  fragment FindingBasic on Finding {\n    id\n    folio\n    description\n    photoPath\n    status\n    createdAt\n    area {\n      ...AreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    shift {\n      id\n      name\n    }\n    convertedToWo {\n      id\n      folio\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetFindingsFiltered($filters: FindingFiltersInput, $pagination: FindingPaginationInput) {\n    findingsFiltered(filters: $filters, pagination: $pagination) {\n      data {\n        ...FindingBasic\n      }\n      total\n    }\n  }\n"): (typeof documents)["\n  \n  query GetFindingsFiltered($filters: FindingFiltersInput, $pagination: FindingPaginationInput) {\n    findingsFiltered(filters: $filters, pagination: $pagination) {\n      data {\n        ...FindingBasic\n      }\n      total\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateFinding($input: CreateFindingInput!) {\n    createFinding(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFinding($input: CreateFindingInput!) {\n    createFinding(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetFindingById($id: ID!) {\n    finding(id: $id) {\n      ...FindingBasic\n      machineId\n    }\n  }\n"): (typeof documents)["\n  \n  query GetFindingById($id: ID!) {\n    finding(id: $id) {\n      ...FindingBasic\n      machineId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation UpdateFinding($id: ID!, $input: UpdateFindingInput!) {\n    updateFinding(id: $id, input: $input) {\n      ...FindingBasic\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateFinding($id: ID!, $input: UpdateFindingInput!) {\n    updateFinding(id: $id, input: $input) {\n      ...FindingBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ConvertToWorkOrder($id: ID!) {\n    convertToWorkOrder(id: $id) {\n      id\n      status\n      convertedToWo {\n        id\n        folio\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ConvertToWorkOrder($id: ID!) {\n    convertToWorkOrder(id: $id) {\n      id\n      status\n      convertedToWo {\n        id\n        folio\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n"): (typeof documents)["\n  fragment RoleBasic on Role {\n    id\n    name\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    roleIds\n    role {\n      ...RoleBasic\n    }\n    roles {\n      ...RoleBasic\n    }\n  }\n"): (typeof documents)["\n  \n  fragment UserBasic on User {\n    id\n    employeeNumber\n    firstName\n    lastName\n    fullName\n    email\n    isActive\n    roleIds\n    role {\n      ...RoleBasic\n    }\n    roles {\n      ...RoleBasic\n    }\n  }\n"];
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
export function gql(source: "\n  fragment MachineBasic on Machine {\n    id\n    code\n    name\n    description\n    brand\n    model\n    serialNumber\n    installationDate\n    machinePhotoUrl\n    operationalManualUrl\n    isActive\n    subAreaId\n    areaId\n    subArea {\n      id\n      name\n      area {\n        id\n        name\n        type\n      }\n    }\n    area {\n      id\n      name\n      type\n    }\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment MachineBasic on Machine {\n    id\n    code\n    name\n    description\n    brand\n    model\n    serialNumber\n    installationDate\n    machinePhotoUrl\n    operationalManualUrl\n    isActive\n    subAreaId\n    areaId\n    subArea {\n      id\n      name\n      area {\n        id\n        name\n        type\n      }\n    }\n    area {\n      id\n      name\n      type\n    }\n    createdAt\n    updatedAt\n  }\n"];
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
export function gql(source: "\n  \n  query GetMachinesPageData {\n    machinesWithDeleted {\n      ...MachineBasic\n    }\n    areasActive {\n      id\n      name\n      type\n    }\n    subAreasActive {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  \n  query GetMachinesPageData {\n    machinesWithDeleted {\n      ...MachineBasic\n    }\n    areasActive {\n      id\n      name\n      type\n    }\n    subAreasActive {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetMachine($id: ID!) {\n    machine(id: $id) {\n      ...MachineBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetMachine($id: ID!) {\n    machine(id: $id) {\n      ...MachineBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMachineSpareParts($id: ID!) {\n    sparePartsByMachine(machineId: $id) {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetMachineSpareParts($id: ID!) {\n    sparePartsByMachine(machineId: $id) {\n      id\n      partNumber\n      brand\n      model\n      supplier\n      unitOfMeasure\n      isActive\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMachineWorkOrders($id: ID!) {\n    machine(id: $id) {\n      id\n      workOrders {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        startDate\n        endDate\n        createdAt\n        area {\n          name\n        }\n        requester {\n          fullName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMachineWorkOrders($id: ID!) {\n    machine(id: $id) {\n      id\n      workOrders {\n        id\n        folio\n        description\n        status\n        priority\n        maintenanceType\n        startDate\n        endDate\n        createdAt\n        area {\n          name\n        }\n        requester {\n          fullName\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMachineMaterialRequests($id: ID!) {\n    machine(id: $id) {\n      id\n      code\n      name\n      materialRequests {\n        id\n        folio\n        category\n        priority\n        importance\n        boss\n        suggestedSupplier\n        comments\n        justification\n        isActive\n        createdAt\n        items {\n          id\n          requestedQuantity\n          unitOfMeasure\n          description\n          brand\n          partNumber\n          material {\n            description\n            partNumber\n            brand\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMachineMaterialRequests($id: ID!) {\n    machine(id: $id) {\n      id\n      code\n      name\n      materialRequests {\n        id\n        folio\n        category\n        priority\n        importance\n        boss\n        suggestedSupplier\n        comments\n        justification\n        isActive\n        createdAt\n        items {\n          id\n          requestedQuantity\n          unitOfMeasure\n          description\n          brand\n          partNumber\n          material {\n            description\n            partNumber\n            brand\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CreateMachine($input: CreateMachineInput!) {\n    createMachine(input: $input) {\n      ...MachineBasic\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateMachine($input: CreateMachineInput!) {\n    createMachine(input: $input) {\n      ...MachineBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation UpdateMachine($id: ID!, $input: UpdateMachineInput!) {\n    updateMachine(id: $id, input: $input) {\n      ...MachineBasic\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateMachine($id: ID!, $input: UpdateMachineInput!) {\n    updateMachine(id: $id, input: $input) {\n      ...MachineBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateMachine($id: ID!) {\n    deactivateMachine(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateMachine($id: ID!) {\n    deactivateMachine(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation ActivateMachine($id: ID!) {\n    activateMachine(id: $id) {\n      ...MachineBasic\n    }\n  }\n"): (typeof documents)["\n  \n  mutation ActivateMachine($id: ID!) {\n    activateMachine(id: $id) {\n      ...MachineBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetMachinesByArea($areaId: ID, $subAreaId: ID) {\n    machinesByArea(areaId: $areaId, subAreaId: $subAreaId) {\n      ...MachineBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetMachinesByArea($areaId: ID, $subAreaId: ID) {\n    machinesByArea(areaId: $areaId, subAreaId: $subAreaId) {\n      ...MachineBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMaterialRequestFormData {\n    techniciansActive {\n      id\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        id\n        name\n      }\n    }\n    usersWithDeleted {\n      id\n      fullName\n      employeeNumber\n      isActive\n      roles {\n        id\n        name\n      }\n    }\n    machinesActive {\n      id\n      name\n      brand\n      model\n      manufacturer\n      areaId\n      area {\n        id\n        name\n      }\n      subAreaId\n      subArea {\n        id\n        name\n        area {\n          id\n          name\n        }\n      }\n    }\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      sku\n      unitOfMeasure\n    }\n    sparePartsActive {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      machineId\n    }\n  }\n"): (typeof documents)["\n  query GetMaterialRequestFormData {\n    techniciansActive {\n      id\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        id\n        name\n      }\n    }\n    usersWithDeleted {\n      id\n      fullName\n      employeeNumber\n      isActive\n      roles {\n        id\n        name\n      }\n    }\n    machinesActive {\n      id\n      name\n      brand\n      model\n      manufacturer\n      areaId\n      area {\n        id\n        name\n      }\n      subAreaId\n      subArea {\n        id\n        name\n        area {\n          id\n          name\n        }\n      }\n    }\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      sku\n      unitOfMeasure\n    }\n    sparePartsActive {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      machineId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMaterialRequests {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      suggestedSupplier\n      isActive\n      emailSentAt\n      createdAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        partNumber\n        isGenericAllowed\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMaterialRequests {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      suggestedSupplier\n      isActive\n      emailSentAt\n      createdAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        partNumber\n        isGenericAllowed\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMaterialRequest($id: ID!) {\n    materialRequest(id: $id) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      customMachineBrand\n      customMachineModel\n      customMachineManufacturer\n      suggestedSupplier\n      justification\n      comments\n      isActive\n      emailSentAt\n      createdAt\n      updatedAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        model\n        partNumber\n        sku\n        proposedMaxStock\n        proposedMinStock\n        materialId\n        isGenericAllowed\n        sparePartId\n        material {\n          id\n          description\n          partNumber\n          brand\n          sku\n          unitOfMeasure\n        }\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n          unitOfMeasure\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMaterialRequest($id: ID!) {\n    materialRequest(id: $id) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      description\n      customMachineBrand\n      customMachineModel\n      customMachineManufacturer\n      suggestedSupplier\n      justification\n      comments\n      isActive\n      emailSentAt\n      createdAt\n      updatedAt\n      requester {\n        id\n        fullName\n        employeeNumber\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          brand\n          model\n          manufacturer\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        requestedQuantity\n        unitOfMeasure\n        description\n        customName\n        brand\n        model\n        partNumber\n        sku\n        proposedMaxStock\n        proposedMinStock\n        materialId\n        isGenericAllowed\n        sparePartId\n        material {\n          id\n          description\n          partNumber\n          brand\n          sku\n          unitOfMeasure\n        }\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n          unitOfMeasure\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateMaterialRequest($input: CreateMaterialRequestInput!) {\n    createMaterialRequest(input: $input) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n        }\n      }\n      items {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateMaterialRequest($input: CreateMaterialRequestInput!) {\n    createMaterialRequest(input: $input) {\n      id\n      folio\n      category\n      priority\n      importance\n      boss\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n        }\n      }\n      items {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddMaterialToRequest(\n    $materialRequestId: ID!\n    $input: CreateMaterialRequestItemInput!\n  ) {\n    addMaterialToRequest(\n      materialRequestId: $materialRequestId\n      input: $input\n    ) {\n      id\n      requestedQuantity\n      unitOfMeasure\n      description\n      customName\n      brand\n      model\n      partNumber\n      sku\n      proposedMaxStock\n      proposedMinStock\n      materialId\n      sparePartId\n    }\n  }\n"): (typeof documents)["\n  mutation AddMaterialToRequest(\n    $materialRequestId: ID!\n    $input: CreateMaterialRequestItemInput!\n  ) {\n    addMaterialToRequest(\n      materialRequestId: $materialRequestId\n      input: $input\n    ) {\n      id\n      requestedQuantity\n      unitOfMeasure\n      description\n      customName\n      brand\n      model\n      partNumber\n      sku\n      proposedMaxStock\n      proposedMinStock\n      materialId\n      sparePartId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateMaterialRequest($id: ID!, $input: UpdateMaterialRequestInput!) {\n    updateMaterialRequest(id: $id, input: $input) {\n      id\n      folio\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMaterialRequest($id: ID!, $input: UpdateMaterialRequestInput!) {\n    updateMaterialRequest(id: $id, input: $input) {\n      id\n      folio\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveMaterialFromRequest($materialRequestMaterialId: ID!) {\n    removeMaterialFromRequest(materialRequestMaterialId: $materialRequestMaterialId)\n  }\n"): (typeof documents)["\n  mutation RemoveMaterialFromRequest($materialRequestMaterialId: ID!) {\n    removeMaterialFromRequest(materialRequestMaterialId: $materialRequestMaterialId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateMaterialRequest($id: ID!) {\n    deactivateMaterialRequest(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateMaterialRequest($id: ID!) {\n    deactivateMaterialRequest(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SendMaterialRequestEmail($input: SendMaterialRequestEmailInput!) {\n    sendMaterialRequestEmail(input: $input)\n  }\n"): (typeof documents)["\n  mutation SendMaterialRequestEmail($input: SendMaterialRequestEmailInput!) {\n    sendMaterialRequestEmail(input: $input)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMaterialRequestHistories {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      justification\n      description\n      emailSentAt\n      isActive\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        sku\n        description\n        customName\n        requestedQuantity\n        unitOfMeasure\n        isGenericAllowed\n      }\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMaterialRequestHistories {\n    materialRequestsWithDeleted {\n      id\n      folio\n      category\n      priority\n      importance\n      justification\n      description\n      emailSentAt\n      isActive\n      createdAt\n      requester {\n        id\n        fullName\n      }\n      machines {\n        id\n        machineId\n        machine {\n          id\n          name\n          areaId\n          area {\n            id\n            name\n          }\n          subAreaId\n          subArea {\n            id\n            name\n            area {\n              id\n              name\n            }\n          }\n        }\n      }\n      items {\n        id\n        sku\n        description\n        customName\n        requestedQuantity\n        unitOfMeasure\n        isGenericAllowed\n      }\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateMaterialRequestHistory($input: UpdateMaterialRequestHistoryInput!) {\n    updateMaterialRequestHistory(input: $input) {\n      id\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMaterialRequestHistory($input: UpdateMaterialRequestHistoryInput!) {\n    updateMaterialRequestHistory(input: $input) {\n      id\n      histories {\n        id\n        status\n        purchaseRequest\n        purchaseOrder\n        deliveryMerchandise\n        deliveryDate\n        progressPercentage\n        supplier\n      }\n    }\n  }\n"];
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
export function gql(source: "\n  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n    registerDeviceToken(input: $input) {\n      id\n      fcmToken\n      platform\n      deviceName\n    }\n  }\n"): (typeof documents)["\n  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {\n    registerDeviceToken(input: $input) {\n      id\n      fcmToken\n      platform\n      deviceName\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UnregisterDeviceToken($input: UnregisterDeviceTokenInput!) {\n    unregisterDeviceToken(input: $input)\n  }\n"): (typeof documents)["\n  mutation UnregisterDeviceToken($input: UnregisterDeviceTokenInput!) {\n    unregisterDeviceToken(input: $input)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyNotificationPreferences {\n    myNotificationPreferences {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n"): (typeof documents)["\n  query MyNotificationPreferences {\n    myNotificationPreferences {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {\n    updateNotificationPreference(input: $input) {\n      id\n      userId\n      notificationType\n      pushEnabled\n      emailEnabled\n      inAppEnabled\n      quietHoursStart\n      quietHoursEnd\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetOvertimeRecords(\n    $startDate: String\n    $endDate: String\n    $positionId: ID\n    $reasonForPayment: ReasonForPayment\n  ) {\n    overtimeRecords(\n      startDate: $startDate\n      endDate: $endDate\n      positionId: $positionId\n      reasonForPayment: $reasonForPayment\n    ) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetOvertimeRecords(\n    $startDate: String\n    $endDate: String\n    $positionId: ID\n    $reasonForPayment: ReasonForPayment\n  ) {\n    overtimeRecords(\n      startDate: $startDate\n      endDate: $endDate\n      positionId: $positionId\n      reasonForPayment: $reasonForPayment\n    ) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMyOvertimeRecords {\n    myOvertimeRecords {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetMyOvertimeRecords {\n    myOvertimeRecords {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetOvertimeRecord($id: ID!) {\n    overtimeRecord(id: $id) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query GetOvertimeRecord($id: ID!) {\n    overtimeRecord(id: $id) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n      technician {\n        id\n        user {\n          id\n          employeeNumber\n          firstName\n          lastName\n        }\n        position {\n          id\n          name\n        }\n      }\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateOvertime($input: CreateOvertimeInput!) {\n    createOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOvertime($input: CreateOvertimeInput!) {\n    createOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateOvertime($input: UpdateOvertimeInput!) {\n    updateOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateOvertime($input: UpdateOvertimeInput!) {\n    updateOvertime(input: $input) {\n      id\n      workDate\n      startTime\n      endTime\n      workTime\n      activity\n      reasonForPayment\n      technicianId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteOvertime($id: ID!) {\n    deleteOvertime(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteOvertime($id: ID!) {\n    deleteOvertime(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetActiveTechniciansForOvertime {\n    techniciansActive {\n      id\n      user {\n        id\n        employeeNumber\n        firstName\n        lastName\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetActiveTechniciansForOvertime {\n    techniciansActive {\n      id\n      user {\n        id\n        employeeNumber\n        firstName\n        lastName\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetOvertimePositions {\n    positions {\n      id\n      name\n      isActive\n    }\n  }\n"): (typeof documents)["\n  query GetOvertimePositions {\n    positions {\n      id\n      name\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment ScheduleItem on TechnicianSchedule {\n    id\n    technicianId\n    shiftId\n    absenceReasonId\n    scheduleDate\n    weekNumber\n    year\n    notes\n    isActive\n    shift {\n      id\n      name\n      startTime\n      endTime\n    }\n    absenceReason {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n    technician {\n      id\n      fullName\n    }\n  }\n"): (typeof documents)["\n  fragment ScheduleItem on TechnicianSchedule {\n    id\n    technicianId\n    shiftId\n    absenceReasonId\n    scheduleDate\n    weekNumber\n    year\n    notes\n    isActive\n    shift {\n      id\n      name\n      startTime\n      endTime\n    }\n    absenceReason {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n    technician {\n      id\n      fullName\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetWeekSchedule($weekNumber: Int!, $year: Int!) {\n    weekSchedule(weekNumber: $weekNumber, year: $year) {\n      weekNumber\n      year\n      totalAssignments\n      totalAbsences\n      totalWorkDays\n      schedules {\n        ...ScheduleItem\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query GetWeekSchedule($weekNumber: Int!, $year: Int!) {\n    weekSchedule(weekNumber: $weekNumber, year: $year) {\n      weekNumber\n      year\n      totalAssignments\n      totalAbsences\n      totalWorkDays\n      schedules {\n        ...ScheduleItem\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetScheduleTechnicians {\n    techniciansWithDeleted {\n      id\n      isActive\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetScheduleTechnicians {\n    techniciansWithDeleted {\n      id\n      isActive\n      user {\n        id\n        fullName\n        employeeNumber\n      }\n      position {\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAbsenceReasonsActive {\n    absenceReasonsActive {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n  }\n"): (typeof documents)["\n  query GetAbsenceReasonsActive {\n    absenceReasonsActive {\n      id\n      name\n      isActive\n      maxPerWeek\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation AssignWeekSchedule($input: AssignWeekScheduleInput!) {\n    assignWeekSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n"): (typeof documents)["\n  \n  mutation AssignWeekSchedule($input: AssignWeekScheduleInput!) {\n    assignWeekSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CreateTechnicianSchedule($input: CreateScheduleInput!) {\n    createTechnicianSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CreateTechnicianSchedule($input: CreateScheduleInput!) {\n    createTechnicianSchedule(input: $input) {\n      ...ScheduleItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation UpdateTechnicianSchedule($id: ID!, $input: UpdateScheduleInput!) {\n    updateTechnicianSchedule(id: $id, input: $input) {\n      ...ScheduleItem\n    }\n  }\n"): (typeof documents)["\n  \n  mutation UpdateTechnicianSchedule($id: ID!, $input: UpdateScheduleInput!) {\n    updateTechnicianSchedule(id: $id, input: $input) {\n      ...ScheduleItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteTechnicianSchedule($id: ID!) {\n    deleteTechnicianSchedule(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteTechnicianSchedule($id: ID!) {\n    deleteTechnicianSchedule(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  mutation CopyWeekSchedules($input: CopyWeekSchedulesInput!) {\n    copyWeekSchedules(input: $input) {\n      ...ScheduleItem\n    }\n  }\n"): (typeof documents)["\n  \n  mutation CopyWeekSchedules($input: CopyWeekSchedulesInput!) {\n    copyWeekSchedules(input: $input) {\n      ...ScheduleItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetTechnicianWeekSchedule($technicianId: ID!, $weekNumber: Int!, $year: Int!) {\n    technicianWeekSchedule(technicianId: $technicianId, weekNumber: $weekNumber, year: $year) {\n      ...ScheduleItem\n    }\n  }\n"): (typeof documents)["\n  \n  query GetTechnicianWeekSchedule($technicianId: ID!, $weekNumber: Int!, $year: Int!) {\n    technicianWeekSchedule(technicianId: $technicianId, weekNumber: $weekNumber, year: $year) {\n      ...ScheduleItem\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n"): (typeof documents)["\n  \n  query GetTechnicians {\n    techniciansActive {\n      ...TechnicianBasic\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTechniciansData {\n    techniciansWithDeleted {\n      id\n      isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        firstName\n        lastName\n        fullName\n        employeeNumber\n        email\n        phone\n        departmentId\n        roleIds\n        roles {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    positionsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GetTechniciansData {\n    techniciansWithDeleted {\n      id\n      isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        firstName\n        lastName\n        fullName\n        employeeNumber\n        email\n        phone\n        departmentId\n        roleIds\n        roles {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    positionsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetTechnicianDetail($id: ID!) {\ntechnician(id: $id) {\n    id\n    isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        fullName\n        employeeNumber\n        email\n        phone\n        department {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\nquery GetTechnicianDetail($id: ID!) {\ntechnician(id: $id) {\n    id\n    isActive\n      address\n      allergies\n      birthDate\n      bloodType\n      childrenCount\n      education\n      emergencyContactName\n      emergencyContactPhone\n      emergencyContactRelationship\n      hireDate\n      nss\n      pantsSize\n      rfc\n      shirtSize\n      shoeSize\n      transportRoute\n      vacationPeriod\n      user {\n        id\n        fullName\n        employeeNumber\n        email\n        phone\n        department {\n          id\n          name\n        }\n      }\n      position {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateTechnicianProfile($input: CreateTechnicianInput!) {\n    createTechnician(input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTechnicianProfile($input: CreateTechnicianInput!) {\n    createTechnician(input: $input) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateTechnicianProfile($id: ID!, $input: UpdateTechnicianInput!) {\n    updateTechnician(id: $id, input: $input) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTechnicianProfile($id: ID!, $input: UpdateTechnicianInput!) {\n    updateTechnician(id: $id, input: $input) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ActivateTechnician($id: ID!) {\n    activateTechnician(id: $id) {\n      id\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation ActivateTechnician($id: ID!) {\n    activateTechnician(id: $id) {\n      id\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateTechnician($id: ID!) {\n    deactivateTechnician(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateTechnician($id: ID!) {\n    deactivateTechnician(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetRequestersData {\n    usersWithDeleted {\n      id\n      employeeNumber\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      isActive\n      roleIds\n      department {\n        id\n        name\n      }\n      role {\n        id\n        name\n      }\n      roles {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GetRequestersData {\n    usersWithDeleted {\n      id\n      employeeNumber\n      firstName\n      lastName\n      fullName\n      email\n      phone\n      isActive\n      roleIds\n      department {\n        id\n        name\n      }\n      role {\n        id\n        name\n      }\n      roles {\n        id\n        name\n      }\n    }\n    departmentsWithDeleted {\n      id\n      name\n    }\n    rolesWithDeleted {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      fullName\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      fullName\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      id\n      fullName\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      id\n      fullName\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateUser($id: ID!) {\n    deactivateUser(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeactivateUser($id: ID!) {\n    deactivateUser(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ActivateUser($id: ID!) {\n    activateUser(id: $id) {\n      id\n      isActive\n    }\n  }\n"): (typeof documents)["\n  mutation ActivateUser($id: ID!) {\n    activateUser(id: $id) {\n      id\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    scheduledDate\n    workType\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  \n  \n  \n  fragment WorkOrderItem on WorkOrder {\n    id\n    folio\n    description\n    status\n    priority\n    maintenanceType\n    stopType\n    assignedShiftId\n    machineId\n    scheduledDate\n    workType\n    createdAt\n    isFullySigned\n    area {\n      ...AreaBasic\n    }\n    subArea {\n      ...SubAreaBasic\n    }\n    machine {\n      ...MachineBasic\n    }\n    requester {\n      ...UserBasic\n    }\n    technicians {\n      isLead\n      technician {\n        ...UserBasic\n      }\n    }\n  }\n"];
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
export function gql(source: "\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority, assignedShiftId: $assignedShiftId }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n"): (typeof documents)["\n  \n  query GetWorkOrdersFiltered($status: WorkOrderStatus, $priority: WorkOrderPriority, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: { status: $status, priority: $priority, assignedShiftId: $assignedShiftId }\n      pagination: { limit: 100, page: 1 }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetScheduledWorkOrders($scheduledFrom: String, $scheduledTo: String, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: {\n        maintenanceType: CORRECTIVE_SCHEDULED\n        scheduledFrom: $scheduledFrom\n        scheduledTo: $scheduledTo\n        assignedShiftId: $assignedShiftId\n      }\n      pagination: { limit: 100, page: 1 }\n      sort: { field: SCHEDULED_DATE, order: ASC }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n"): (typeof documents)["\n  \n  query GetScheduledWorkOrders($scheduledFrom: String, $scheduledTo: String, $assignedShiftId: ID) {\n    workOrdersFiltered(\n      filters: {\n        maintenanceType: CORRECTIVE_SCHEDULED\n        scheduledFrom: $scheduledFrom\n        scheduledTo: $scheduledTo\n        assignedShiftId: $assignedShiftId\n      }\n      pagination: { limit: 100, page: 1 }\n      sort: { field: SCHEDULED_DATE, order: ASC }\n    ) {\n      data {\n        ...WorkOrderItem\n      }\n      total\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {\n    createWorkOrder(input: $input) {\n      id\n      folio\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      scheduledDate\n      workType\n    }\n  }\n"): (typeof documents)["\n  mutation AssignWorkOrder($id: ID!, $input: AssignWorkOrderInput!) {\n    assignWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      scheduledDate\n      workType\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n"): (typeof documents)["\n  mutation UploadWorkOrderPhoto($input: CreateWorkOrderPhotoInput!) {\n    uploadWorkOrderPhoto(input: $input) {\n      id\n      filePath\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      functionalTimeMinutes\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n          roles {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n      customSparePart\n      customMaterial\n      spareParts {\n        id\n        quantity\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n        }\n      }\n      materials {\n        id\n        quantity\n        material {\n          id\n          description\n          brand\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  \n  query GetWorkOrderById($id: ID!) {\n    workOrder(id: $id) {\n      ...WorkOrderItem\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      functionalTimeMinutes\n      downtimeMinutes\n      breakdownDescription\n      startDate\n      endDate\n      pauseReason\n      signatures {\n        id\n        signatureImagePath\n        signedAt\n        signer {\n          id\n          firstName\n          lastName\n          role {\n            name\n          }\n          roles {\n            name\n          }\n        }\n      }\n      photos {\n        id\n        photoType\n        filePath\n      }\n      customSparePart\n      customMaterial\n      spareParts {\n        id\n        quantity\n        sparePart {\n          id\n          partNumber\n          brand\n          model\n        }\n      }\n      materials {\n        id\n        quantity\n        material {\n          id\n          description\n          brand\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n        roles {\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SignWorkOrder($input: CreateWorkOrderSignatureInput!) {\n    signWorkOrder(input: $input) {\n      id\n      signatureImagePath\n      signedAt\n      workOrderId\n      signer {\n        id\n        firstName\n        lastName\n        role {\n          name\n        }\n        roles {\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AssignTechnician($input: AssignTechnicianInput!) {\n    assignTechnician(input: $input) {\n      id\n      isLead\n      technician {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n      scheduledDate\n      workType\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateWorkOrder($id: ID!, $input: UpdateWorkOrderInput!) {\n    updateWorkOrder(id: $id, input: $input) {\n      id\n      status\n      priority\n      maintenanceType\n      stopType\n      assignedShiftId\n      machineId\n      scheduledDate\n      workType\n    }\n  }\n"];
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
export function gql(source: "\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      breakdownDescription\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n      customSparePart\n      customMaterial\n    }\n  }\n"): (typeof documents)["\n  mutation CompleteWorkOrder($id: ID!, $input: CompleteWorkOrderInput!) {\n    completeWorkOrder(id: $id, input: $input) {\n      id\n      downtimeMinutes\n      breakdownDescription\n      cause\n      actionTaken\n      toolsUsed\n      observations\n      status\n      customSparePart\n      customMaterial\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddWorkOrderSparePart($input: AddWorkOrderSparePartInput!) {\n    addWorkOrderSparePart(input: $input) {\n      id\n      quantity\n      sparePart {\n        id\n        partNumber\n        brand\n        model\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddWorkOrderSparePart($input: AddWorkOrderSparePartInput!) {\n    addWorkOrderSparePart(input: $input) {\n      id\n      quantity\n      sparePart {\n        id\n        partNumber\n        brand\n        model\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddWorkOrderMaterial($input: AddWorkOrderMaterialInput!) {\n    addWorkOrderMaterial(input: $input) {\n      id\n      quantity\n      material {\n        id\n        description\n        brand\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddWorkOrderMaterial($input: AddWorkOrderMaterialInput!) {\n    addWorkOrderMaterial(input: $input) {\n      id\n      quantity\n      material {\n        id\n        description\n        brand\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetActiveMaterials {\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      unitOfMeasure\n    }\n  }\n"): (typeof documents)["\n  query GetActiveMaterials {\n    materialsActive {\n      id\n      description\n      brand\n      model\n      partNumber\n      unitOfMeasure\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMachineSparePartsForWO($machineId: ID!) {\n    sparePartsByMachine(machineId: $machineId) {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      isActive\n    }\n  }\n"): (typeof documents)["\n  query GetMachineSparePartsForWO($machineId: ID!) {\n    sparePartsByMachine(machineId: $machineId) {\n      id\n      partNumber\n      brand\n      model\n      unitOfMeasure\n      isActive\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ExportWorkOrderPdf($id: ID!) {\n    exportWorkOrderPdf(id: $id)\n  }\n"): (typeof documents)["\n  mutation ExportWorkOrderPdf($id: ID!) {\n    exportWorkOrderPdf(id: $id)\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;