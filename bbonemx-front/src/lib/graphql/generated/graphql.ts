/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AbsenceReason = {
  __typename?: 'AbsenceReason';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maxPerWeek?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Activity = {
  __typename?: 'Activity';
  activity: Scalars['String']['output'];
  area: Area;
  areaId: Scalars['ID']['output'];
  comments?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  endDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  machine: Machine;
  machineId: Scalars['ID']['output'];
  materialRequests: Array<ActivityMaterialRequest>;
  priority: Scalars['Boolean']['output'];
  progress: Scalars['Int']['output'];
  startDate: Scalars['DateTime']['output'];
  status: ActivityStatus;
  technicians: Array<ActivityTechnician>;
  updatedAt: Scalars['DateTime']['output'];
  workOrders: Array<ActivityWorkOrder>;
};

export type ActivityFiltersInput = {
  areaId?: InputMaybe<Scalars['ID']['input']>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  /** Filtrar solo actividades prioritarias */
  priority?: InputMaybe<Scalars['Boolean']['input']>;
  /** Búsqueda por nombre de actividad */
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ActivityStatus>;
};

export type ActivityMaterialRequest = {
  __typename?: 'ActivityMaterialRequest';
  activityId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  materialRequest: MaterialRequest;
  materialRequestId: Scalars['ID']['output'];
};

export type ActivityPaginatedResponse = {
  __typename?: 'ActivityPaginatedResponse';
  data: Array<Activity>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type ActivityPaginationInput = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

/** Campos disponibles para ordenar actividades */
export type ActivitySortField =
  /** Fecha de creación */
  | 'CREATED_AT'
  /** Fecha de fin */
  | 'END_DATE'
  /** Fecha de inicio */
  | 'START_DATE';

export type ActivitySortInput = {
  field?: ActivitySortField;
  order?: SortOrder;
};

/** Estados posibles de una actividad de mantenimiento */
export type ActivityStatus =
  /** Realizado */
  | 'COMPLETED'
  /** En progreso */
  | 'IN_PROGRESS'
  /** Pendiente */
  | 'PENDING';

export type ActivityTechnician = {
  __typename?: 'ActivityTechnician';
  activityId: Scalars['ID']['output'];
  assignedAt: Scalars['DateTime']['output'];
  assignedBy: Scalars['ID']['output'];
  assigner: User;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  technician: User;
  technicianId: Scalars['ID']['output'];
};

export type ActivityWorkOrder = {
  __typename?: 'ActivityWorkOrder';
  activityId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  workOrder: WorkOrder;
  workOrderId: Scalars['ID']['output'];
};

export type AddActivityMaterialRequestByFolioInput = {
  activityId: Scalars['ID']['input'];
  folio: Scalars['String']['input'];
};

export type AddActivityWorkOrderByFolioInput = {
  activityId: Scalars['ID']['input'];
  folio: Scalars['String']['input'];
};

export type AddWorkOrderMaterialInput = {
  materialId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity?: Scalars['Int']['input'];
  workOrderId: Scalars['ID']['input'];
};

export type AddWorkOrderSparePartInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity?: Scalars['Int']['input'];
  sparePartId: Scalars['ID']['input'];
  workOrderId: Scalars['ID']['input'];
};

export type Area = {
  __typename?: 'Area';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  type: AreaType;
  updatedAt: Scalars['DateTime']['output'];
};

export type AreaMetric = {
  __typename?: 'AreaMetric';
  areaId: Scalars['String']['output'];
  areaName: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

/** Tipo de área */
export type AreaType =
  /** Área operativa - Puede tener sub-áreas y máquinas */
  | 'OPERATIONAL'
  /** Área de producción - Puede tener líneas (sub-áreas) y máquinas directas */
  | 'PRODUCTION'
  /** Área de servicio - No tiene sub-áreas */
  | 'SERVICE';

export type AssignTechnicianInput = {
  isLead?: Scalars['Boolean']['input'];
  technicianId: Scalars['ID']['input'];
  workOrderId: Scalars['ID']['input'];
};

export type AssignWeekScheduleInput = {
  /** Asignaciones por día (hasta 7) */
  days: Array<DayScheduleInput>;
  /** ID del técnico (user) */
  technicianId: Scalars['ID']['input'];
  /** Número de semana del año (1-53) */
  weekNumber: Scalars['Int']['input'];
  /** Año */
  year: Scalars['Int']['input'];
};

export type AssignWorkOrderInput = {
  assignedShiftId?: InputMaybe<Scalars['ID']['input']>;
  /** ID del técnico líder */
  leadTechnicianId?: InputMaybe<Scalars['ID']['input']>;
  /** Máquina asociada (requerida si stopType = BREAKDOWN) */
  machineId?: InputMaybe<Scalars['ID']['input']>;
  maintenanceType: MaintenanceType;
  priority: WorkOrderPriority;
  /** Fecha programada (requerida cuando maintenanceType = CORRECTIVE_SCHEDULED) */
  scheduledDate?: InputMaybe<Scalars['String']['input']>;
  stopType?: InputMaybe<StopType>;
  /** IDs de técnicos a asignar */
  technicianIds: Array<Scalars['ID']['input']>;
  workType: WorkType;
};

export type BulkUpdatePreferencesInput = {
  preferences: Array<UpdateNotificationPreferenceInput>;
};

export type CleanupTableResult = {
  __typename?: 'CleanupTableResult';
  deleted: Scalars['Int']['output'];
  table: Scalars['String']['output'];
};

export type ClosePreventiveTaskInput = {
  continuationTask?: InputMaybe<CreatePreventiveTaskInput>;
  /** Si se debe crear una nueva tarea de continuación */
  createContinuation?: InputMaybe<Scalars['Boolean']['input']>;
  policyChangeNote: Scalars['String']['input'];
};

export type CompleteWorkOrderInput = {
  actionTaken?: InputMaybe<Scalars['String']['input']>;
  /** Descripción técnica de la falla (solo BREAKDOWN) */
  breakdownDescription?: InputMaybe<Scalars['String']['input']>;
  cause?: InputMaybe<Scalars['String']['input']>;
  /** Material no listado en catálogo */
  customMaterial?: InputMaybe<Scalars['String']['input']>;
  /** Refacción no listada en catálogo */
  customSparePart?: InputMaybe<Scalars['String']['input']>;
  downtimeMinutes?: InputMaybe<Scalars['Int']['input']>;
  /** COMPLETED o TEMPORARY_REPAIR */
  finalStatus?: WorkOrderStatus;
  observations?: InputMaybe<Scalars['String']['input']>;
  toolsUsed?: InputMaybe<Scalars['String']['input']>;
};

export type CopyWeekSchedulesInput = {
  /** Semana origen */
  sourceWeekNumber: Scalars['Int']['input'];
  /** Año origen */
  sourceYear: Scalars['Int']['input'];
  /** Semana destino */
  targetWeekNumber: Scalars['Int']['input'];
  /** Año destino */
  targetYear: Scalars['Int']['input'];
  /** Copiar solo para un técnico específico (null = todos) */
  technicianId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateAbsenceReasonInput = {
  /** Máximo permitido por semana (NULL = Sin límite) */
  maxPerWeek?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};

export type CreateActivityInput = {
  activity: Scalars['String']['input'];
  areaId: Scalars['ID']['input'];
  comments?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['String']['input'];
  machineId: Scalars['ID']['input'];
  priority?: Scalars['Boolean']['input'];
  progress?: Scalars['Int']['input'];
  startDate: Scalars['String']['input'];
  status?: ActivityStatus;
  /** IDs de técnicos a asignar */
  technicianIds: Array<Scalars['ID']['input']>;
};

export type CreateAreaInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: AreaType;
};

export type CreateDepartmentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateFindingInput = {
  areaId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  machineId?: InputMaybe<Scalars['ID']['input']>;
  photoPath?: InputMaybe<Scalars['String']['input']>;
  shiftId: Scalars['ID']['input'];
};

export type CreateMachineInput = {
  /** ID del área (si la máquina pertenece directamente al área) */
  areaId?: InputMaybe<Scalars['ID']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  installationDate?: InputMaybe<Scalars['DateTime']['input']>;
  machinePhotoUrl?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  operationalManualUrl?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  /** ID de la sub-área (si la máquina pertenece a una sub-área) */
  subAreaId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateMaterialInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  partNumber?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  unitOfMeasure?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMaterialRequestInput = {
  boss: Scalars['String']['input'];
  category: Scalars['String']['input'];
  comments?: InputMaybe<Scalars['String']['input']>;
  customMachineBrand: Scalars['String']['input'];
  customMachineManufacturer: Scalars['String']['input'];
  customMachineModel: Scalars['String']['input'];
  customMachineName: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  importance: Scalars['String']['input'];
  items?: InputMaybe<Array<CreateMaterialRequestItemInput>>;
  justification?: InputMaybe<Scalars['String']['input']>;
  machineIds: Array<Scalars['ID']['input']>;
  priority: Scalars['String']['input'];
  requesterId: Scalars['ID']['input'];
  suggestedSupplier?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMaterialRequestItemInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  customName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isGenericAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  materialId?: InputMaybe<Scalars['ID']['input']>;
  materialRequestId?: InputMaybe<Scalars['ID']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  partNumber?: InputMaybe<Scalars['String']['input']>;
  proposedMaxStock?: InputMaybe<Scalars['Int']['input']>;
  proposedMinStock?: InputMaybe<Scalars['Int']['input']>;
  requestedQuantity?: InputMaybe<Scalars['Int']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  sparePartId?: InputMaybe<Scalars['ID']['input']>;
  unitOfMeasure?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOvertimeInput = {
  activity: Scalars['String']['input'];
  endTime: Scalars['String']['input'];
  reasonForPayment?: InputMaybe<ReasonForPayment>;
  startTime: Scalars['String']['input'];
  technicianId?: InputMaybe<Scalars['ID']['input']>;
  workDate: Scalars['String']['input'];
};

export type CreatePositionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreatePreventiveTaskInput = {
  advanceHours?: Scalars['Int']['input'];
  description: Scalars['String']['input'];
  frequencyType: FrequencyType;
  frequencyUnit?: InputMaybe<FrequencyUnit>;
  frequencyValue?: InputMaybe<Scalars['Int']['input']>;
  machineId: Scalars['ID']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type CreateRoleInput = {
  name: Scalars['String']['input'];
};

export type CreateScheduleInput = {
  /** ID del motivo de ausencia (si aplica) */
  absenceReasonId?: InputMaybe<Scalars['ID']['input']>;
  /** Notas adicionales */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** Fecha de la asignación (YYYY-MM-DD) */
  scheduleDate: Scalars['String']['input'];
  /** ID del turno (null si ausencia) */
  shiftId?: InputMaybe<Scalars['ID']['input']>;
  /** ID del técnico (user) */
  technicianId: Scalars['ID']['input'];
};

export type CreateShiftInput = {
  endTime: Scalars['String']['input'];
  name: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
};

export type CreateSparePartInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  machineId: Scalars['ID']['input'];
  model?: InputMaybe<Scalars['String']['input']>;
  partNumber: Scalars['String']['input'];
  supplier?: InputMaybe<Scalars['String']['input']>;
  unitOfMeasure?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSubAreaInput = {
  areaId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateTechnicianInput = {
  address: Scalars['String']['input'];
  allergies: Scalars['String']['input'];
  birthDate: Scalars['DateTime']['input'];
  bloodType: Scalars['String']['input'];
  childrenCount: Scalars['Float']['input'];
  education: Scalars['String']['input'];
  emergencyContactName: Scalars['String']['input'];
  emergencyContactPhone: Scalars['String']['input'];
  emergencyContactRelationship: Scalars['String']['input'];
  hireDate: Scalars['DateTime']['input'];
  /** Si el técnico tiene rol de jefe */
  isBoss?: InputMaybe<Scalars['Boolean']['input']>;
  nss?: InputMaybe<Scalars['String']['input']>;
  pantsSize: Scalars['String']['input'];
  positionId: Scalars['String']['input'];
  rfc?: InputMaybe<Scalars['String']['input']>;
  shirtSize: Scalars['String']['input'];
  shoeSize: Scalars['String']['input'];
  transportRoute: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
  vacationPeriod: Scalars['Float']['input'];
};

export type CreateUserInput = {
  departmentId: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  employeeNumber: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  roleIds: Array<Scalars['String']['input']>;
};

export type CreateWorkOrderInput = {
  areaId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  machineId?: InputMaybe<Scalars['ID']['input']>;
  subAreaId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateWorkOrderPhotoInput = {
  fileName: Scalars['String']['input'];
  filePath: Scalars['String']['input'];
  mimeType: Scalars['String']['input'];
  photoType: PhotoType;
  workOrderId: Scalars['ID']['input'];
};

export type CreateWorkOrderSignatureInput = {
  signatureImagePath: Scalars['String']['input'];
  workOrderId: Scalars['ID']['input'];
};

export type CronJobStatus = {
  __typename?: 'CronJobStatus';
  cronExpression: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  nextRunAt?: Maybe<Scalars['DateTime']['output']>;
  retentionDays?: Maybe<Scalars['Int']['output']>;
  timeZone?: Maybe<Scalars['String']['output']>;
};

export type DashboardCharts = {
  __typename?: 'DashboardCharts';
  downtimeByAreaTop5: Array<AreaMetric>;
  findingsByArea: Array<AreaMetric>;
  findingsConversion: Array<KeyValue>;
  maintenanceMixByPeriod: Array<MixPoint>;
  throughputByWeek: Array<TimeCount>;
  workOrdersByArea: Array<AreaMetric>;
};

export type DashboardData = {
  __typename?: 'DashboardData';
  cacheTtlSeconds: Scalars['Int']['output'];
  charts: DashboardCharts;
  generatedAt: Scalars['DateTime']['output'];
  kpis: DashboardKpis;
  rankings: DashboardRankings;
};

export type DashboardInput = {
  areaIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** RANGO DE INICIO */
  dateFrom: Scalars['String']['input'];
  /** RANGO DE FIN */
  dateTo: Scalars['String']['input'];
  machineIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  shiftIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  technicianIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  timezone?: Scalars['String']['input'];
  woStatuses?: InputMaybe<Array<WorkOrderStatus>>;
};

export type DashboardKpis = {
  __typename?: 'DashboardKpis';
  activeBacklog: Scalars['Int']['output'];
  leadTimeHoursAvg: Scalars['Float']['output'];
  mttrHoursAvg: Scalars['Float']['output'];
  preventiveComplianceRate: Scalars['Float']['output'];
};

export type DashboardRankings = {
  __typename?: 'DashboardRankings';
  topMachinesByDowntime: Array<MachineMetric>;
  topTechniciansByClosures: Array<TechnicianMetric>;
};

export type DayScheduleInput = {
  /** ID del motivo de ausencia */
  absenceReasonId?: InputMaybe<Scalars['ID']['input']>;
  /** Notas adicionales */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** Fecha del día (YYYY-MM-DD) */
  scheduleDate: Scalars['String']['input'];
  /** ID del turno (null si ausencia) */
  shiftId?: InputMaybe<Scalars['ID']['input']>;
};

export type Department = {
  __typename?: 'Department';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Plataforma del dispositivo */
export type DevicePlatform =
  | 'ANDROID'
  | 'IOS'
  | 'WEB';

export type Finding = {
  __typename?: 'Finding';
  area: Area;
  convertedToWo?: Maybe<WorkOrder>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  folio: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  machine?: Maybe<Machine>;
  machineId?: Maybe<Scalars['ID']['output']>;
  photoPath?: Maybe<Scalars['String']['output']>;
  sequence: Scalars['Int']['output'];
  shift: Shift;
  status: FindingStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type FindingFiltersInput = {
  areaId?: InputMaybe<Scalars['ID']['input']>;
  /** Filtrar por creador */
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  /** Fecha de creación desde (ISO) */
  createdFrom?: InputMaybe<Scalars['String']['input']>;
  /** Fecha de creación hasta (ISO) */
  createdTo?: InputMaybe<Scalars['String']['input']>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  /** Búsqueda por folio o descripción */
  search?: InputMaybe<Scalars['String']['input']>;
  shiftId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<FindingStatus>;
};

export type FindingPaginatedResponse = {
  __typename?: 'FindingPaginatedResponse';
  data: Array<Finding>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type FindingPaginationInput = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type FindingSortInput = {
  field?: Scalars['String']['input'];
  order?: Scalars['String']['input'];
};

export type FindingStats = {
  __typename?: 'FindingStats';
  count: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

/** Estados posibles de un hallazgo */
export type FindingStatus =
  /** Convertido a OT - Se generó una orden de trabajo */
  | 'CONVERTED_TO_WO'
  /** Abierto - Hallazgo registrado pendiente de acción */
  | 'OPEN';

/** Tipo de frecuencia para tareas preventivas */
export type FrequencyType =
  /** Personalizado (cada N días/horas) */
  | 'CUSTOM'
  /** Diario */
  | 'DAILY'
  /** Mensual */
  | 'MONTHLY'
  /** Semanal */
  | 'WEEKLY';

/** Unidad de frecuencia para tareas preventivas */
export type FrequencyUnit =
  /** Días */
  | 'DAYS'
  /** Horas */
  | 'HOURS';

export type GenerateWorkOrdersResult = {
  __typename?: 'GenerateWorkOrdersResult';
  generated: Scalars['Int']['output'];
  tasks: Array<Scalars['String']['output']>;
};

export type KeyValue = {
  __typename?: 'KeyValue';
  key: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type LoginInput = {
  employeeNumber: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken: Scalars['String']['output'];
  user: User;
};

export type Machine = {
  __typename?: 'Machine';
  /** Área directa (null si pertenece a sub-área) */
  area?: Maybe<Area>;
  /** ID del área directa (null si pertenece a sub-área) */
  areaId?: Maybe<Scalars['ID']['output']>;
  brand?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  installationDate?: Maybe<Scalars['DateTime']['output']>;
  isActive: Scalars['Boolean']['output'];
  machinePhotoUrl?: Maybe<Scalars['String']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  materialRequests?: Maybe<Array<MaterialRequest>>;
  model?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  operationalManualUrl?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  spareParts?: Maybe<Array<SparePart>>;
  /** Sub-área (null si pertenece directamente al área) */
  subArea?: Maybe<SubArea>;
  /** ID de la sub-área (null si pertenece directamente al área) */
  subAreaId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  workOrders?: Maybe<Array<WorkOrder>>;
};

export type MachineMetric = {
  __typename?: 'MachineMetric';
  machineId?: Maybe<Scalars['String']['output']>;
  machineName: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

/** Tipos de mantenimiento */
export type MaintenanceType =
  /** Correctivo emergente - falla inesperada */
  | 'CORRECTIVE_EMERGENT'
  /** Correctivo programado */
  | 'CORRECTIVE_SCHEDULED'
  /** Mantenimiento derivado de hallazgo */
  | 'FINDING'
  /** Mantenimiento preventivo programado */
  | 'PREVENTIVE';

export type Material = {
  __typename?: 'Material';
  brand?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  manufacturer?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  partNumber?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  unitOfMeasure?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MaterialRequest = {
  __typename?: 'MaterialRequest';
  boss: Scalars['String']['output'];
  category: RequestCategory;
  comments?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customMachineBrand?: Maybe<Scalars['String']['output']>;
  customMachineManufacturer?: Maybe<Scalars['String']['output']>;
  customMachineModel?: Maybe<Scalars['String']['output']>;
  customMachineName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  emailSentAt?: Maybe<Scalars['DateTime']['output']>;
  folio: Scalars['String']['output'];
  histories?: Maybe<Array<MaterialRequestHistory>>;
  id: Scalars['ID']['output'];
  importance: RequestImportance;
  isActive: Scalars['Boolean']['output'];
  items: Array<MaterialRequestItem>;
  justification?: Maybe<Scalars['String']['output']>;
  machines: Array<MaterialRequestMachine>;
  priority: RequestPriority;
  requester: User;
  requesterId: Scalars['ID']['output'];
  sequence: Scalars['Int']['output'];
  suggestedSupplier?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MaterialRequestHistory = {
  __typename?: 'MaterialRequestHistory';
  createdAt: Scalars['DateTime']['output'];
  deliveryDate?: Maybe<Scalars['DateTime']['output']>;
  deliveryMerchandise?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  materialRequestId: Scalars['ID']['output'];
  progressPercentage?: Maybe<Scalars['Int']['output']>;
  purchaseOrder?: Maybe<Scalars['String']['output']>;
  purchaseRequest?: Maybe<Scalars['String']['output']>;
  status: StatusHistoryMr;
  supplier?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MaterialRequestItem = {
  __typename?: 'MaterialRequestItem';
  brand?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isGenericAllowed: Scalars['Boolean']['output'];
  material?: Maybe<Material>;
  materialId?: Maybe<Scalars['ID']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  partNumber?: Maybe<Scalars['String']['output']>;
  proposedMaxStock?: Maybe<Scalars['Int']['output']>;
  proposedMinStock?: Maybe<Scalars['Int']['output']>;
  requestedQuantity?: Maybe<Scalars['Int']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  sparePart?: Maybe<SparePart>;
  sparePartId?: Maybe<Scalars['ID']['output']>;
  unitOfMeasure?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MaterialRequestMachine = {
  __typename?: 'MaterialRequestMachine';
  id: Scalars['ID']['output'];
  machine: Machine;
  machineId: Scalars['ID']['output'];
};

export type MixPoint = {
  __typename?: 'MixPoint';
  count: Scalars['Int']['output'];
  period: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  activateAbsenceReason: AbsenceReason;
  activateArea: Area;
  activateDepartment: Department;
  activateMachine: Machine;
  activateMaterial: Material;
  activatePosition: Position;
  activatePreventiveTask: PreventiveTask;
  activateRole: Role;
  activateShift: Shift;
  activateSparePart: SparePart;
  activateSubArea: SubArea;
  activateTechnician: Technician;
  activateUser: User;
  addActivityMaterialRequest: ActivityMaterialRequest;
  addActivityWorkOrder: ActivityWorkOrder;
  addMaterialToRequest: MaterialRequestItem;
  addWorkOrderMaterial: WorkOrderMaterial;
  addWorkOrderSparePart: WorkOrderSparePart;
  assignTechnician: WorkOrderTechnician;
  /** Asigna la semana completa de un técnico (reemplaza asignaciones existentes) */
  assignWeekSchedule: Array<TechnicianSchedule>;
  assignWorkOrder: WorkOrder;
  /** Actualiza múltiples preferencias de notificación en batch */
  bulkUpdateNotificationPreferences: Array<NotificationPreference>;
  changeWorkOrderStatus: WorkOrder;
  closePreventiveTask: PreventiveTask;
  completeWorkOrder: WorkOrder;
  convertToWorkOrder: Finding;
  /** Copia los horarios de una semana a otra (reasignación) */
  copyWeekSchedules: Array<TechnicianSchedule>;
  createAbsenceReason: AbsenceReason;
  createActivity: Activity;
  createArea: Area;
  createDepartment: Department;
  createFinding: Finding;
  createMachine: Machine;
  createMaterial: Material;
  createMaterialRequest: MaterialRequest;
  createOvertime: Overtime;
  createPosition: Position;
  createPreventiveTask: PreventiveTask;
  createRole: Role;
  createShift: Shift;
  createSparePart: SparePart;
  createSubArea: SubArea;
  createTechnician: Technician;
  /** Asigna un turno o ausencia a un técnico para un día específico */
  createTechnicianSchedule: TechnicianSchedule;
  createUser: User;
  createWorkOrder: WorkOrder;
  deactivateAbsenceReason: Scalars['Boolean']['output'];
  deactivateArea: Scalars['Boolean']['output'];
  deactivateDepartment: Scalars['Boolean']['output'];
  deactivateMachine: Scalars['Boolean']['output'];
  deactivateMaterial: Scalars['Boolean']['output'];
  deactivateMaterialRequest: Scalars['Boolean']['output'];
  deactivatePosition: Scalars['Boolean']['output'];
  deactivatePreventiveTask: PreventiveTask;
  deactivateRole: Role;
  deactivateShift: Scalars['Boolean']['output'];
  deactivateSparePart: Scalars['Boolean']['output'];
  deactivateSubArea: Scalars['Boolean']['output'];
  deactivateTechnician: Scalars['Boolean']['output'];
  deactivateUser: Scalars['Boolean']['output'];
  deleteActivity: Scalars['Boolean']['output'];
  deleteFinding: Finding;
  /** Elimina una notificación (soft delete) */
  deleteNotification: Scalars['Boolean']['output'];
  deleteOvertime: Scalars['Boolean']['output'];
  /** Elimina (soft-delete) una asignación de horario */
  deleteTechnicianSchedule: Scalars['Boolean']['output'];
  deleteWorkOrder: Scalars['Boolean']['output'];
  deleteWorkOrderPhoto: WorkOrderPhoto;
  generateWorkOrdersForPreventiveTask: GenerateWorkOrdersResult;
  /** Inicia sesión con número de empleado y contraseña */
  login: LoginResponse;
  /** Cierra sesión y limpia cookies de autenticación */
  logout: Scalars['Boolean']['output'];
  /** Marca todas las notificaciones como leídas. Retorna cantidad actualizada. */
  markAllNotificationsAsRead: Scalars['Int']['output'];
  /** Marca una notificación como leída */
  markNotificationAsRead: Notification;
  pausePreventiveTasksCron: Scalars['Boolean']['output'];
  pauseTechnicianBirthdaysCron: Scalars['Boolean']['output'];
  pauseWorkOrder: WorkOrder;
  /** Renueva sesión con refresh token rotativo en cookie HttpOnly */
  refreshAuth: Scalars['Boolean']['output'];
  /** Registra un token FCM para recibir notificaciones push */
  registerDeviceToken: UserDeviceToken;
  removeActivityMaterialRequest: Scalars['Boolean']['output'];
  removeActivityWorkOrder: Scalars['Boolean']['output'];
  removeMaterialFromRequest: Scalars['Boolean']['output'];
  removeWorkOrderMaterial: Scalars['Boolean']['output'];
  removeWorkOrderSparePart: Scalars['Boolean']['output'];
  resumePreventiveTasksCron: Scalars['Boolean']['output'];
  resumeTechnicianBirthdaysCron: Scalars['Boolean']['output'];
  resumeWorkOrder: WorkOrder;
  runPreventiveTasksCron: GenerateWorkOrdersResult;
  runTechnicianBirthdaysWeeklyEmail: TechnicianBirthdaysEmailResult;
  sendMaterialRequestEmail: Scalars['Boolean']['output'];
  setLeadTechnician: WorkOrderTechnician;
  signWorkOrder: WorkOrderSignature;
  startWorkOrder: WorkOrder;
  unassignTechnician: Scalars['Boolean']['output'];
  /** Elimina un token FCM (al cerrar sesión) */
  unregisterDeviceToken: Scalars['Boolean']['output'];
  updateAbsenceReason: AbsenceReason;
  updateActivity: Activity;
  updateActivityPriority: Activity;
  updateArea: Area;
  updateDepartment: Department;
  updateFinding: Finding;
  updateMachine: Machine;
  updateMaterial: Material;
  updateMaterialRequest: MaterialRequest;
  updateMaterialRequestHistory: MaterialRequest;
  /** Actualiza una preferencia de notificación */
  updateNotificationPreference: NotificationPreference;
  updateOvertime: Overtime;
  updatePosition: Position;
  updatePreventiveTask: PreventiveTask;
  updateRole: Role;
  updateShift: Shift;
  updateSparePart: SparePart;
  updateSubArea: SubArea;
  updateTechnician: Technician;
  /** Actualiza una asignación de horario existente */
  updateTechnicianSchedule: TechnicianSchedule;
  updateUser: User;
  updateWorkOrder: WorkOrder;
  uploadWorkOrderPhoto: WorkOrderPhoto;
};


export type MutationActivateAbsenceReasonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateAreaArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateDepartmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateMachineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateMaterialArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivatePositionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivatePreventiveTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateShiftArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateSparePartArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateSubAreaArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateTechnicianArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAddActivityMaterialRequestArgs = {
  input: AddActivityMaterialRequestByFolioInput;
};


export type MutationAddActivityWorkOrderArgs = {
  input: AddActivityWorkOrderByFolioInput;
};


export type MutationAddMaterialToRequestArgs = {
  input: CreateMaterialRequestItemInput;
  materialRequestId: Scalars['ID']['input'];
};


export type MutationAddWorkOrderMaterialArgs = {
  input: AddWorkOrderMaterialInput;
};


export type MutationAddWorkOrderSparePartArgs = {
  input: AddWorkOrderSparePartInput;
};


export type MutationAssignTechnicianArgs = {
  input: AssignTechnicianInput;
};


export type MutationAssignWeekScheduleArgs = {
  input: AssignWeekScheduleInput;
};


export type MutationAssignWorkOrderArgs = {
  id: Scalars['ID']['input'];
  input: AssignWorkOrderInput;
};


export type MutationBulkUpdateNotificationPreferencesArgs = {
  input: BulkUpdatePreferencesInput;
};


export type MutationChangeWorkOrderStatusArgs = {
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationClosePreventiveTaskArgs = {
  id: Scalars['ID']['input'];
  input: ClosePreventiveTaskInput;
};


export type MutationCompleteWorkOrderArgs = {
  id: Scalars['ID']['input'];
  input: CompleteWorkOrderInput;
};


export type MutationConvertToWorkOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCopyWeekSchedulesArgs = {
  input: CopyWeekSchedulesInput;
};


export type MutationCreateAbsenceReasonArgs = {
  input: CreateAbsenceReasonInput;
};


export type MutationCreateActivityArgs = {
  input: CreateActivityInput;
};


export type MutationCreateAreaArgs = {
  input: CreateAreaInput;
};


export type MutationCreateDepartmentArgs = {
  input: CreateDepartmentInput;
};


export type MutationCreateFindingArgs = {
  input: CreateFindingInput;
};


export type MutationCreateMachineArgs = {
  input: CreateMachineInput;
};


export type MutationCreateMaterialArgs = {
  input: CreateMaterialInput;
};


export type MutationCreateMaterialRequestArgs = {
  input: CreateMaterialRequestInput;
};


export type MutationCreateOvertimeArgs = {
  input: CreateOvertimeInput;
};


export type MutationCreatePositionArgs = {
  input: CreatePositionInput;
};


export type MutationCreatePreventiveTaskArgs = {
  input: CreatePreventiveTaskInput;
};


export type MutationCreateRoleArgs = {
  input: CreateRoleInput;
};


export type MutationCreateShiftArgs = {
  input: CreateShiftInput;
};


export type MutationCreateSparePartArgs = {
  input: CreateSparePartInput;
};


export type MutationCreateSubAreaArgs = {
  input: CreateSubAreaInput;
};


export type MutationCreateTechnicianArgs = {
  input: CreateTechnicianInput;
};


export type MutationCreateTechnicianScheduleArgs = {
  input: CreateScheduleInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateWorkOrderArgs = {
  input: CreateWorkOrderInput;
};


export type MutationDeactivateAbsenceReasonArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateAreaArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateDepartmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateMachineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateMaterialArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateMaterialRequestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivatePositionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivatePreventiveTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateShiftArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateSparePartArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateSubAreaArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateTechnicianArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteActivityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFindingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOvertimeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTechnicianScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWorkOrderPhotoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPauseWorkOrderArgs = {
  id: Scalars['ID']['input'];
  input: PauseWorkOrderInput;
};


export type MutationRegisterDeviceTokenArgs = {
  input: RegisterDeviceTokenInput;
};


export type MutationRemoveActivityMaterialRequestArgs = {
  activityId: Scalars['ID']['input'];
  materialRequestId: Scalars['ID']['input'];
};


export type MutationRemoveActivityWorkOrderArgs = {
  activityId: Scalars['ID']['input'];
  workOrderId: Scalars['ID']['input'];
};


export type MutationRemoveMaterialFromRequestArgs = {
  materialRequestMaterialId: Scalars['ID']['input'];
};


export type MutationRemoveWorkOrderMaterialArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveWorkOrderSparePartArgs = {
  id: Scalars['ID']['input'];
};


export type MutationResumeWorkOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSendMaterialRequestEmailArgs = {
  input: SendMaterialRequestEmailInput;
};


export type MutationSetLeadTechnicianArgs = {
  id: Scalars['ID']['input'];
  technicianId: Scalars['ID']['input'];
};


export type MutationSignWorkOrderArgs = {
  input: CreateWorkOrderSignatureInput;
};


export type MutationStartWorkOrderArgs = {
  id: Scalars['ID']['input'];
  input: StartWorkOrderInput;
};


export type MutationUnassignTechnicianArgs = {
  id: Scalars['ID']['input'];
  technicianId: Scalars['ID']['input'];
};


export type MutationUnregisterDeviceTokenArgs = {
  input: UnregisterDeviceTokenInput;
};


export type MutationUpdateAbsenceReasonArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAbsenceReasonInput;
};


export type MutationUpdateActivityArgs = {
  id: Scalars['ID']['input'];
  input: UpdateActivityInput;
};


export type MutationUpdateActivityPriorityArgs = {
  id: Scalars['ID']['input'];
  priority: Scalars['Boolean']['input'];
};


export type MutationUpdateAreaArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAreaInput;
};


export type MutationUpdateDepartmentArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDepartmentInput;
};


export type MutationUpdateFindingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFindingInput;
};


export type MutationUpdateMachineArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMachineInput;
};


export type MutationUpdateMaterialArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMaterialInput;
};


export type MutationUpdateMaterialRequestArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMaterialRequestInput;
};


export type MutationUpdateMaterialRequestHistoryArgs = {
  input: UpdateMaterialRequestHistoryInput;
};


export type MutationUpdateNotificationPreferenceArgs = {
  input: UpdateNotificationPreferenceInput;
};


export type MutationUpdateOvertimeArgs = {
  input: UpdateOvertimeInput;
};


export type MutationUpdatePositionArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePositionInput;
};


export type MutationUpdatePreventiveTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePreventiveTaskInput;
};


export type MutationUpdateRoleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateRoleInput;
};


export type MutationUpdateShiftArgs = {
  id: Scalars['ID']['input'];
  input: UpdateShiftInput;
};


export type MutationUpdateSparePartArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSparePartInput;
};


export type MutationUpdateSubAreaArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSubAreaInput;
};


export type MutationUpdateTechnicianArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTechnicianInput;
};


export type MutationUpdateTechnicianScheduleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateScheduleInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUpdateWorkOrderArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWorkOrderInput;
};


export type MutationUploadWorkOrderPhotoArgs = {
  input: CreateWorkOrderPhotoInput;
};

export type Notification = {
  __typename?: 'Notification';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  data?: Maybe<Scalars['String']['output']>;
  emailSent: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  pushSent: Scalars['Boolean']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  recipient: User;
  recipientId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  type: NotificationType;
};

export type NotificationFiltersInput = {
  /** Filtrar por tipo */
  type?: InputMaybe<NotificationType>;
  /** Solo no leídas */
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type NotificationPaginatedResponse = {
  __typename?: 'NotificationPaginatedResponse';
  data: Array<Notification>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type NotificationPaginationInput = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type NotificationPreference = {
  __typename?: 'NotificationPreference';
  emailEnabled: Scalars['Boolean']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  inAppEnabled: Scalars['Boolean']['output'];
  notificationType: NotificationType;
  pushEnabled: Scalars['Boolean']['output'];
  quietHoursEnd?: Maybe<Scalars['String']['output']>;
  quietHoursStart?: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

/** Tipos de notificación del sistema */
export type NotificationType =
  /** Tarea preventiva generó una OT */
  | 'PREVENTIVE_TASK_WO_GENERATED'
  /** Técnico asignado a una OT */
  | 'WORK_ORDER_ASSIGNED'
  /** OT completada — recordatorio para firmar */
  | 'WORK_ORDER_COMPLETED'
  /** Requester creó una nueva OT */
  | 'WORK_ORDER_CREATED_BY_REQUESTER'
  /** OT reparación temporal — recordatorio para firmar */
  | 'WORK_ORDER_TEMPORARY_REPAIR';

export type Overtime = {
  __typename?: 'Overtime';
  activity: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  reasonForPayment?: Maybe<ReasonForPayment>;
  startTime: Scalars['String']['output'];
  technician: Technician;
  technicianId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workDate: Scalars['DateTime']['output'];
  workTime: Scalars['String']['output'];
};

export type PaginationInput = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type PauseWorkOrderInput = {
  pauseReason: Scalars['String']['input'];
};

/** Tipo de foto */
export type PhotoType =
  /** Foto después del trabajo */
  | 'AFTER'
  /** Foto antes del trabajo */
  | 'BEFORE';

export type Position = {
  __typename?: 'Position';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PreventiveTask = {
  __typename?: 'PreventiveTask';
  advanceHours: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  frequencyDescription: Scalars['String']['output'];
  frequencyType: FrequencyType;
  frequencyUnit?: Maybe<FrequencyUnit>;
  frequencyValue?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastWoGeneratedAt?: Maybe<Scalars['DateTime']['output']>;
  machine: Machine;
  machineId: Scalars['ID']['output'];
  nextExecutionDate?: Maybe<Scalars['DateTime']['output']>;
  parentTask?: Maybe<PreventiveTask>;
  parentTaskId?: Maybe<Scalars['ID']['output']>;
  policyChangeNote?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  status: PreventiveTaskStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type PreventiveTaskFiltersInput = {
  frequencyType?: InputMaybe<FrequencyType>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  /** Próxima ejecución desde (ISO) */
  nextExecutionFrom?: InputMaybe<Scalars['String']['input']>;
  /** Próxima ejecución hasta (ISO) */
  nextExecutionTo?: InputMaybe<Scalars['String']['input']>;
  /** Búsqueda por descripción */
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PreventiveTaskStatus>;
};

export type PreventiveTaskPaginatedResponse = {
  __typename?: 'PreventiveTaskPaginatedResponse';
  data: Array<PreventiveTask>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PreventiveTaskPaginationInput = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type PreventiveTaskSortInput = {
  field?: Scalars['String']['input'];
  order?: Scalars['String']['input'];
};

export type PreventiveTaskStats = {
  __typename?: 'PreventiveTaskStats';
  count: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

/** Estado de una tarea preventiva */
export type PreventiveTaskStatus =
  /** Activa - Generando WOs según programación */
  | 'ACTIVE'
  /** Cerrada - Terminada por cambio de política */
  | 'CLOSED'
  /** Inactiva - Pausada temporalmente */
  | 'INACTIVE';

export type Query = {
  __typename?: 'Query';
  absenceReason?: Maybe<AbsenceReason>;
  absenceReasons: Array<AbsenceReason>;
  absenceReasonsActive: Array<AbsenceReason>;
  absenceReasonsWithDeleted: Array<AbsenceReason>;
  activitiesFiltered: ActivityPaginatedResponse;
  activity?: Maybe<Activity>;
  area?: Maybe<Area>;
  areaByName?: Maybe<Area>;
  areas: Array<Area>;
  areasActive: Array<Area>;
  areasWithDeleted: Array<Area>;
  dashboardData: DashboardData;
  department?: Maybe<Department>;
  departments: Array<Department>;
  departmentsActive: Array<Department>;
  departmentsWithDeleted: Array<Department>;
  /** Exportar actividades a Excel (Base64) */
  exportActivitiesExcel: Scalars['String']['output'];
  finding?: Maybe<Finding>;
  findingByFolio?: Maybe<Finding>;
  findings: Array<Finding>;
  findingsCountOpen: Scalars['Int']['output'];
  findingsFiltered: FindingPaginatedResponse;
  findingsOpen: Array<Finding>;
  findingsStats: Array<FindingStats>;
  findingsWithDeleted: Array<Finding>;
  machine?: Maybe<Machine>;
  machines: Array<Machine>;
  machinesActive: Array<Machine>;
  /** Búsqueda flexible de máquinas por área y/o sub-área */
  machinesByArea: Array<Machine>;
  machinesByAreaOrSubArea: Array<Machine>;
  machinesWithDeleted: Array<Machine>;
  material?: Maybe<Material>;
  materialRequest?: Maybe<MaterialRequest>;
  materialRequestByFolio?: Maybe<MaterialRequest>;
  materialRequests: Array<MaterialRequest>;
  materialRequestsActive: Array<MaterialRequest>;
  materialRequestsWithDeleted: Array<MaterialRequest>;
  materials: Array<Material>;
  materialsActive: Array<Material>;
  materialsWithDeleted: Array<Material>;
  /** Obtiene el usuario actualmente autenticado */
  me: User;
  myAssignedWorkOrders: Array<WorkOrder>;
  /** Obtiene los tokens FCM registrados del usuario autenticado */
  myDeviceTokens: Array<UserDeviceToken>;
  /** Obtiene las preferencias de notificación del usuario */
  myNotificationPreferences: Array<NotificationPreference>;
  /** Obtiene las notificaciones del usuario autenticado con paginación */
  myNotifications: NotificationPaginatedResponse;
  myOvertimeRecords: Array<Overtime>;
  myRequestedWorkOrders: Array<WorkOrder>;
  overtimeRecord?: Maybe<Overtime>;
  overtimeRecords: Array<Overtime>;
  position?: Maybe<Position>;
  positions: Array<Position>;
  positionsActive: Array<Position>;
  positionsWithDeleted: Array<Position>;
  preventiveTaskById?: Maybe<PreventiveTask>;
  preventiveTaskCountActive: Scalars['Int']['output'];
  preventiveTaskStats: Array<PreventiveTaskStats>;
  preventiveTasks: Array<PreventiveTask>;
  preventiveTasksActive: Array<PreventiveTask>;
  preventiveTasksByMachineId: Array<PreventiveTask>;
  preventiveTasksCronStatus: CronJobStatus;
  preventiveTasksFiltered: PreventiveTaskPaginatedResponse;
  preventiveTasksWithDeleted: Array<PreventiveTask>;
  role?: Maybe<Role>;
  roles: Array<Role>;
  rolesActive: Array<Role>;
  rolesWithDeleted: Array<Role>;
  schedulerStatus: SchedulerStatus;
  shift?: Maybe<Shift>;
  shifts: Array<Shift>;
  shiftsActive: Array<Shift>;
  shiftsWithDeleted: Array<Shift>;
  sparePart?: Maybe<SparePart>;
  spareParts: Array<SparePart>;
  sparePartsActive: Array<SparePart>;
  sparePartsByMachine: Array<SparePart>;
  sparePartsWithDeleted: Array<SparePart>;
  subArea?: Maybe<SubArea>;
  subAreas: Array<SubArea>;
  subAreasActive: Array<SubArea>;
  subAreasByArea: Array<SubArea>;
  subAreasWithDeleted: Array<SubArea>;
  technician?: Maybe<Technician>;
  technicianBirthdaysCronStatus: CronJobStatus;
  /** Obtiene un horario por ID */
  technicianSchedule?: Maybe<TechnicianSchedule>;
  /** Obtiene todos los horarios de técnicos */
  technicianSchedules: Array<TechnicianSchedule>;
  /** Consulta horarios con filtros: por día, turno, técnico, semana, ausencia */
  technicianSchedulesFiltered: Array<TechnicianSchedule>;
  /** Obtiene todos los horarios de técnicos incluyendo eliminados */
  technicianSchedulesWithDeleted: Array<TechnicianSchedule>;
  /** Obtiene los horarios de un técnico en una semana específica */
  technicianWeekSchedule: Array<TechnicianSchedule>;
  technicians: Array<Technician>;
  techniciansActive: Array<Technician>;
  techniciansWithDeleted: Array<Technician>;
  /** Contador de notificaciones no leídas */
  unreadNotificationsCount: Scalars['Int']['output'];
  user?: Maybe<User>;
  users: Array<User>;
  usersWithDeleted: Array<User>;
  /** Obtiene los horarios de una semana completa con resumen */
  weekSchedule: WeekScheduleSummary;
  workOrder?: Maybe<WorkOrder>;
  workOrderByFolio?: Maybe<WorkOrder>;
  workOrderStats: Array<WorkOrderStats>;
  workOrders: Array<WorkOrder>;
  workOrdersFiltered: WorkOrderPaginatedResponse;
  workOrdersWithDeleted: Array<WorkOrder>;
};


export type QueryAbsenceReasonArgs = {
  id: Scalars['ID']['input'];
};


export type QueryActivitiesFilteredArgs = {
  filters?: InputMaybe<ActivityFiltersInput>;
  pagination?: InputMaybe<ActivityPaginationInput>;
  sort?: InputMaybe<ActivitySortInput>;
};


export type QueryActivityArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAreaArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAreaByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryDashboardDataArgs = {
  input: DashboardInput;
};


export type QueryDepartmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExportActivitiesExcelArgs = {
  filters?: InputMaybe<ActivityFiltersInput>;
  sort?: InputMaybe<ActivitySortInput>;
};


export type QueryFindingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFindingByFolioArgs = {
  folio: Scalars['String']['input'];
};


export type QueryFindingsFilteredArgs = {
  filters?: InputMaybe<FindingFiltersInput>;
  pagination?: InputMaybe<FindingPaginationInput>;
  sort?: InputMaybe<FindingSortInput>;
};


export type QueryMachineArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMachinesByAreaArgs = {
  areaId?: InputMaybe<Scalars['ID']['input']>;
  subAreaId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMachinesByAreaOrSubAreaArgs = {
  areaId?: InputMaybe<Scalars['ID']['input']>;
  subAreaId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMaterialArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMaterialRequestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMaterialRequestByFolioArgs = {
  folio: Scalars['String']['input'];
};


export type QueryMyNotificationsArgs = {
  filters?: InputMaybe<NotificationFiltersInput>;
  pagination?: InputMaybe<NotificationPaginationInput>;
};


export type QueryOvertimeRecordArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOvertimeRecordsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  positionId?: InputMaybe<Scalars['ID']['input']>;
  reasonForPayment?: InputMaybe<ReasonForPayment>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPositionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPreventiveTaskByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPreventiveTasksByMachineIdArgs = {
  machineId: Scalars['ID']['input'];
};


export type QueryPreventiveTasksFilteredArgs = {
  filters?: InputMaybe<PreventiveTaskFiltersInput>;
  pagination?: InputMaybe<PreventiveTaskPaginationInput>;
  sort?: InputMaybe<PreventiveTaskSortInput>;
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryShiftArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySparePartArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySparePartsByMachineArgs = {
  machineId: Scalars['ID']['input'];
};


export type QuerySubAreaArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubAreasByAreaArgs = {
  areaId: Scalars['ID']['input'];
};


export type QueryTechnicianArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTechnicianScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTechnicianSchedulesFilteredArgs = {
  filters: ScheduleFiltersInput;
};


export type QueryTechnicianWeekScheduleArgs = {
  technicianId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWeekScheduleArgs = {
  weekNumber: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryWorkOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkOrderByFolioArgs = {
  folio: Scalars['String']['input'];
};


export type QueryWorkOrdersFilteredArgs = {
  filters?: InputMaybe<WorkOrderFiltersInput>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<WorkOrderSortInput>;
};

/** Razón de pago para horas extra */
export type ReasonForPayment =
  /** Día festivo */
  | 'HOLIDAY'
  /** Tiempo extra */
  | 'OVERTIME'
  /** Descanso laboral */
  | 'WORK_BREAK';

export type RegisterDeviceTokenInput = {
  /** El nombre del dispositivo */
  deviceName?: InputMaybe<Scalars['String']['input']>;
  /** El token de dispositivo */
  fcmToken: Scalars['String']['input'];
  /** La plataforma del dispositivo */
  platform?: DevicePlatform;
};

/** Categoría de la solicitud */
export type RequestCategory =
  /** Equipo */
  | 'EQUIPMENT'
  /** Material con SKU */
  | 'MATERIAL_WITH_SKU'
  /** Material noInventariado */
  | 'NON_INVENTORY_MATERIAL'
  /** Pieza de repuesto noInventariada */
  | 'NON_INVENTORY_SPARE_PART'
  /** Protección personal */
  | 'PPE'
  /** Solicitud de material con SKU */
  | 'REQUEST_SKU_MATERIAL'
  /** Solicitud de pieza de repuesto con SKU */
  | 'REQUEST_SKU_SPARE_PART'
  /** Servicio */
  | 'SERVICE'
  /** Servicio con material */
  | 'SERVICE_WITH_MATERIAL'
  /** Pieza de repuesto con SKU */
  | 'SPARE_PART_WITH_SKU'
  /** Herramientas */
  | 'TOOLS'
  /** Actualización de SKU */
  | 'UPDATE_SKU';

/** Importancia de la solicitud */
export type RequestImportance =
  /** Importante */
  | 'IMPORTANT'
  /** poco importante */
  | 'UNIMPORTANT'
  /** Muy importante */
  | 'VERY_IMPORTANT';

/** Prioridad de la solicitud */
export type RequestPriority =
  /** Programada */
  | 'SCHEDULED'
  /** Urgente */
  | 'URGENT';

export type Role = {
  __typename?: 'Role';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ScheduleFiltersInput = {
  /** Filtrar por motivo de ausencia */
  absenceReasonId?: InputMaybe<Scalars['ID']['input']>;
  /** Solo ausencias */
  onlyAbsences?: InputMaybe<Scalars['Boolean']['input']>;
  /** Solo días de trabajo (excluir ausencias) */
  onlyWorkDays?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filtrar por fecha específica (YYYY-MM-DD) */
  scheduleDate?: InputMaybe<Scalars['String']['input']>;
  /** Filtrar por turno (quién trabaja en turno X) */
  shiftId?: InputMaybe<Scalars['ID']['input']>;
  /** Filtrar por técnico */
  technicianId?: InputMaybe<Scalars['ID']['input']>;
  /** Filtrar por semana del año */
  weekNumber?: InputMaybe<Scalars['Int']['input']>;
  /** Filtrar por año */
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type SchedulerStatus = {
  __typename?: 'SchedulerStatus';
  globalEnabled: Scalars['Boolean']['output'];
  jobs: Array<CronJobStatus>;
};

export type SendMaterialRequestEmailInput = {
  cc?: InputMaybe<Array<Scalars['String']['input']>>;
  materialRequestId: Scalars['ID']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  to: Array<Scalars['String']['input']>;
};

export type Shift = {
  __typename?: 'Shift';
  createdAt: Scalars['DateTime']['output'];
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SortOrder =
  | 'ASC'
  | 'DESC';

export type SparePart = {
  __typename?: 'SparePart';
  brand?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  machine: Machine;
  machineId: Scalars['ID']['output'];
  model?: Maybe<Scalars['String']['output']>;
  partNumber: Scalars['String']['output'];
  supplier?: Maybe<Scalars['String']['output']>;
  unitOfMeasure?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type StartWorkOrderInput = {
  breakdownDescription?: InputMaybe<Scalars['String']['input']>;
  /** Descripción de la avería al iniciar (si aplica) */
  observations?: InputMaybe<Scalars['String']['input']>;
};

/** Estados posibles del historial de materiales de una solicitud de materiales */
export type StatusHistoryMr =
  /** Entregado */
  | 'DELIVERED'
  /** Pendiente de aprobación de cotización */
  | 'PENDING_APPROVAL_QUOTATION'
  /** Pendiente de entrega */
  | 'PENDING_DELIVERY'
  /** Pendiente de pago */
  | 'PENDING_PAYMENT'
  /** Pendiente de orden de compra */
  | 'PENDING_PURCHASE_ORDER'
  /** Pendiente de solicitud de compra */
  | 'PENDING_PURCHASE_REQUEST'
  /** Pendiente de cotización */
  | 'PENDING_QUOTATION'
  /** Pendiente de alta de proveedor */
  | 'PENDING_SUPPLIER_REGISTRATION';

/** Tipo de parada de la orden de trabajo */
export type StopType =
  /** Avería - Requiere campos adicionales de diagnóstico */
  | 'BREAKDOWN'
  /** Otro tipo de actividad */
  | 'OTHER';

export type SubArea = {
  __typename?: 'SubArea';
  area: Area;
  areaId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Recibe notificaciones en tiempo real para el usuario autenticado */
  newNotification: Notification;
};

export type Technician = {
  __typename?: 'Technician';
  address: Scalars['String']['output'];
  allergies: Scalars['String']['output'];
  birthDate: Scalars['DateTime']['output'];
  bloodType: Scalars['String']['output'];
  childrenCount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  deletedAt: Scalars['DateTime']['output'];
  education: Scalars['String']['output'];
  emergencyContactName: Scalars['String']['output'];
  emergencyContactPhone: Scalars['String']['output'];
  emergencyContactRelationship: Scalars['String']['output'];
  hireDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  nss?: Maybe<Scalars['String']['output']>;
  pantsSize: Scalars['String']['output'];
  position: Position;
  rfc?: Maybe<Scalars['String']['output']>;
  shirtSize: Scalars['String']['output'];
  shoeSize: Scalars['String']['output'];
  transportRoute: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy: Scalars['String']['output'];
  user: User;
  vacationPeriod: Scalars['Float']['output'];
};

export type TechnicianBirthdaysEmailResult = {
  __typename?: 'TechnicianBirthdaysEmailResult';
  birthdayCount: Scalars['Int']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  recipientCount: Scalars['Int']['output'];
  sent: Scalars['Boolean']['output'];
};

export type TechnicianMetric = {
  __typename?: 'TechnicianMetric';
  technicianId: Scalars['String']['output'];
  technicianName: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type TechnicianSchedule = {
  __typename?: 'TechnicianSchedule';
  absenceReason?: Maybe<AbsenceReason>;
  absenceReasonId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  scheduleDate: Scalars['String']['output'];
  shift?: Maybe<Shift>;
  shiftId?: Maybe<Scalars['ID']['output']>;
  technician: User;
  technicianId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  weekNumber: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type TimeCount = {
  __typename?: 'TimeCount';
  count: Scalars['Int']['output'];
  period: Scalars['String']['output'];
};

export type UnregisterDeviceTokenInput = {
  /** El token de dispositivo */
  fcmToken: Scalars['String']['input'];
};

export type UpdateAbsenceReasonInput = {
  /** Máximo permitido por semana (NULL = Sin límite) */
  maxPerWeek?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateActivityInput = {
  activity?: InputMaybe<Scalars['String']['input']>;
  areaId?: InputMaybe<Scalars['ID']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  priority?: InputMaybe<Scalars['Boolean']['input']>;
  progress?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ActivityStatus>;
  /** IDs de técnicos (reemplaza todos los existentes) */
  technicianIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UpdateAreaInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<AreaType>;
};

export type UpdateDepartmentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFindingInput = {
  areaId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  photoPath?: InputMaybe<Scalars['String']['input']>;
  shiftId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateMachineInput = {
  /** ID del área (si la máquina pertenece directamente al área) */
  areaId?: InputMaybe<Scalars['ID']['input']>;
  brand?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  installationDate?: InputMaybe<Scalars['DateTime']['input']>;
  machinePhotoUrl?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  operationalManualUrl?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  /** ID de la sub-área (si la máquina pertenece a una sub-área) */
  subAreaId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateMaterialInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  partNumber?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  unitOfMeasure?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMaterialRequestHistoryInput = {
  deliveryMerchandise?: InputMaybe<Scalars['String']['input']>;
  materialRequestId: Scalars['ID']['input'];
  purchaseOrder?: InputMaybe<Scalars['String']['input']>;
  purchaseRequest?: InputMaybe<Scalars['String']['input']>;
  status: StatusHistoryMr;
  supplier?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMaterialRequestInput = {
  boss?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  customMachineBrand?: InputMaybe<Scalars['String']['input']>;
  customMachineManufacturer?: InputMaybe<Scalars['String']['input']>;
  customMachineModel?: InputMaybe<Scalars['String']['input']>;
  customMachineName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  importance?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<CreateMaterialRequestItemInput>>;
  justification?: InputMaybe<Scalars['String']['input']>;
  machineIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  priority?: InputMaybe<Scalars['String']['input']>;
  requesterId?: InputMaybe<Scalars['ID']['input']>;
  suggestedSupplier?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNotificationPreferenceInput = {
  /** Habilitar email para este tipo */
  emailEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Tipo de notificación */
  notificationType: NotificationType;
  /** Habilitar push para este tipo */
  pushEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Fin de horario silencioso (HH:mm) */
  quietHoursEnd?: InputMaybe<Scalars['String']['input']>;
  /** Inicio de horario silencioso (HH:mm) */
  quietHoursStart?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOvertimeInput = {
  activity?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  reasonForPayment?: InputMaybe<ReasonForPayment>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  workDate?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePositionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePreventiveTaskInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<PreventiveTaskStatus>;
};

export type UpdateRoleInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateScheduleInput = {
  /** ID del motivo de ausencia */
  absenceReasonId?: InputMaybe<Scalars['ID']['input']>;
  /** Notas adicionales */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** ID del turno (null si ausencia) */
  shiftId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateShiftInput = {
  endTime?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSparePartInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  partNumber?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  unitOfMeasure?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSubAreaInput = {
  areaId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTechnicianInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  allergies?: InputMaybe<Scalars['String']['input']>;
  birthDate?: InputMaybe<Scalars['DateTime']['input']>;
  bloodType?: InputMaybe<Scalars['String']['input']>;
  childrenCount?: InputMaybe<Scalars['Float']['input']>;
  education?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  emergencyContactRelationship?: InputMaybe<Scalars['String']['input']>;
  hireDate?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['ID']['input'];
  /** Si el técnico tiene rol de jefe */
  isBoss?: InputMaybe<Scalars['Boolean']['input']>;
  nss?: InputMaybe<Scalars['String']['input']>;
  pantsSize?: InputMaybe<Scalars['String']['input']>;
  positionId?: InputMaybe<Scalars['String']['input']>;
  rfc?: InputMaybe<Scalars['String']['input']>;
  shirtSize?: InputMaybe<Scalars['String']['input']>;
  shoeSize?: InputMaybe<Scalars['String']['input']>;
  transportRoute?: InputMaybe<Scalars['String']['input']>;
  vacationPeriod?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateUserInput = {
  departmentId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  employeeNumber?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Usar roleIds */
  roleId?: InputMaybe<Scalars['String']['input']>;
  roleIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateWorkOrderInput = {
  assignedShiftId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  /** Máquina asociada (requerida si stopType = BREAKDOWN o la OT tiene sub-área) */
  machineId?: InputMaybe<Scalars['ID']['input']>;
  maintenanceType?: InputMaybe<MaintenanceType>;
  observations?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<WorkOrderPriority>;
  scheduledDate?: InputMaybe<Scalars['String']['input']>;
  stopType?: InputMaybe<StopType>;
  workType?: InputMaybe<WorkType>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  department: Department;
  departmentId: Scalars['ID']['output'];
  email?: Maybe<Scalars['String']['output']>;
  employeeNumber: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  /** Rol primario (primer rol) */
  role?: Maybe<Role>;
  /** ID del rol primario (primer rol) */
  roleId?: Maybe<Scalars['ID']['output']>;
  roleIds: Array<Scalars['String']['output']>;
  roles: Array<Role>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserDeviceToken = {
  __typename?: 'UserDeviceToken';
  createdAt: Scalars['DateTime']['output'];
  deviceName?: Maybe<Scalars['String']['output']>;
  fcmToken: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isExpired: Scalars['Boolean']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  platform: DevicePlatform;
  userId: Scalars['ID']['output'];
};

export type WeekScheduleSummary = {
  __typename?: 'WeekScheduleSummary';
  schedules: Array<TechnicianSchedule>;
  totalAbsences: Scalars['Int']['output'];
  totalAssignments: Scalars['Int']['output'];
  totalWorkDays: Scalars['Int']['output'];
  weekNumber: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type WorkOrder = {
  __typename?: 'WorkOrder';
  actionTaken?: Maybe<Scalars['String']['output']>;
  area: Area;
  areaId: Scalars['ID']['output'];
  assignedShift?: Maybe<Shift>;
  assignedShiftId?: Maybe<Scalars['ID']['output']>;
  breakdownDescription?: Maybe<Scalars['String']['output']>;
  cause?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customMaterial?: Maybe<Scalars['String']['output']>;
  customSparePart?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  downtimeMinutes?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  findingId?: Maybe<Scalars['ID']['output']>;
  folio: Scalars['String']['output'];
  functionalTimeMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isFullySigned: Scalars['Boolean']['output'];
  lastResumedAt?: Maybe<Scalars['DateTime']['output']>;
  machine?: Maybe<Machine>;
  machineId?: Maybe<Scalars['ID']['output']>;
  maintenanceType?: Maybe<MaintenanceType>;
  materials: Array<WorkOrderMaterial>;
  observations?: Maybe<Scalars['String']['output']>;
  pauseReason?: Maybe<Scalars['String']['output']>;
  photos: Array<WorkOrderPhoto>;
  photosAfterStart: Array<WorkOrderPhoto>;
  photosBeforeStart: Array<WorkOrderPhoto>;
  preventiveTaskId?: Maybe<Scalars['ID']['output']>;
  priority?: Maybe<WorkOrderPriority>;
  requester: User;
  requesterId: Scalars['ID']['output'];
  scheduledDate?: Maybe<Scalars['DateTime']['output']>;
  sequence: Scalars['Int']['output'];
  signatures: Array<WorkOrderSignature>;
  signaturesCount: Scalars['Int']['output'];
  spareParts: Array<WorkOrderSparePart>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  status: WorkOrderStatus;
  stopType?: Maybe<StopType>;
  subArea?: Maybe<SubArea>;
  subAreaId?: Maybe<Scalars['ID']['output']>;
  technician: User;
  technicians: Array<WorkOrderTechnician>;
  toolsUsed?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  workType?: Maybe<WorkType>;
};

export type WorkOrderFiltersInput = {
  areaId?: InputMaybe<Scalars['ID']['input']>;
  assignedShiftId?: InputMaybe<Scalars['ID']['input']>;
  /** Fecha de creación desde (ISO) */
  createdFrom?: InputMaybe<Scalars['String']['input']>;
  /** Fecha de creación hasta (ISO) */
  createdTo?: InputMaybe<Scalars['String']['input']>;
  maintenanceType?: InputMaybe<MaintenanceType>;
  priority?: InputMaybe<WorkOrderPriority>;
  requesterId?: InputMaybe<Scalars['ID']['input']>;
  /** Fecha programada desde (ISO) */
  scheduledFrom?: InputMaybe<Scalars['String']['input']>;
  /** Fecha programada hasta (ISO) */
  scheduledTo?: InputMaybe<Scalars['String']['input']>;
  /** Búsqueda por folio o descripción */
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<WorkOrderStatus>;
  statuses?: InputMaybe<Array<WorkOrderStatus>>;
  technicianId?: InputMaybe<Scalars['ID']['input']>;
  workType?: InputMaybe<WorkType>;
};

export type WorkOrderMaterial = {
  __typename?: 'WorkOrderMaterial';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  material: Material;
  materialId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  workOrderId: Scalars['ID']['output'];
};

export type WorkOrderPaginatedResponse = {
  __typename?: 'WorkOrderPaginatedResponse';
  data: Array<WorkOrder>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type WorkOrderPhoto = {
  __typename?: 'WorkOrderPhoto';
  createdAt: Scalars['DateTime']['output'];
  fileName: Scalars['String']['output'];
  filePath: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  mimeType: Scalars['String']['output'];
  photoType: PhotoType;
  uploadedAt: Scalars['DateTime']['output'];
  uploadedBy: Scalars['ID']['output'];
  uploader: User;
  workOrderId: Scalars['ID']['output'];
};

/** Niveles de prioridad de una orden de trabajo */
export type WorkOrderPriority =
  /** Prioridad crítica (4) */
  | 'CRITICAL'
  /** Prioridad alta (3) */
  | 'HIGH'
  /** Prioridad baja (1) */
  | 'LOW'
  /** Prioridad media (2) */
  | 'MEDIUM';

export type WorkOrderSignature = {
  __typename?: 'WorkOrderSignature';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  signatureImagePath: Scalars['String']['output'];
  signedAt: Scalars['DateTime']['output'];
  signer: User;
  signerId: Scalars['ID']['output'];
  workOrderId: Scalars['ID']['output'];
};

export type WorkOrderSortField =
  | 'CREATED_AT'
  | 'FOLIO'
  | 'PRIORITY'
  | 'SCHEDULED_DATE'
  | 'STATUS'
  | 'UPDATED_AT';

export type WorkOrderSortInput = {
  field?: WorkOrderSortField;
  order?: SortOrder;
};

export type WorkOrderSparePart = {
  __typename?: 'WorkOrderSparePart';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Int']['output'];
  sparePart: SparePart;
  sparePartId: Scalars['ID']['output'];
  workOrderId: Scalars['ID']['output'];
};

export type WorkOrderStats = {
  __typename?: 'WorkOrderStats';
  count: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

/** Estados posibles de una orden de trabajo */
export type WorkOrderStatus =
  /** Completada - Trabajo finalizado */
  | 'COMPLETED'
  /** En progreso - Técnico trabajando en la WO */
  | 'IN_PROGRESS'
  /** Pausada - En espera de material u otra razón */
  | 'PAUSED'
  /** Pendiente - OT creada, esperando asignación o inicio */
  | 'PENDING'
  /** Reparación temporal - Solución provisional aplicada */
  | 'TEMPORARY_REPAIR';

export type WorkOrderTechnician = {
  __typename?: 'WorkOrderTechnician';
  assignedAt: Scalars['DateTime']['output'];
  assignedBy: Scalars['ID']['output'];
  assigner: User;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isLead: Scalars['Boolean']['output'];
  technician: User;
  technicianId: Scalars['ID']['output'];
  workOrderId: Scalars['ID']['output'];
};

/** Tipos de trabajo para órdenes de trabajo */
export type WorkType =
  /** Automatización */
  | 'AUTOMATION'
  /** Edificio */
  | 'BUILDING'
  /** Eléctrico */
  | 'ELECTRICAL'
  /** Control eléctrico */
  | 'ELECTRICAL_CONTROL'
  /** Electrónico */
  | 'ELECTRONIC'
  /** Hidráulico */
  | 'HYDRAULIC'
  /** Mecánico */
  | 'MECHANICAL'
  /** Metrología */
  | 'METROLOGY'
  /** Otro */
  | 'OTHER'
  /** Pintura */
  | 'PAINTING'
  /** Neumática */
  | 'PNEUMATIC';

export type ActivityItemFragment = { __typename?: 'Activity', id: string, activity: string, startDate: string, endDate: string, progress: number, status: ActivityStatus, comments?: string | null, priority: boolean, isActive: boolean, createdAt: string, updatedAt: string, areaId: string, machineId: string, area: (
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaBasicFragment': AreaBasicFragment } }
  ), machine: { __typename?: 'Machine', id: string, name: string, code: string }, technicians: Array<{ __typename?: 'ActivityTechnician', id: string, technicianId: string, assignedAt: string, technician: (
      { __typename?: 'User' }
      & { ' $fragmentRefs'?: { 'UserBasicFragment': UserBasicFragment } }
    ) }> } & { ' $fragmentName'?: 'ActivityItemFragment' };

export type GetActivitiesFilteredQueryVariables = Exact<{
  filters?: InputMaybe<ActivityFiltersInput>;
  pagination?: InputMaybe<ActivityPaginationInput>;
  sort?: InputMaybe<ActivitySortInput>;
}>;


export type GetActivitiesFilteredQuery = { __typename?: 'Query', activitiesFiltered: { __typename?: 'ActivityPaginatedResponse', total: number, page: number, limit: number, totalPages: number, data: Array<(
      { __typename?: 'Activity' }
      & { ' $fragmentRefs'?: { 'ActivityItemFragment': ActivityItemFragment } }
    )> } };

export type GetActivityByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetActivityByIdQuery = { __typename?: 'Query', activity?: (
    { __typename?: 'Activity', workOrders: Array<{ __typename?: 'ActivityWorkOrder', id: string, workOrderId: string, createdAt: string, workOrder: { __typename?: 'WorkOrder', id: string, folio: string, description: string, status: WorkOrderStatus, createdAt: string, area: { __typename?: 'Area', id: string, name: string } } }>, materialRequests: Array<{ __typename?: 'ActivityMaterialRequest', id: string, materialRequestId: string, createdAt: string, materialRequest: { __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, importance: RequestImportance, priority: RequestPriority, createdAt: string } }> }
    & { ' $fragmentRefs'?: { 'ActivityItemFragment': ActivityItemFragment } }
  ) | null };

export type GetActivityWorkOrdersQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetActivityWorkOrdersQuery = { __typename?: 'Query', activity?: { __typename?: 'Activity', id: string, activity: string, area: { __typename?: 'Area', id: string, name: string }, machine: { __typename?: 'Machine', id: string, name: string }, workOrders: Array<{ __typename?: 'ActivityWorkOrder', id: string, workOrderId: string, createdAt: string, workOrder: { __typename?: 'WorkOrder', id: string, folio: string, description: string, status: WorkOrderStatus, createdAt: string, area: { __typename?: 'Area', id: string, name: string } } }> } | null };

export type GetActivityMaterialRequestsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetActivityMaterialRequestsQuery = { __typename?: 'Query', activity?: { __typename?: 'Activity', id: string, activity: string, area: { __typename?: 'Area', id: string, name: string }, machine: { __typename?: 'Machine', id: string, name: string }, materialRequests: Array<{ __typename?: 'ActivityMaterialRequest', id: string, materialRequestId: string, createdAt: string, materialRequest: { __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, importance: RequestImportance, priority: RequestPriority, createdAt: string } }> } | null };

export type ExportActivitiesExcelQueryVariables = Exact<{
  filters?: InputMaybe<ActivityFiltersInput>;
  sort?: InputMaybe<ActivitySortInput>;
}>;


export type ExportActivitiesExcelQuery = { __typename?: 'Query', exportActivitiesExcel: string };

export type CreateActivityMutationVariables = Exact<{
  input: CreateActivityInput;
}>;


export type CreateActivityMutation = { __typename?: 'Mutation', createActivity: (
    { __typename?: 'Activity' }
    & { ' $fragmentRefs'?: { 'ActivityItemFragment': ActivityItemFragment } }
  ) };

export type UpdateActivityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateActivityInput;
}>;


export type UpdateActivityMutation = { __typename?: 'Mutation', updateActivity: (
    { __typename?: 'Activity' }
    & { ' $fragmentRefs'?: { 'ActivityItemFragment': ActivityItemFragment } }
  ) };

export type DeleteActivityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteActivityMutation = { __typename?: 'Mutation', deleteActivity: boolean };

export type UpdateActivityPriorityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  priority: Scalars['Boolean']['input'];
}>;


export type UpdateActivityPriorityMutation = { __typename?: 'Mutation', updateActivityPriority: { __typename?: 'Activity', id: string, priority: boolean } };

export type AddActivityWorkOrderMutationVariables = Exact<{
  input: AddActivityWorkOrderByFolioInput;
}>;


export type AddActivityWorkOrderMutation = { __typename?: 'Mutation', addActivityWorkOrder: { __typename?: 'ActivityWorkOrder', id: string, activityId: string, workOrderId: string, createdAt: string, workOrder: { __typename?: 'WorkOrder', id: string, folio: string, description: string, status: WorkOrderStatus, createdAt: string, area: { __typename?: 'Area', id: string, name: string } } } };

export type RemoveActivityWorkOrderMutationVariables = Exact<{
  activityId: Scalars['ID']['input'];
  workOrderId: Scalars['ID']['input'];
}>;


export type RemoveActivityWorkOrderMutation = { __typename?: 'Mutation', removeActivityWorkOrder: boolean };

export type AddActivityMaterialRequestMutationVariables = Exact<{
  input: AddActivityMaterialRequestByFolioInput;
}>;


export type AddActivityMaterialRequestMutation = { __typename?: 'Mutation', addActivityMaterialRequest: { __typename?: 'ActivityMaterialRequest', id: string, activityId: string, materialRequestId: string, createdAt: string, materialRequest: { __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, importance: RequestImportance, priority: RequestPriority, createdAt: string } } };

export type RemoveActivityMaterialRequestMutationVariables = Exact<{
  activityId: Scalars['ID']['input'];
  materialRequestId: Scalars['ID']['input'];
}>;


export type RemoveActivityMaterialRequestMutation = { __typename?: 'Mutation', removeActivityMaterialRequest: boolean };

export type AreaDetailFragment = { __typename?: 'Area', id: string, name: string, type: AreaType, description?: string | null, isActive: boolean, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'AreaDetailFragment' };

export type SubAreaDetailFragment = { __typename?: 'SubArea', id: string, name: string, description?: string | null, isActive: boolean, createdAt: string, updatedAt: string } & { ' $fragmentName'?: 'SubAreaDetailFragment' };

export type GetAreasQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAreasQuery = { __typename?: 'Query', areas: Array<(
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaBasicFragment': AreaBasicFragment } }
  )> };

export type GetAreasWithDeletedQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAreasWithDeletedQuery = { __typename?: 'Query', areasWithDeleted: Array<(
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaDetailFragment': AreaDetailFragment } }
  )> };

export type GetAreaQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetAreaQuery = { __typename?: 'Query', area?: (
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaDetailFragment': AreaDetailFragment } }
  ) | null };

export type GetSubAreasByAreaQueryVariables = Exact<{
  areaId: Scalars['ID']['input'];
}>;


export type GetSubAreasByAreaQuery = { __typename?: 'Query', subAreasByArea: Array<(
    { __typename?: 'SubArea' }
    & { ' $fragmentRefs'?: { 'SubAreaBasicFragment': SubAreaBasicFragment } }
  )> };

export type GetWorkOrdersByAreaQueryVariables = Exact<{
  areaId: Scalars['ID']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetWorkOrdersByAreaQuery = { __typename?: 'Query', workOrdersFiltered: { __typename?: 'WorkOrderPaginatedResponse', total: number, page: number, limit: number, totalPages: number, data: Array<{ __typename?: 'WorkOrder', id: string, folio: string, description: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, createdAt: string, subArea?: { __typename?: 'SubArea', id: string, name: string } | null, machine?: { __typename?: 'Machine', id: string, name: string, code: string } | null, requester: { __typename?: 'User', id: string, fullName: string }, technicians: Array<{ __typename?: 'WorkOrderTechnician', isLead: boolean, technician: { __typename?: 'User', id: string, fullName: string } }> }> } };

export type GetFindingsByAreaQueryVariables = Exact<{
  areaId: Scalars['ID']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<FindingStatus>;
  createdFrom?: InputMaybe<Scalars['String']['input']>;
  createdTo?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetFindingsByAreaQuery = { __typename?: 'Query', findingsFiltered: { __typename?: 'FindingPaginatedResponse', total: number, page: number, limit: number, totalPages: number, data: Array<{ __typename?: 'Finding', id: string, folio: string, description: string, photoPath?: string | null, status: FindingStatus, createdAt: string, machine?: { __typename?: 'Machine', id: string, name: string, code: string } | null, shift: { __typename?: 'Shift', id: string, name: string }, convertedToWo?: { __typename?: 'WorkOrder', id: string, folio: string } | null }> } };

export type CreateAreaMutationVariables = Exact<{
  input: CreateAreaInput;
}>;


export type CreateAreaMutation = { __typename?: 'Mutation', createArea: (
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaDetailFragment': AreaDetailFragment } }
  ) };

export type UpdateAreaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateAreaInput;
}>;


export type UpdateAreaMutation = { __typename?: 'Mutation', updateArea: (
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaDetailFragment': AreaDetailFragment } }
  ) };

export type DeactivateAreaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateAreaMutation = { __typename?: 'Mutation', deactivateArea: boolean };

export type ActivateAreaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateAreaMutation = { __typename?: 'Mutation', activateArea: (
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaDetailFragment': AreaDetailFragment } }
  ) };

export type CreateSubAreaMutationVariables = Exact<{
  input: CreateSubAreaInput;
}>;


export type CreateSubAreaMutation = { __typename?: 'Mutation', createSubArea: (
    { __typename?: 'SubArea' }
    & { ' $fragmentRefs'?: { 'SubAreaDetailFragment': SubAreaDetailFragment } }
  ) };

export type UpdateSubAreaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSubAreaInput;
}>;


export type UpdateSubAreaMutation = { __typename?: 'Mutation', updateSubArea: (
    { __typename?: 'SubArea' }
    & { ' $fragmentRefs'?: { 'SubAreaDetailFragment': SubAreaDetailFragment } }
  ) };

export type DeactivateSubAreaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateSubAreaMutation = { __typename?: 'Mutation', deactivateSubArea: boolean };

export type LoginMutationVariables = Exact<{
  employeeNumber: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', accessToken: string, user: (
      { __typename?: 'User' }
      & { ' $fragmentRefs'?: { 'UserBasicFragment': UserBasicFragment } }
    ) } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserBasicFragment': UserBasicFragment } }
  ) };

export type RefreshAuthMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshAuthMutation = { __typename?: 'Mutation', refreshAuth: boolean };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type GetShiftsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShiftsQuery = { __typename?: 'Query', shiftsActive: Array<{ __typename?: 'Shift', id: string, name: string, startTime: string, endTime: string, isActive: boolean }> };

export type GetMaterialsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMaterialsQuery = { __typename?: 'Query', materialsWithDeleted: Array<{ __typename?: 'Material', id: string, description: string, brand?: string | null, manufacturer?: string | null, model?: string | null, partNumber?: string | null, sku?: string | null, unitOfMeasure?: string | null, isActive: boolean, createdAt: string }> };

export type CreateMaterialMutationVariables = Exact<{
  input: CreateMaterialInput;
}>;


export type CreateMaterialMutation = { __typename?: 'Mutation', createMaterial: { __typename?: 'Material', id: string, description: string, isActive: boolean } };

export type UpdateMaterialMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMaterialInput;
}>;


export type UpdateMaterialMutation = { __typename?: 'Mutation', updateMaterial: { __typename?: 'Material', id: string, description: string } };

export type ActivateMaterialMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateMaterialMutation = { __typename?: 'Mutation', activateMaterial: { __typename?: 'Material', id: string, isActive: boolean } };

export type DeactivateMaterialMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateMaterialMutation = { __typename?: 'Mutation', deactivateMaterial: boolean };

export type GetSparePartsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSparePartsQuery = { __typename?: 'Query', sparePartsWithDeleted: Array<{ __typename?: 'SparePart', id: string, partNumber: string, brand?: string | null, model?: string | null, supplier?: string | null, unitOfMeasure?: string | null, isActive: boolean, createdAt: string, machine: (
      { __typename?: 'Machine' }
      & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
    ) }> };

export type CreateSparePartMutationVariables = Exact<{
  input: CreateSparePartInput;
}>;


export type CreateSparePartMutation = { __typename?: 'Mutation', createSparePart: { __typename?: 'SparePart', id: string, partNumber: string, isActive: boolean } };

export type UpdateSparePartMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSparePartInput;
}>;


export type UpdateSparePartMutation = { __typename?: 'Mutation', updateSparePart: { __typename?: 'SparePart', id: string, partNumber: string } };

export type ActivateSparePartMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateSparePartMutation = { __typename?: 'Mutation', activateSparePart: { __typename?: 'SparePart', id: string, isActive: boolean } };

export type DeactivateSparePartMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateSparePartMutation = { __typename?: 'Mutation', deactivateSparePart: boolean };

export type GetPositionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPositionsQuery = { __typename?: 'Query', positionsWithDeleted: Array<{ __typename?: 'Position', id: string, name: string, description?: string | null, isActive: boolean, createdAt: string }> };

export type CreatePositionMutationVariables = Exact<{
  input: CreatePositionInput;
}>;


export type CreatePositionMutation = { __typename?: 'Mutation', createPosition: { __typename?: 'Position', id: string, name: string, isActive: boolean } };

export type UpdatePositionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdatePositionInput;
}>;


export type UpdatePositionMutation = { __typename?: 'Mutation', updatePosition: { __typename?: 'Position', id: string, name: string, description?: string | null } };

export type ActivatePositionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivatePositionMutation = { __typename?: 'Mutation', activatePosition: { __typename?: 'Position', id: string, isActive: boolean } };

export type DeactivatePositionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivatePositionMutation = { __typename?: 'Mutation', deactivatePosition: boolean };

export type GetShiftsAllQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShiftsAllQuery = { __typename?: 'Query', shiftsWithDeleted: Array<{ __typename?: 'Shift', id: string, name: string, startTime: string, endTime: string, isActive: boolean, createdAt: string }> };

export type CreateShiftMutationVariables = Exact<{
  input: CreateShiftInput;
}>;


export type CreateShiftMutation = { __typename?: 'Mutation', createShift: { __typename?: 'Shift', id: string, name: string, isActive: boolean } };

export type UpdateShiftMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateShiftInput;
}>;


export type UpdateShiftMutation = { __typename?: 'Mutation', updateShift: { __typename?: 'Shift', id: string, name: string, startTime: string, endTime: string } };

export type ActivateShiftMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateShiftMutation = { __typename?: 'Mutation', activateShift: { __typename?: 'Shift', id: string, isActive: boolean } };

export type DeactivateShiftMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateShiftMutation = { __typename?: 'Mutation', deactivateShift: boolean };

export type GetDepartmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDepartmentsQuery = { __typename?: 'Query', departmentsWithDeleted: Array<{ __typename?: 'Department', id: string, name: string, description?: string | null, isActive: boolean, createdAt: string }> };

export type CreateDepartmentMutationVariables = Exact<{
  input: CreateDepartmentInput;
}>;


export type CreateDepartmentMutation = { __typename?: 'Mutation', createDepartment: { __typename?: 'Department', id: string, name: string, isActive: boolean } };

export type UpdateDepartmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateDepartmentInput;
}>;


export type UpdateDepartmentMutation = { __typename?: 'Mutation', updateDepartment: { __typename?: 'Department', id: string, name: string, description?: string | null } };

export type ActivateDepartmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateDepartmentMutation = { __typename?: 'Mutation', activateDepartment: { __typename?: 'Department', id: string, isActive: boolean } };

export type DeactivateDepartmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateDepartmentMutation = { __typename?: 'Mutation', deactivateDepartment: boolean };

export type GetDashboardDataQueryVariables = Exact<{
  input: DashboardInput;
}>;


export type GetDashboardDataQuery = { __typename?: 'Query', dashboardData: { __typename?: 'DashboardData', generatedAt: string, kpis: { __typename?: 'DashboardKpis', activeBacklog: number, leadTimeHoursAvg: number, mttrHoursAvg: number, preventiveComplianceRate: number }, charts: { __typename?: 'DashboardCharts', downtimeByAreaTop5: Array<{ __typename?: 'AreaMetric', areaId: string, areaName: string, value: number }>, findingsConversion: Array<{ __typename?: 'KeyValue', key: string, value: number }>, findingsByArea: Array<{ __typename?: 'AreaMetric', areaId: string, areaName: string, value: number }>, workOrdersByArea: Array<{ __typename?: 'AreaMetric', areaId: string, areaName: string, value: number }>, maintenanceMixByPeriod: Array<{ __typename?: 'MixPoint', period: string, type: string, count: number }>, throughputByWeek: Array<{ __typename?: 'TimeCount', period: string, count: number }> }, rankings: { __typename?: 'DashboardRankings', topMachinesByDowntime: Array<{ __typename?: 'MachineMetric', machineId?: string | null, machineName: string, value: number }>, topTechniciansByClosures: Array<{ __typename?: 'TechnicianMetric', technicianId: string, technicianName: string, value: number }> } } };

export type FindingBasicFragment = { __typename?: 'Finding', id: string, folio: string, description: string, photoPath?: string | null, status: FindingStatus, createdAt: string, area: (
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaBasicFragment': AreaBasicFragment } }
  ), machine?: (
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  ) | null, shift: { __typename?: 'Shift', id: string, name: string }, convertedToWo?: { __typename?: 'WorkOrder', id: string, folio: string } | null } & { ' $fragmentName'?: 'FindingBasicFragment' };

export type GetFindingsFilteredQueryVariables = Exact<{
  filters?: InputMaybe<FindingFiltersInput>;
  pagination?: InputMaybe<FindingPaginationInput>;
}>;


export type GetFindingsFilteredQuery = { __typename?: 'Query', findingsFiltered: { __typename?: 'FindingPaginatedResponse', total: number, data: Array<(
      { __typename?: 'Finding' }
      & { ' $fragmentRefs'?: { 'FindingBasicFragment': FindingBasicFragment } }
    )> } };

export type CreateFindingMutationVariables = Exact<{
  input: CreateFindingInput;
}>;


export type CreateFindingMutation = { __typename?: 'Mutation', createFinding: { __typename?: 'Finding', id: string, folio: string, status: FindingStatus } };

export type GetFindingByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFindingByIdQuery = { __typename?: 'Query', finding?: (
    { __typename?: 'Finding', machineId?: string | null }
    & { ' $fragmentRefs'?: { 'FindingBasicFragment': FindingBasicFragment } }
  ) | null };

export type UpdateFindingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateFindingInput;
}>;


export type UpdateFindingMutation = { __typename?: 'Mutation', updateFinding: (
    { __typename?: 'Finding' }
    & { ' $fragmentRefs'?: { 'FindingBasicFragment': FindingBasicFragment } }
  ) };

export type ConvertToWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ConvertToWorkOrderMutation = { __typename?: 'Mutation', convertToWorkOrder: { __typename?: 'Finding', id: string, status: FindingStatus, convertedToWo?: { __typename?: 'WorkOrder', id: string, folio: string } | null } };

export type RoleBasicFragment = { __typename?: 'Role', id: string, name: string } & { ' $fragmentName'?: 'RoleBasicFragment' };

export type UserBasicFragment = { __typename?: 'User', id: string, employeeNumber: string, firstName: string, lastName: string, fullName: string, email?: string | null, isActive: boolean, roleIds: Array<string>, role?: (
    { __typename?: 'Role' }
    & { ' $fragmentRefs'?: { 'RoleBasicFragment': RoleBasicFragment } }
  ) | null, roles: Array<(
    { __typename?: 'Role' }
    & { ' $fragmentRefs'?: { 'RoleBasicFragment': RoleBasicFragment } }
  )> } & { ' $fragmentName'?: 'UserBasicFragment' };

export type AreaBasicFragment = { __typename?: 'Area', id: string, name: string, type: AreaType, description?: string | null, isActive: boolean } & { ' $fragmentName'?: 'AreaBasicFragment' };

export type SubAreaBasicFragment = { __typename?: 'SubArea', id: string, name: string, description?: string | null, isActive: boolean, areaId: string } & { ' $fragmentName'?: 'SubAreaBasicFragment' };

export type MachineBasicFragment = { __typename?: 'Machine', id: string, code: string, name: string, description?: string | null, brand?: string | null, model?: string | null, serialNumber?: string | null, installationDate?: string | null, machinePhotoUrl?: string | null, operationalManualUrl?: string | null, isActive: boolean, subAreaId?: string | null, areaId?: string | null, createdAt: string, updatedAt: string, subArea?: { __typename?: 'SubArea', id: string, name: string, area: { __typename?: 'Area', id: string, name: string, type: AreaType } } | null, area?: { __typename?: 'Area', id: string, name: string, type: AreaType } | null } & { ' $fragmentName'?: 'MachineBasicFragment' };

export type PositionBasicFragment = { __typename?: 'Position', id: string, name: string, description?: string | null, isActive: boolean } & { ' $fragmentName'?: 'PositionBasicFragment' };

export type TechnicianBasicFragment = { __typename?: 'Technician', id: string, isActive: boolean, user: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserBasicFragment': UserBasicFragment } }
  ), position: (
    { __typename?: 'Position' }
    & { ' $fragmentRefs'?: { 'PositionBasicFragment': PositionBasicFragment } }
  ) } & { ' $fragmentName'?: 'TechnicianBasicFragment' };

export type GetMachinesPageDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMachinesPageDataQuery = { __typename?: 'Query', machinesWithDeleted: Array<(
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  )>, areasActive: Array<{ __typename?: 'Area', id: string, name: string, type: AreaType }>, subAreasActive: Array<{ __typename?: 'SubArea', id: string, name: string }> };

export type GetMachineQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMachineQuery = { __typename?: 'Query', machine?: (
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  ) | null };

export type GetMachineSparePartsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMachineSparePartsQuery = { __typename?: 'Query', sparePartsByMachine: Array<{ __typename?: 'SparePart', id: string, partNumber: string, brand?: string | null, model?: string | null, supplier?: string | null, unitOfMeasure?: string | null, isActive: boolean, createdAt: string }> };

export type GetMachineWorkOrdersQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetMachineWorkOrdersQuery = { __typename?: 'Query', workOrdersFiltered: { __typename?: 'WorkOrderPaginatedResponse', total: number, data: Array<{ __typename?: 'WorkOrder', id: string, folio: string, description: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, startDate?: string | null, endDate?: string | null, createdAt: string }> } };

export type GetMachineMaterialRequestsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMachineMaterialRequestsQuery = { __typename?: 'Query', machine?: { __typename?: 'Machine', id: string, code: string, name: string, materialRequests?: Array<{ __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, priority: RequestPriority, importance: RequestImportance, boss: string, suggestedSupplier?: string | null, comments?: string | null, justification?: string | null, isActive: boolean, createdAt: string, items: Array<{ __typename?: 'MaterialRequestItem', id: string, requestedQuantity?: number | null, unitOfMeasure?: string | null, description?: string | null, brand?: string | null, partNumber?: string | null, material?: { __typename?: 'Material', description: string, partNumber?: string | null, brand?: string | null } | null }> }> | null } | null };

export type CreateMachineMutationVariables = Exact<{
  input: CreateMachineInput;
}>;


export type CreateMachineMutation = { __typename?: 'Mutation', createMachine: (
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  ) };

export type UpdateMachineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMachineInput;
}>;


export type UpdateMachineMutation = { __typename?: 'Mutation', updateMachine: (
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  ) };

export type DeactivateMachineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateMachineMutation = { __typename?: 'Mutation', deactivateMachine: boolean };

export type ActivateMachineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateMachineMutation = { __typename?: 'Mutation', activateMachine: (
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  ) };

export type GetMachinesByAreaQueryVariables = Exact<{
  areaId?: InputMaybe<Scalars['ID']['input']>;
  subAreaId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetMachinesByAreaQuery = { __typename?: 'Query', machinesByArea: Array<(
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  )> };

export type GetMaterialRequestFormDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMaterialRequestFormDataQuery = { __typename?: 'Query', techniciansActive: Array<{ __typename?: 'Technician', id: string, user: { __typename?: 'User', id: string, fullName: string, employeeNumber: string }, position: { __typename?: 'Position', id: string, name: string } }>, usersWithDeleted: Array<{ __typename?: 'User', id: string, fullName: string, employeeNumber: string, isActive: boolean, roles: Array<{ __typename?: 'Role', id: string, name: string }> }>, machinesActive: Array<{ __typename?: 'Machine', id: string, name: string, brand?: string | null, model?: string | null, manufacturer?: string | null, areaId?: string | null, subAreaId?: string | null, area?: { __typename?: 'Area', id: string, name: string } | null, subArea?: { __typename?: 'SubArea', id: string, name: string, area: { __typename?: 'Area', id: string, name: string } } | null }>, materialsActive: Array<{ __typename?: 'Material', id: string, description: string, brand?: string | null, model?: string | null, partNumber?: string | null, sku?: string | null, unitOfMeasure?: string | null }>, sparePartsActive: Array<{ __typename?: 'SparePart', id: string, partNumber: string, brand?: string | null, model?: string | null, unitOfMeasure?: string | null, machineId: string }> };

export type GetMaterialRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMaterialRequestsQuery = { __typename?: 'Query', materialRequestsWithDeleted: Array<{ __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, priority: RequestPriority, importance: RequestImportance, boss: string, suggestedSupplier?: string | null, isActive: boolean, emailSentAt?: string | null, createdAt: string, requester: { __typename?: 'User', id: string, fullName: string, employeeNumber: string }, machines: Array<{ __typename?: 'MaterialRequestMachine', id: string, machineId: string, machine: { __typename?: 'Machine', id: string, name: string, brand?: string | null, model?: string | null, manufacturer?: string | null, areaId?: string | null, subAreaId?: string | null, area?: { __typename?: 'Area', id: string, name: string } | null, subArea?: { __typename?: 'SubArea', id: string, name: string, area: { __typename?: 'Area', id: string, name: string } } | null } }>, items: Array<{ __typename?: 'MaterialRequestItem', id: string, requestedQuantity?: number | null, unitOfMeasure?: string | null, description?: string | null, customName?: string | null, brand?: string | null, partNumber?: string | null, isGenericAllowed: boolean }> }> };

export type GetMaterialRequestQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetMaterialRequestQuery = { __typename?: 'Query', materialRequest?: { __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, priority: RequestPriority, importance: RequestImportance, boss: string, description?: string | null, customMachineBrand?: string | null, customMachineModel?: string | null, customMachineManufacturer?: string | null, suggestedSupplier?: string | null, justification?: string | null, comments?: string | null, isActive: boolean, emailSentAt?: string | null, createdAt: string, updatedAt: string, requester: { __typename?: 'User', id: string, fullName: string, employeeNumber: string }, machines: Array<{ __typename?: 'MaterialRequestMachine', id: string, machineId: string, machine: { __typename?: 'Machine', id: string, name: string, brand?: string | null, model?: string | null, manufacturer?: string | null, areaId?: string | null, subAreaId?: string | null, area?: { __typename?: 'Area', id: string, name: string } | null, subArea?: { __typename?: 'SubArea', id: string, name: string, area: { __typename?: 'Area', id: string, name: string } } | null } }>, items: Array<{ __typename?: 'MaterialRequestItem', id: string, requestedQuantity?: number | null, unitOfMeasure?: string | null, description?: string | null, customName?: string | null, brand?: string | null, model?: string | null, partNumber?: string | null, sku?: string | null, proposedMaxStock?: number | null, proposedMinStock?: number | null, materialId?: string | null, isGenericAllowed: boolean, sparePartId?: string | null, material?: { __typename?: 'Material', id: string, description: string, partNumber?: string | null, brand?: string | null, sku?: string | null, unitOfMeasure?: string | null } | null, sparePart?: { __typename?: 'SparePart', id: string, partNumber: string, brand?: string | null, model?: string | null, unitOfMeasure?: string | null } | null }> } | null };

export type CreateMaterialRequestMutationVariables = Exact<{
  input: CreateMaterialRequestInput;
}>;


export type CreateMaterialRequestMutation = { __typename?: 'Mutation', createMaterialRequest: { __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, priority: RequestPriority, importance: RequestImportance, boss: string, createdAt: string, requester: { __typename?: 'User', id: string, fullName: string }, machines: Array<{ __typename?: 'MaterialRequestMachine', id: string, machineId: string, machine: { __typename?: 'Machine', id: string, name: string } }>, items: Array<{ __typename?: 'MaterialRequestItem', id: string }> } };

export type AddMaterialToRequestMutationVariables = Exact<{
  materialRequestId: Scalars['ID']['input'];
  input: CreateMaterialRequestItemInput;
}>;


export type AddMaterialToRequestMutation = { __typename?: 'Mutation', addMaterialToRequest: { __typename?: 'MaterialRequestItem', id: string, requestedQuantity?: number | null, unitOfMeasure?: string | null, description?: string | null, customName?: string | null, brand?: string | null, model?: string | null, partNumber?: string | null, sku?: string | null, proposedMaxStock?: number | null, proposedMinStock?: number | null, materialId?: string | null, sparePartId?: string | null } };

export type UpdateMaterialRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateMaterialRequestInput;
}>;


export type UpdateMaterialRequestMutation = { __typename?: 'Mutation', updateMaterialRequest: { __typename?: 'MaterialRequest', id: string, folio: string } };

export type DeactivateMaterialRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateMaterialRequestMutation = { __typename?: 'Mutation', deactivateMaterialRequest: boolean };

export type SendMaterialRequestEmailMutationVariables = Exact<{
  input: SendMaterialRequestEmailInput;
}>;


export type SendMaterialRequestEmailMutation = { __typename?: 'Mutation', sendMaterialRequestEmail: boolean };

export type GetMaterialRequestHistoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMaterialRequestHistoriesQuery = { __typename?: 'Query', materialRequestsWithDeleted: Array<{ __typename?: 'MaterialRequest', id: string, folio: string, category: RequestCategory, priority: RequestPriority, importance: RequestImportance, justification?: string | null, description?: string | null, emailSentAt?: string | null, isActive: boolean, createdAt: string, requester: { __typename?: 'User', id: string, fullName: string }, machines: Array<{ __typename?: 'MaterialRequestMachine', id: string, machineId: string, machine: { __typename?: 'Machine', id: string, name: string, areaId?: string | null, subAreaId?: string | null, area?: { __typename?: 'Area', id: string, name: string } | null, subArea?: { __typename?: 'SubArea', id: string, name: string, area: { __typename?: 'Area', id: string, name: string } } | null } }>, items: Array<{ __typename?: 'MaterialRequestItem', id: string, sku?: string | null, description?: string | null, customName?: string | null, requestedQuantity?: number | null, unitOfMeasure?: string | null, isGenericAllowed: boolean }>, histories?: Array<{ __typename?: 'MaterialRequestHistory', id: string, status: StatusHistoryMr, purchaseRequest?: string | null, purchaseOrder?: string | null, deliveryMerchandise?: string | null, deliveryDate?: string | null, progressPercentage?: number | null, supplier?: string | null }> | null }> };

export type UpdateMaterialRequestHistoryMutationVariables = Exact<{
  input: UpdateMaterialRequestHistoryInput;
}>;


export type UpdateMaterialRequestHistoryMutation = { __typename?: 'Mutation', updateMaterialRequestHistory: { __typename?: 'MaterialRequest', id: string, histories?: Array<{ __typename?: 'MaterialRequestHistory', id: string, status: StatusHistoryMr, purchaseRequest?: string | null, purchaseOrder?: string | null, deliveryMerchandise?: string | null, deliveryDate?: string | null, progressPercentage?: number | null, supplier?: string | null }> | null } };

export type NotificationItemFragment = { __typename?: 'Notification', id: string, title: string, body: string, type: NotificationType, readAt?: string | null, createdAt: string, data?: string | null } & { ' $fragmentName'?: 'NotificationItemFragment' };

export type MyNotificationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type MyNotificationsQuery = { __typename?: 'Query', myNotifications: { __typename?: 'NotificationPaginatedResponse', unreadCount: number, total: number, totalPages: number, data: Array<(
      { __typename?: 'Notification' }
      & { ' $fragmentRefs'?: { 'NotificationItemFragment': NotificationItemFragment } }
    )> } };

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationAsReadMutation = { __typename?: 'Mutation', markNotificationAsRead: { __typename?: 'Notification', id: string, readAt?: string | null } };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { __typename?: 'Mutation', markAllNotificationsAsRead: number };

export type RegisterDeviceTokenMutationVariables = Exact<{
  input: RegisterDeviceTokenInput;
}>;


export type RegisterDeviceTokenMutation = { __typename?: 'Mutation', registerDeviceToken: { __typename?: 'UserDeviceToken', id: string, fcmToken: string, platform: DevicePlatform, deviceName?: string | null } };

export type UnregisterDeviceTokenMutationVariables = Exact<{
  input: UnregisterDeviceTokenInput;
}>;


export type UnregisterDeviceTokenMutation = { __typename?: 'Mutation', unregisterDeviceToken: boolean };

export type MyNotificationPreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyNotificationPreferencesQuery = { __typename?: 'Query', myNotificationPreferences: Array<{ __typename?: 'NotificationPreference', id?: string | null, userId: string, notificationType: NotificationType, pushEnabled: boolean, emailEnabled: boolean, inAppEnabled: boolean, quietHoursStart?: string | null, quietHoursEnd?: string | null }> };

export type UpdateNotificationPreferenceMutationVariables = Exact<{
  input: UpdateNotificationPreferenceInput;
}>;


export type UpdateNotificationPreferenceMutation = { __typename?: 'Mutation', updateNotificationPreference: { __typename?: 'NotificationPreference', id?: string | null, userId: string, notificationType: NotificationType, pushEnabled: boolean, emailEnabled: boolean, inAppEnabled: boolean, quietHoursStart?: string | null, quietHoursEnd?: string | null } };

export type GetOvertimeRecordsQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  positionId?: InputMaybe<Scalars['ID']['input']>;
  reasonForPayment?: InputMaybe<ReasonForPayment>;
}>;


export type GetOvertimeRecordsQuery = { __typename?: 'Query', overtimeRecords: Array<{ __typename?: 'Overtime', id: string, workDate: string, startTime: string, endTime: string, workTime: string, activity: string, reasonForPayment?: ReasonForPayment | null, technicianId: string, createdAt: string, technician: { __typename?: 'Technician', id: string, user: { __typename?: 'User', id: string, employeeNumber: string, firstName: string, lastName: string }, position: { __typename?: 'Position', id: string, name: string } } }> };

export type GetMyOvertimeRecordsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyOvertimeRecordsQuery = { __typename?: 'Query', myOvertimeRecords: Array<{ __typename?: 'Overtime', id: string, workDate: string, startTime: string, endTime: string, workTime: string, activity: string, reasonForPayment?: ReasonForPayment | null, technicianId: string, createdAt: string, technician: { __typename?: 'Technician', id: string, user: { __typename?: 'User', id: string, employeeNumber: string, firstName: string, lastName: string }, position: { __typename?: 'Position', id: string, name: string } } }> };

export type GetOvertimeRecordQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOvertimeRecordQuery = { __typename?: 'Query', overtimeRecord?: { __typename?: 'Overtime', id: string, workDate: string, startTime: string, endTime: string, workTime: string, activity: string, reasonForPayment?: ReasonForPayment | null, technicianId: string, createdAt: string, technician: { __typename?: 'Technician', id: string, user: { __typename?: 'User', id: string, employeeNumber: string, firstName: string, lastName: string }, position: { __typename?: 'Position', id: string, name: string } } } | null };

export type CreateOvertimeMutationVariables = Exact<{
  input: CreateOvertimeInput;
}>;


export type CreateOvertimeMutation = { __typename?: 'Mutation', createOvertime: { __typename?: 'Overtime', id: string, workDate: string, startTime: string, endTime: string, workTime: string, activity: string, reasonForPayment?: ReasonForPayment | null, technicianId: string } };

export type UpdateOvertimeMutationVariables = Exact<{
  input: UpdateOvertimeInput;
}>;


export type UpdateOvertimeMutation = { __typename?: 'Mutation', updateOvertime: { __typename?: 'Overtime', id: string, workDate: string, startTime: string, endTime: string, workTime: string, activity: string, reasonForPayment?: ReasonForPayment | null, technicianId: string } };

export type DeleteOvertimeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteOvertimeMutation = { __typename?: 'Mutation', deleteOvertime: boolean };

export type GetActiveTechniciansForOvertimeQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveTechniciansForOvertimeQuery = { __typename?: 'Query', techniciansActive: Array<{ __typename?: 'Technician', id: string, user: { __typename?: 'User', id: string, employeeNumber: string, firstName: string, lastName: string }, position: { __typename?: 'Position', id: string, name: string } }> };

export type GetOvertimePositionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOvertimePositionsQuery = { __typename?: 'Query', positions: Array<{ __typename?: 'Position', id: string, name: string, isActive: boolean }> };

export type ScheduleItemFragment = { __typename?: 'TechnicianSchedule', id: string, technicianId: string, shiftId?: string | null, absenceReasonId?: string | null, scheduleDate: string, weekNumber: number, year: number, notes?: string | null, isActive: boolean, shift?: { __typename?: 'Shift', id: string, name: string, startTime: string, endTime: string } | null, absenceReason?: { __typename?: 'AbsenceReason', id: string, name: string, isActive: boolean, maxPerWeek?: number | null } | null, technician: { __typename?: 'User', id: string, fullName: string } } & { ' $fragmentName'?: 'ScheduleItemFragment' };

export type GetWeekScheduleQueryVariables = Exact<{
  weekNumber: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type GetWeekScheduleQuery = { __typename?: 'Query', weekSchedule: { __typename?: 'WeekScheduleSummary', weekNumber: number, year: number, totalAssignments: number, totalAbsences: number, totalWorkDays: number, schedules: Array<(
      { __typename?: 'TechnicianSchedule' }
      & { ' $fragmentRefs'?: { 'ScheduleItemFragment': ScheduleItemFragment } }
    )> } };

export type GetScheduleTechniciansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetScheduleTechniciansQuery = { __typename?: 'Query', techniciansWithDeleted: Array<{ __typename?: 'Technician', id: string, isActive: boolean, user: { __typename?: 'User', id: string, fullName: string, employeeNumber: string }, position: { __typename?: 'Position', name: string } }> };

export type GetAbsenceReasonsActiveQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAbsenceReasonsActiveQuery = { __typename?: 'Query', absenceReasonsActive: Array<{ __typename?: 'AbsenceReason', id: string, name: string, isActive: boolean, maxPerWeek?: number | null }> };

export type AssignWeekScheduleMutationVariables = Exact<{
  input: AssignWeekScheduleInput;
}>;


export type AssignWeekScheduleMutation = { __typename?: 'Mutation', assignWeekSchedule: Array<(
    { __typename?: 'TechnicianSchedule' }
    & { ' $fragmentRefs'?: { 'ScheduleItemFragment': ScheduleItemFragment } }
  )> };

export type CreateTechnicianScheduleMutationVariables = Exact<{
  input: CreateScheduleInput;
}>;


export type CreateTechnicianScheduleMutation = { __typename?: 'Mutation', createTechnicianSchedule: (
    { __typename?: 'TechnicianSchedule' }
    & { ' $fragmentRefs'?: { 'ScheduleItemFragment': ScheduleItemFragment } }
  ) };

export type UpdateTechnicianScheduleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateScheduleInput;
}>;


export type UpdateTechnicianScheduleMutation = { __typename?: 'Mutation', updateTechnicianSchedule: (
    { __typename?: 'TechnicianSchedule' }
    & { ' $fragmentRefs'?: { 'ScheduleItemFragment': ScheduleItemFragment } }
  ) };

export type DeleteTechnicianScheduleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTechnicianScheduleMutation = { __typename?: 'Mutation', deleteTechnicianSchedule: boolean };

export type CopyWeekSchedulesMutationVariables = Exact<{
  input: CopyWeekSchedulesInput;
}>;


export type CopyWeekSchedulesMutation = { __typename?: 'Mutation', copyWeekSchedules: Array<(
    { __typename?: 'TechnicianSchedule' }
    & { ' $fragmentRefs'?: { 'ScheduleItemFragment': ScheduleItemFragment } }
  )> };

export type GetTechnicianWeekScheduleQueryVariables = Exact<{
  technicianId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
}>;


export type GetTechnicianWeekScheduleQuery = { __typename?: 'Query', technicianWeekSchedule: Array<(
    { __typename?: 'TechnicianSchedule' }
    & { ' $fragmentRefs'?: { 'ScheduleItemFragment': ScheduleItemFragment } }
  )> };

export type GetTechniciansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTechniciansQuery = { __typename?: 'Query', techniciansActive: Array<(
    { __typename?: 'Technician' }
    & { ' $fragmentRefs'?: { 'TechnicianBasicFragment': TechnicianBasicFragment } }
  )> };

export type GetTechniciansDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTechniciansDataQuery = { __typename?: 'Query', techniciansWithDeleted: Array<{ __typename?: 'Technician', id: string, isActive: boolean, address: string, allergies: string, birthDate: string, bloodType: string, childrenCount: number, education: string, emergencyContactName: string, emergencyContactPhone: string, emergencyContactRelationship: string, hireDate: string, nss?: string | null, pantsSize: string, rfc?: string | null, shirtSize: string, shoeSize: string, transportRoute: string, vacationPeriod: number, user: { __typename?: 'User', id: string, firstName: string, lastName: string, fullName: string, employeeNumber: string, email?: string | null, phone?: string | null, departmentId: string, roleIds: Array<string>, roles: Array<{ __typename?: 'Role', id: string, name: string }> }, position: { __typename?: 'Position', id: string, name: string } }>, departmentsWithDeleted: Array<{ __typename?: 'Department', id: string, name: string }>, positionsWithDeleted: Array<{ __typename?: 'Position', id: string, name: string }>, rolesWithDeleted: Array<{ __typename?: 'Role', id: string, name: string }> };

export type GetTechnicianDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTechnicianDetailQuery = { __typename?: 'Query', technician?: { __typename?: 'Technician', id: string, isActive: boolean, address: string, allergies: string, birthDate: string, bloodType: string, childrenCount: number, education: string, emergencyContactName: string, emergencyContactPhone: string, emergencyContactRelationship: string, hireDate: string, nss?: string | null, pantsSize: string, rfc?: string | null, shirtSize: string, shoeSize: string, transportRoute: string, vacationPeriod: number, user: { __typename?: 'User', id: string, fullName: string, employeeNumber: string, email?: string | null, phone?: string | null, department: { __typename?: 'Department', id: string, name: string } }, position: { __typename?: 'Position', id: string, name: string } } | null };

export type CreateTechnicianProfileMutationVariables = Exact<{
  input: CreateTechnicianInput;
}>;


export type CreateTechnicianProfileMutation = { __typename?: 'Mutation', createTechnician: { __typename?: 'Technician', id: string } };

export type UpdateTechnicianProfileMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTechnicianInput;
}>;


export type UpdateTechnicianProfileMutation = { __typename?: 'Mutation', updateTechnician: { __typename?: 'Technician', id: string } };

export type ActivateTechnicianMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateTechnicianMutation = { __typename?: 'Mutation', activateTechnician: { __typename?: 'Technician', id: string, isActive: boolean } };

export type DeactivateTechnicianMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateTechnicianMutation = { __typename?: 'Mutation', deactivateTechnician: boolean };

export type GetRequestersDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRequestersDataQuery = { __typename?: 'Query', usersWithDeleted: Array<{ __typename?: 'User', id: string, employeeNumber: string, firstName: string, lastName: string, fullName: string, email?: string | null, phone?: string | null, isActive: boolean, roleIds: Array<string>, department: { __typename?: 'Department', id: string, name: string }, role?: { __typename?: 'Role', id: string, name: string } | null, roles: Array<{ __typename?: 'Role', id: string, name: string }> }>, departmentsWithDeleted: Array<{ __typename?: 'Department', id: string, name: string }>, rolesWithDeleted: Array<{ __typename?: 'Role', id: string, name: string }> };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, fullName: string } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, fullName: string } };

export type DeactivateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeactivateUserMutation = { __typename?: 'Mutation', deactivateUser: boolean };

export type ActivateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ActivateUserMutation = { __typename?: 'Mutation', activateUser: { __typename?: 'User', id: string, isActive: boolean } };

export type WorkOrderItemFragment = { __typename?: 'WorkOrder', id: string, folio: string, description: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, stopType?: StopType | null, assignedShiftId?: string | null, machineId?: string | null, scheduledDate?: string | null, workType?: WorkType | null, createdAt: string, isFullySigned: boolean, area: (
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaBasicFragment': AreaBasicFragment } }
  ), subArea?: (
    { __typename?: 'SubArea' }
    & { ' $fragmentRefs'?: { 'SubAreaBasicFragment': SubAreaBasicFragment } }
  ) | null, machine?: (
    { __typename?: 'Machine' }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  ) | null, requester: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserBasicFragment': UserBasicFragment } }
  ), technicians: Array<{ __typename?: 'WorkOrderTechnician', isLead: boolean, technician: (
      { __typename?: 'User' }
      & { ' $fragmentRefs'?: { 'UserBasicFragment': UserBasicFragment } }
    ) }> } & { ' $fragmentName'?: 'WorkOrderItemFragment' };

export type MyRequestedWorkOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type MyRequestedWorkOrdersQuery = { __typename?: 'Query', myRequestedWorkOrders: Array<(
    { __typename?: 'WorkOrder' }
    & { ' $fragmentRefs'?: { 'WorkOrderItemFragment': WorkOrderItemFragment } }
  )> };

export type MyAssignedWorkOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAssignedWorkOrdersQuery = { __typename?: 'Query', myAssignedWorkOrders: Array<(
    { __typename?: 'WorkOrder' }
    & { ' $fragmentRefs'?: { 'WorkOrderItemFragment': WorkOrderItemFragment } }
  )> };

export type GetWorkOrdersFilteredQueryVariables = Exact<{
  status?: InputMaybe<WorkOrderStatus>;
  priority?: InputMaybe<WorkOrderPriority>;
  assignedShiftId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetWorkOrdersFilteredQuery = { __typename?: 'Query', workOrdersFiltered: { __typename?: 'WorkOrderPaginatedResponse', total: number, data: Array<(
      { __typename?: 'WorkOrder' }
      & { ' $fragmentRefs'?: { 'WorkOrderItemFragment': WorkOrderItemFragment } }
    )> } };

export type GetScheduledWorkOrdersQueryVariables = Exact<{
  scheduledFrom?: InputMaybe<Scalars['String']['input']>;
  scheduledTo?: InputMaybe<Scalars['String']['input']>;
  assignedShiftId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GetScheduledWorkOrdersQuery = { __typename?: 'Query', workOrdersFiltered: { __typename?: 'WorkOrderPaginatedResponse', total: number, data: Array<(
      { __typename?: 'WorkOrder' }
      & { ' $fragmentRefs'?: { 'WorkOrderItemFragment': WorkOrderItemFragment } }
    )> } };

export type CreateWorkOrderMutationVariables = Exact<{
  input: CreateWorkOrderInput;
}>;


export type CreateWorkOrderMutation = { __typename?: 'Mutation', createWorkOrder: { __typename?: 'WorkOrder', id: string, folio: string, status: WorkOrderStatus } };

export type AssignWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: AssignWorkOrderInput;
}>;


export type AssignWorkOrderMutation = { __typename?: 'Mutation', assignWorkOrder: { __typename?: 'WorkOrder', id: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, stopType?: StopType | null, scheduledDate?: string | null, workType?: WorkType | null } };

export type UploadWorkOrderPhotoMutationVariables = Exact<{
  input: CreateWorkOrderPhotoInput;
}>;


export type UploadWorkOrderPhotoMutation = { __typename?: 'Mutation', uploadWorkOrderPhoto: { __typename?: 'WorkOrderPhoto', id: string, filePath: string } };

export type GetWorkOrderByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWorkOrderByIdQuery = { __typename?: 'Query', workOrder?: (
    { __typename?: 'WorkOrder', cause?: string | null, actionTaken?: string | null, toolsUsed?: string | null, observations?: string | null, functionalTimeMinutes: number, downtimeMinutes?: number | null, breakdownDescription?: string | null, startDate?: string | null, endDate?: string | null, pauseReason?: string | null, customSparePart?: string | null, customMaterial?: string | null, signatures: Array<{ __typename?: 'WorkOrderSignature', id: string, signatureImagePath: string, signedAt: string, signer: { __typename?: 'User', id: string, firstName: string, lastName: string, role?: { __typename?: 'Role', name: string } | null, roles: Array<{ __typename?: 'Role', name: string }> } }>, photos: Array<{ __typename?: 'WorkOrderPhoto', id: string, photoType: PhotoType, filePath: string }>, spareParts: Array<{ __typename?: 'WorkOrderSparePart', id: string, quantity: number, sparePart: { __typename?: 'SparePart', id: string, partNumber: string, brand?: string | null, model?: string | null } }>, materials: Array<{ __typename?: 'WorkOrderMaterial', id: string, quantity: number, material: { __typename?: 'Material', id: string, description: string, brand?: string | null } }> }
    & { ' $fragmentRefs'?: { 'WorkOrderItemFragment': WorkOrderItemFragment } }
  ) | null };

export type SignWorkOrderMutationVariables = Exact<{
  input: CreateWorkOrderSignatureInput;
}>;


export type SignWorkOrderMutation = { __typename?: 'Mutation', signWorkOrder: { __typename?: 'WorkOrderSignature', id: string, signatureImagePath: string, signedAt: string, workOrderId: string, signer: { __typename?: 'User', id: string, firstName: string, lastName: string, role?: { __typename?: 'Role', name: string } | null, roles: Array<{ __typename?: 'Role', name: string }> } } };

export type AssignTechnicianMutationVariables = Exact<{
  input: AssignTechnicianInput;
}>;


export type AssignTechnicianMutation = { __typename?: 'Mutation', assignTechnician: { __typename?: 'WorkOrderTechnician', id: string, isLead: boolean, technician: { __typename?: 'User', id: string, firstName: string, lastName: string } } };

export type UpdateWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateWorkOrderInput;
}>;


export type UpdateWorkOrderMutation = { __typename?: 'Mutation', updateWorkOrder: { __typename?: 'WorkOrder', id: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, stopType?: StopType | null, assignedShiftId?: string | null, machineId?: string | null, scheduledDate?: string | null, workType?: WorkType | null } };

export type ResumeWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ResumeWorkOrderMutation = { __typename?: 'Mutation', resumeWorkOrder: { __typename?: 'WorkOrder', id: string, status: WorkOrderStatus } };

export type StartWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: StartWorkOrderInput;
}>;


export type StartWorkOrderMutation = { __typename?: 'Mutation', startWorkOrder: { __typename?: 'WorkOrder', id: string, breakdownDescription?: string | null } };

export type PauseWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: PauseWorkOrderInput;
}>;


export type PauseWorkOrderMutation = { __typename?: 'Mutation', pauseWorkOrder: { __typename?: 'WorkOrder', id: string, pauseReason?: string | null } };

export type CompleteWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CompleteWorkOrderInput;
}>;


export type CompleteWorkOrderMutation = { __typename?: 'Mutation', completeWorkOrder: { __typename?: 'WorkOrder', id: string, downtimeMinutes?: number | null, breakdownDescription?: string | null, cause?: string | null, actionTaken?: string | null, toolsUsed?: string | null, observations?: string | null, status: WorkOrderStatus, customSparePart?: string | null, customMaterial?: string | null } };

export type AddWorkOrderSparePartMutationVariables = Exact<{
  input: AddWorkOrderSparePartInput;
}>;


export type AddWorkOrderSparePartMutation = { __typename?: 'Mutation', addWorkOrderSparePart: { __typename?: 'WorkOrderSparePart', id: string, quantity: number, sparePart: { __typename?: 'SparePart', id: string, partNumber: string, brand?: string | null, model?: string | null } } };

export type AddWorkOrderMaterialMutationVariables = Exact<{
  input: AddWorkOrderMaterialInput;
}>;


export type AddWorkOrderMaterialMutation = { __typename?: 'Mutation', addWorkOrderMaterial: { __typename?: 'WorkOrderMaterial', id: string, quantity: number, material: { __typename?: 'Material', id: string, description: string, brand?: string | null } } };

export type GetActiveMaterialsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveMaterialsQuery = { __typename?: 'Query', materialsActive: Array<{ __typename?: 'Material', id: string, description: string, brand?: string | null, model?: string | null, partNumber?: string | null, unitOfMeasure?: string | null }> };

export type GetMachineSparePartsForWoQueryVariables = Exact<{
  machineId: Scalars['ID']['input'];
}>;


export type GetMachineSparePartsForWoQuery = { __typename?: 'Query', sparePartsByMachine: Array<{ __typename?: 'SparePart', id: string, partNumber: string, brand?: string | null, model?: string | null, unitOfMeasure?: string | null, isActive: boolean }> };

export const AreaBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<AreaBasicFragment, unknown>;
export const RoleBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<RoleBasicFragment, unknown>;
export const UserBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<UserBasicFragment, unknown>;
export const ActivityItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"comments"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedAt"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}}]} as unknown as DocumentNode<ActivityItemFragment, unknown>;
export const AreaDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AreaDetailFragment, unknown>;
export const SubAreaDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<SubAreaDetailFragment, unknown>;
export const MachineBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<MachineBasicFragment, unknown>;
export const FindingBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FindingBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Finding"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"photoPath"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"convertedToWo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<FindingBasicFragment, unknown>;
export const PositionBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Position"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<PositionBasicFragment, unknown>;
export const TechnicianBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TechnicianBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Technician"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Position"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<TechnicianBasicFragment, unknown>;
export const NotificationItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<NotificationItemFragment, unknown>;
export const ScheduleItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TechnicianSchedule"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"shiftId"}},{"kind":"Field","name":{"kind":"Name","value":"absenceReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDate"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"absenceReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<ScheduleItemFragment, unknown>;
export const SubAreaBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}}]} as unknown as DocumentNode<SubAreaBasicFragment, unknown>;
export const WorkOrderItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}}]} as unknown as DocumentNode<WorkOrderItemFragment, unknown>;
export const GetActivitiesFilteredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActivitiesFiltered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ActivityFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ActivityPaginationInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ActivitySortInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activitiesFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"comments"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedAt"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<GetActivitiesFilteredQuery, GetActivitiesFilteredQueryVariables>;
export const GetActivityByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActivityById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityItem"}},{"kind":"Field","name":{"kind":"Name","value":"workOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"workOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"materialRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"materialRequestId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"materialRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"comments"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedAt"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<GetActivityByIdQuery, GetActivityByIdQueryVariables>;
export const GetActivityWorkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActivityWorkOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"workOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetActivityWorkOrdersQuery, GetActivityWorkOrdersQueryVariables>;
export const GetActivityMaterialRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActivityMaterialRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"materialRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"materialRequestId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"materialRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetActivityMaterialRequestsQuery, GetActivityMaterialRequestsQueryVariables>;
export const ExportActivitiesExcelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExportActivitiesExcel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ActivityFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ActivitySortInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportActivitiesExcel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}]}]}}]} as unknown as DocumentNode<ExportActivitiesExcelQuery, ExportActivitiesExcelQueryVariables>;
export const CreateActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateActivityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"comments"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedAt"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<CreateActivityMutation, CreateActivityMutationVariables>;
export const UpdateActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateActivityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ActivityItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ActivityItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Activity"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"comments"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"assignedAt"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateActivityMutation, UpdateActivityMutationVariables>;
export const DeleteActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteActivityMutation, DeleteActivityMutationVariables>;
export const UpdateActivityPriorityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateActivityPriority"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"priority"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateActivityPriority"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"priority"},"value":{"kind":"Variable","name":{"kind":"Name","value":"priority"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}}]}}]}}]} as unknown as DocumentNode<UpdateActivityPriorityMutation, UpdateActivityPriorityMutationVariables>;
export const AddActivityWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddActivityWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddActivityWorkOrderByFolioInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addActivityWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activityId"}},{"kind":"Field","name":{"kind":"Name","value":"workOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"workOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AddActivityWorkOrderMutation, AddActivityWorkOrderMutationVariables>;
export const RemoveActivityWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveActivityWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activityId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workOrderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeActivityWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"workOrderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workOrderId"}}}]}]}}]} as unknown as DocumentNode<RemoveActivityWorkOrderMutation, RemoveActivityWorkOrderMutationVariables>;
export const AddActivityMaterialRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddActivityMaterialRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddActivityMaterialRequestByFolioInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addActivityMaterialRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activityId"}},{"kind":"Field","name":{"kind":"Name","value":"materialRequestId"}},{"kind":"Field","name":{"kind":"Name","value":"materialRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AddActivityMaterialRequestMutation, AddActivityMaterialRequestMutationVariables>;
export const RemoveActivityMaterialRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveActivityMaterialRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"activityId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"materialRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeActivityMaterialRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"activityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"activityId"}}},{"kind":"Argument","name":{"kind":"Name","value":"materialRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"materialRequestId"}}}]}]}}]} as unknown as DocumentNode<RemoveActivityMaterialRequestMutation, RemoveActivityMaterialRequestMutationVariables>;
export const GetAreasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAreas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<GetAreasQuery, GetAreasQueryVariables>;
export const GetAreasWithDeletedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAreasWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areasWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetAreasWithDeletedQuery, GetAreasWithDeletedQueryVariables>;
export const GetAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"area"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetAreaQuery, GetAreaQueryVariables>;
export const GetSubAreasByAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubAreasByArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subAreasByArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"areaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}}]} as unknown as DocumentNode<GetSubAreasByAreaQuery, GetSubAreasByAreaQueryVariables>;
export const GetWorkOrdersByAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkOrdersByArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workOrdersFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"areaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"EnumValue","value":"CREATED_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"EnumValue","value":"DESC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<GetWorkOrdersByAreaQuery, GetWorkOrdersByAreaQueryVariables>;
export const GetFindingsByAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFindingsByArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"FindingStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createdFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createdTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findingsFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"areaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"createdFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createdFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"createdTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createdTo"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"StringValue","value":"createdAt","block":false}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"StringValue","value":"DESC","block":false}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"photoPath"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"convertedToWo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<GetFindingsByAreaQuery, GetFindingsByAreaQueryVariables>;
export const CreateAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAreaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateAreaMutation, CreateAreaMutationVariables>;
export const UpdateAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAreaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateAreaMutation, UpdateAreaMutationVariables>;
export const DeactivateAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateAreaMutation, DeactivateAreaMutationVariables>;
export const ActivateAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ActivateAreaMutation, ActivateAreaMutationVariables>;
export const CreateSubAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSubArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSubAreaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSubArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateSubAreaMutation, CreateSubAreaMutationVariables>;
export const UpdateSubAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSubArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSubAreaInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSubArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateSubAreaMutation, UpdateSubAreaMutationVariables>;
export const DeactivateSubAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateSubArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateSubArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateSubAreaMutation, DeactivateSubAreaMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"employeeNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeNumber"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const RefreshAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshAuth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshAuth"}}]}}]} as unknown as DocumentNode<RefreshAuthMutation, RefreshAuthMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const GetShiftsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shiftsActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<GetShiftsQuery, GetShiftsQueryVariables>;
export const GetMaterialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMaterials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"materialsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"manufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetMaterialsQuery, GetMaterialsQueryVariables>;
export const CreateMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMaterialInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<CreateMaterialMutation, CreateMaterialMutationVariables>;
export const UpdateMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMaterialInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<UpdateMaterialMutation, UpdateMaterialMutationVariables>;
export const ActivateMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ActivateMaterialMutation, ActivateMaterialMutationVariables>;
export const DeactivateMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateMaterialMutation, DeactivateMaterialMutationVariables>;
export const GetSparePartsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSpareParts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sparePartsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetSparePartsQuery, GetSparePartsQueryVariables>;
export const CreateSparePartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSparePart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSparePartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSparePart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<CreateSparePartMutation, CreateSparePartMutationVariables>;
export const UpdateSparePartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSparePart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSparePartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSparePart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}}]}}]}}]} as unknown as DocumentNode<UpdateSparePartMutation, UpdateSparePartMutationVariables>;
export const ActivateSparePartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateSparePart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateSparePart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ActivateSparePartMutation, ActivateSparePartMutationVariables>;
export const DeactivateSparePartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateSparePart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateSparePart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateSparePartMutation, DeactivateSparePartMutationVariables>;
export const GetPositionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPositions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"positionsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetPositionsQuery, GetPositionsQueryVariables>;
export const CreatePositionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePosition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePositionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPosition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<CreatePositionMutation, CreatePositionMutationVariables>;
export const UpdatePositionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePosition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePositionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePosition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<UpdatePositionMutation, UpdatePositionMutationVariables>;
export const ActivatePositionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivatePosition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activatePosition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ActivatePositionMutation, ActivatePositionMutationVariables>;
export const DeactivatePositionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivatePosition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivatePosition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivatePositionMutation, DeactivatePositionMutationVariables>;
export const GetShiftsAllDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShiftsAll"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shiftsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetShiftsAllQuery, GetShiftsAllQueryVariables>;
export const CreateShiftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateShift"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateShiftInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createShift"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<CreateShiftMutation, CreateShiftMutationVariables>;
export const UpdateShiftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateShift"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateShiftInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateShift"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]} as unknown as DocumentNode<UpdateShiftMutation, UpdateShiftMutationVariables>;
export const ActivateShiftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateShift"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateShift"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ActivateShiftMutation, ActivateShiftMutationVariables>;
export const DeactivateShiftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateShift"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateShift"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateShiftMutation, DeactivateShiftMutationVariables>;
export const GetDepartmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDepartments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"departmentsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetDepartmentsQuery, GetDepartmentsQueryVariables>;
export const CreateDepartmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDepartment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDepartmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDepartment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<CreateDepartmentMutation, CreateDepartmentMutationVariables>;
export const UpdateDepartmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDepartment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDepartmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDepartment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<UpdateDepartmentMutation, UpdateDepartmentMutationVariables>;
export const ActivateDepartmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateDepartment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateDepartment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ActivateDepartmentMutation, ActivateDepartmentMutationVariables>;
export const DeactivateDepartmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateDepartment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateDepartment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateDepartmentMutation, DeactivateDepartmentMutationVariables>;
export const GetDashboardDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDashboardData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DashboardInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeBacklog"}},{"kind":"Field","name":{"kind":"Name","value":"leadTimeHoursAvg"}},{"kind":"Field","name":{"kind":"Name","value":"mttrHoursAvg"}},{"kind":"Field","name":{"kind":"Name","value":"preventiveComplianceRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"charts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downtimeByAreaTop5"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"findingsConversion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"findingsByArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workOrdersByArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceMixByPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"throughputByWeek"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"rankings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topMachinesByDowntime"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machineName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topTechniciansByClosures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"technicianName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetDashboardDataQuery, GetDashboardDataQueryVariables>;
export const GetFindingsFilteredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFindingsFiltered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"FindingFiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"FindingPaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findingsFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FindingBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FindingBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Finding"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"photoPath"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"convertedToWo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}}]}}]}}]} as unknown as DocumentNode<GetFindingsFilteredQuery, GetFindingsFilteredQueryVariables>;
export const CreateFindingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateFinding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateFindingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createFinding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateFindingMutation, CreateFindingMutationVariables>;
export const GetFindingByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFindingById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FindingBasic"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FindingBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Finding"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"photoPath"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"convertedToWo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}}]}}]}}]} as unknown as DocumentNode<GetFindingByIdQuery, GetFindingByIdQueryVariables>;
export const UpdateFindingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateFinding"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFindingInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateFinding"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FindingBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FindingBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Finding"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"photoPath"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"convertedToWo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}}]}}]}}]} as unknown as DocumentNode<UpdateFindingMutation, UpdateFindingMutationVariables>;
export const ConvertToWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConvertToWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"convertToWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"convertedToWo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}}]}}]}}]}}]} as unknown as DocumentNode<ConvertToWorkOrderMutation, ConvertToWorkOrderMutationVariables>;
export const GetMachinesPageDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachinesPageData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"machinesWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"areasActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subAreasActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetMachinesPageDataQuery, GetMachinesPageDataQueryVariables>;
export const GetMachineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"machine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetMachineQuery, GetMachineQueryVariables>;
export const GetMachineSparePartsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachineSpareParts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sparePartsByMachine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"machineId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetMachineSparePartsQuery, GetMachineSparePartsQueryVariables>;
export const GetMachineWorkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachineWorkOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workOrdersFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"EnumValue","value":"CREATED_AT"}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"EnumValue","value":"DESC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<GetMachineWorkOrdersQuery, GetMachineWorkOrdersQueryVariables>;
export const GetMachineMaterialRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachineMaterialRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"machine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"materialRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"suggestedSupplier"}},{"kind":"Field","name":{"kind":"Name","value":"comments"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"material"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMachineMaterialRequestsQuery, GetMachineMaterialRequestsQueryVariables>;
export const CreateMachineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMachine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMachineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMachine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateMachineMutation, CreateMachineMutationVariables>;
export const UpdateMachineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMachine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMachineInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMachine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateMachineMutation, UpdateMachineMutationVariables>;
export const DeactivateMachineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateMachine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateMachine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateMachineMutation, DeactivateMachineMutationVariables>;
export const ActivateMachineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateMachine"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateMachine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ActivateMachineMutation, ActivateMachineMutationVariables>;
export const GetMachinesByAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachinesByArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"subAreaId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"machinesByArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"areaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}}},{"kind":"Argument","name":{"kind":"Name","value":"subAreaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"subAreaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetMachinesByAreaQuery, GetMachinesByAreaQueryVariables>;
export const GetMaterialRequestFormDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMaterialRequestFormData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"techniciansActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"usersWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"machinesActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"manufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"materialsActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sparePartsActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}}]}}]}}]} as unknown as DocumentNode<GetMaterialRequestFormDataQuery, GetMaterialRequestFormDataQueryVariables>;
export const GetMaterialRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMaterialRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"materialRequestsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"suggestedSupplier"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"emailSentAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"manufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"customName"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isGenericAllowed"}}]}}]}}]}}]} as unknown as DocumentNode<GetMaterialRequestsQuery, GetMaterialRequestsQueryVariables>;
export const GetMaterialRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMaterialRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"materialRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"customMachineBrand"}},{"kind":"Field","name":{"kind":"Name","value":"customMachineModel"}},{"kind":"Field","name":{"kind":"Name","value":"customMachineManufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"suggestedSupplier"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"comments"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"emailSentAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"manufacturer"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"customName"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"proposedMaxStock"}},{"kind":"Field","name":{"kind":"Name","value":"proposedMinStock"}},{"kind":"Field","name":{"kind":"Name","value":"materialId"}},{"kind":"Field","name":{"kind":"Name","value":"isGenericAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"sparePartId"}},{"kind":"Field","name":{"kind":"Name","value":"material"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sparePart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMaterialRequestQuery, GetMaterialRequestQueryVariables>;
export const CreateMaterialRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMaterialRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMaterialRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMaterialRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"boss"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateMaterialRequestMutation, CreateMaterialRequestMutationVariables>;
export const AddMaterialToRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddMaterialToRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"materialRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMaterialRequestItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addMaterialToRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"materialRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"materialRequestId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"requestedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"customName"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"proposedMaxStock"}},{"kind":"Field","name":{"kind":"Name","value":"proposedMinStock"}},{"kind":"Field","name":{"kind":"Name","value":"materialId"}},{"kind":"Field","name":{"kind":"Name","value":"sparePartId"}}]}}]}}]} as unknown as DocumentNode<AddMaterialToRequestMutation, AddMaterialToRequestMutationVariables>;
export const UpdateMaterialRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMaterialRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMaterialRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMaterialRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}}]}}]}}]} as unknown as DocumentNode<UpdateMaterialRequestMutation, UpdateMaterialRequestMutationVariables>;
export const DeactivateMaterialRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateMaterialRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateMaterialRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateMaterialRequestMutation, DeactivateMaterialRequestMutationVariables>;
export const SendMaterialRequestEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendMaterialRequestEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendMaterialRequestEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendMaterialRequestEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SendMaterialRequestEmailMutation, SendMaterialRequestEmailMutationVariables>;
export const GetMaterialRequestHistoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMaterialRequestHistories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"materialRequestsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"importance"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"emailSentAt"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"customName"}},{"kind":"Field","name":{"kind":"Name","value":"requestedQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"isGenericAllowed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"histories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseRequest"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrder"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMerchandise"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryDate"}},{"kind":"Field","name":{"kind":"Name","value":"progressPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"}}]}}]}}]}}]} as unknown as DocumentNode<GetMaterialRequestHistoriesQuery, GetMaterialRequestHistoriesQueryVariables>;
export const UpdateMaterialRequestHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMaterialRequestHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMaterialRequestHistoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMaterialRequestHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"histories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseRequest"}},{"kind":"Field","name":{"kind":"Name","value":"purchaseOrder"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMerchandise"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryDate"}},{"kind":"Field","name":{"kind":"Name","value":"progressPercentage"}},{"kind":"Field","name":{"kind":"Name","value":"supplier"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMaterialRequestHistoryMutation, UpdateMaterialRequestHistoryMutationVariables>;
export const MyNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<MyNotificationsQuery, MyNotificationsQueryVariables>;
export const MarkNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkAllNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;
export const RegisterDeviceTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterDeviceToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterDeviceTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerDeviceToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fcmToken"}},{"kind":"Field","name":{"kind":"Name","value":"platform"}},{"kind":"Field","name":{"kind":"Name","value":"deviceName"}}]}}]}}]} as unknown as DocumentNode<RegisterDeviceTokenMutation, RegisterDeviceTokenMutationVariables>;
export const UnregisterDeviceTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnregisterDeviceToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnregisterDeviceTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unregisterDeviceToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<UnregisterDeviceTokenMutation, UnregisterDeviceTokenMutationVariables>;
export const MyNotificationPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyNotificationPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotificationPreferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"notificationType"}},{"kind":"Field","name":{"kind":"Name","value":"pushEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"emailEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"inAppEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursStart"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursEnd"}}]}}]}}]} as unknown as DocumentNode<MyNotificationPreferencesQuery, MyNotificationPreferencesQueryVariables>;
export const UpdateNotificationPreferenceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNotificationPreference"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateNotificationPreferenceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateNotificationPreference"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"notificationType"}},{"kind":"Field","name":{"kind":"Name","value":"pushEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"emailEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"inAppEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursStart"}},{"kind":"Field","name":{"kind":"Name","value":"quietHoursEnd"}}]}}]}}]} as unknown as DocumentNode<UpdateNotificationPreferenceMutation, UpdateNotificationPreferenceMutationVariables>;
export const GetOvertimeRecordsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOvertimeRecords"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"positionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reasonForPayment"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReasonForPayment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"overtimeRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"startDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"endDate"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"positionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"positionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"reasonForPayment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reasonForPayment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workTime"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"reasonForPayment"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetOvertimeRecordsQuery, GetOvertimeRecordsQueryVariables>;
export const GetMyOvertimeRecordsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyOvertimeRecords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOvertimeRecords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workTime"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"reasonForPayment"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetMyOvertimeRecordsQuery, GetMyOvertimeRecordsQueryVariables>;
export const GetOvertimeRecordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOvertimeRecord"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"overtimeRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workTime"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"reasonForPayment"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetOvertimeRecordQuery, GetOvertimeRecordQueryVariables>;
export const CreateOvertimeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOvertime"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOvertimeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOvertime"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workTime"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"reasonForPayment"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}}]}}]}}]} as unknown as DocumentNode<CreateOvertimeMutation, CreateOvertimeMutationVariables>;
export const UpdateOvertimeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOvertime"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOvertimeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOvertime"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workDate"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"workTime"}},{"kind":"Field","name":{"kind":"Name","value":"activity"}},{"kind":"Field","name":{"kind":"Name","value":"reasonForPayment"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}}]}}]}}]} as unknown as DocumentNode<UpdateOvertimeMutation, UpdateOvertimeMutationVariables>;
export const DeleteOvertimeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOvertime"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOvertime"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteOvertimeMutation, DeleteOvertimeMutationVariables>;
export const GetActiveTechniciansForOvertimeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActiveTechniciansForOvertime"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"techniciansActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetActiveTechniciansForOvertimeQuery, GetActiveTechniciansForOvertimeQueryVariables>;
export const GetOvertimePositionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOvertimePositions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"positions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<GetOvertimePositionsQuery, GetOvertimePositionsQueryVariables>;
export const GetWeekScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWeekSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weekSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"weekNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekNumber"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"totalAssignments"}},{"kind":"Field","name":{"kind":"Name","value":"totalAbsences"}},{"kind":"Field","name":{"kind":"Name","value":"totalWorkDays"}},{"kind":"Field","name":{"kind":"Name","value":"schedules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TechnicianSchedule"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"shiftId"}},{"kind":"Field","name":{"kind":"Name","value":"absenceReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDate"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"absenceReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<GetWeekScheduleQuery, GetWeekScheduleQueryVariables>;
export const GetScheduleTechniciansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScheduleTechnicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"techniciansWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetScheduleTechniciansQuery, GetScheduleTechniciansQueryVariables>;
export const GetAbsenceReasonsActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAbsenceReasonsActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"absenceReasonsActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}}]}}]} as unknown as DocumentNode<GetAbsenceReasonsActiveQuery, GetAbsenceReasonsActiveQueryVariables>;
export const AssignWeekScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignWeekSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignWeekScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignWeekSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TechnicianSchedule"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"shiftId"}},{"kind":"Field","name":{"kind":"Name","value":"absenceReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDate"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"absenceReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<AssignWeekScheduleMutation, AssignWeekScheduleMutationVariables>;
export const CreateTechnicianScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTechnicianSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTechnicianSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TechnicianSchedule"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"shiftId"}},{"kind":"Field","name":{"kind":"Name","value":"absenceReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDate"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"absenceReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<CreateTechnicianScheduleMutation, CreateTechnicianScheduleMutationVariables>;
export const UpdateTechnicianScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTechnicianSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTechnicianSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TechnicianSchedule"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"shiftId"}},{"kind":"Field","name":{"kind":"Name","value":"absenceReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDate"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"absenceReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<UpdateTechnicianScheduleMutation, UpdateTechnicianScheduleMutationVariables>;
export const DeleteTechnicianScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTechnicianSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTechnicianSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteTechnicianScheduleMutation, DeleteTechnicianScheduleMutationVariables>;
export const CopyWeekSchedulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CopyWeekSchedules"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CopyWeekSchedulesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"copyWeekSchedules"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TechnicianSchedule"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"shiftId"}},{"kind":"Field","name":{"kind":"Name","value":"absenceReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDate"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"absenceReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<CopyWeekSchedulesMutation, CopyWeekSchedulesMutationVariables>;
export const GetTechnicianWeekScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTechnicianWeekSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"technicianId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"technicianWeekSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"technicianId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"technicianId"}}},{"kind":"Argument","name":{"kind":"Name","value":"weekNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekNumber"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ScheduleItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ScheduleItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"TechnicianSchedule"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"shiftId"}},{"kind":"Field","name":{"kind":"Name","value":"absenceReasonId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDate"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"shift"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"absenceReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"maxPerWeek"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<GetTechnicianWeekScheduleQuery, GetTechnicianWeekScheduleQueryVariables>;
export const GetTechniciansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTechnicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"techniciansActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TechnicianBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Position"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TechnicianBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Technician"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionBasic"}}]}}]}}]} as unknown as DocumentNode<GetTechniciansQuery, GetTechniciansQueryVariables>;
export const GetTechniciansDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTechniciansData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"techniciansWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"allergies"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"childrenCount"}},{"kind":"Field","name":{"kind":"Name","value":"education"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelationship"}},{"kind":"Field","name":{"kind":"Name","value":"hireDate"}},{"kind":"Field","name":{"kind":"Name","value":"nss"}},{"kind":"Field","name":{"kind":"Name","value":"pantsSize"}},{"kind":"Field","name":{"kind":"Name","value":"rfc"}},{"kind":"Field","name":{"kind":"Name","value":"shirtSize"}},{"kind":"Field","name":{"kind":"Name","value":"shoeSize"}},{"kind":"Field","name":{"kind":"Name","value":"transportRoute"}},{"kind":"Field","name":{"kind":"Name","value":"vacationPeriod"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"departmentId"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"departmentsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"positionsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rolesWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetTechniciansDataQuery, GetTechniciansDataQueryVariables>;
export const GetTechnicianDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTechnicianDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"technician"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"allergies"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"childrenCount"}},{"kind":"Field","name":{"kind":"Name","value":"education"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactRelationship"}},{"kind":"Field","name":{"kind":"Name","value":"hireDate"}},{"kind":"Field","name":{"kind":"Name","value":"nss"}},{"kind":"Field","name":{"kind":"Name","value":"pantsSize"}},{"kind":"Field","name":{"kind":"Name","value":"rfc"}},{"kind":"Field","name":{"kind":"Name","value":"shirtSize"}},{"kind":"Field","name":{"kind":"Name","value":"shoeSize"}},{"kind":"Field","name":{"kind":"Name","value":"transportRoute"}},{"kind":"Field","name":{"kind":"Name","value":"vacationPeriod"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"department"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetTechnicianDetailQuery, GetTechnicianDetailQueryVariables>;
export const CreateTechnicianProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTechnicianProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTechnicianInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTechnician"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<CreateTechnicianProfileMutation, CreateTechnicianProfileMutationVariables>;
export const UpdateTechnicianProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTechnicianProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTechnicianInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTechnician"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpdateTechnicianProfileMutation, UpdateTechnicianProfileMutationVariables>;
export const ActivateTechnicianDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateTechnician"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateTechnician"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ActivateTechnicianMutation, ActivateTechnicianMutationVariables>;
export const DeactivateTechnicianDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateTechnician"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateTechnician"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateTechnicianMutation, DeactivateTechnicianMutationVariables>;
export const GetRequestersDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRequestersData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usersWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"department"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"departmentsWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rolesWithDeleted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetRequestersDataQuery, GetRequestersDataQueryVariables>;
export const CreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeactivateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeactivateUserMutation, DeactivateUserMutationVariables>;
export const ActivateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<ActivateUserMutation, ActivateUserMutationVariables>;
export const MyRequestedWorkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyRequestedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myRequestedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<MyRequestedWorkOrdersQuery, MyRequestedWorkOrdersQueryVariables>;
export const MyAssignedWorkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAssignedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAssignedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<MyAssignedWorkOrdersQuery, MyAssignedWorkOrdersQueryVariables>;
export const GetWorkOrdersFilteredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkOrdersFiltered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrderStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"priority"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrderPriority"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assignedShiftId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workOrdersFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"priority"},"value":{"kind":"Variable","name":{"kind":"Name","value":"priority"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"assignedShiftId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assignedShiftId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}},{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<GetWorkOrdersFilteredQuery, GetWorkOrdersFilteredQueryVariables>;
export const GetScheduledWorkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScheduledWorkOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scheduledFrom"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scheduledTo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assignedShiftId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workOrdersFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"maintenanceType"},"value":{"kind":"EnumValue","value":"CORRECTIVE_SCHEDULED"}},{"kind":"ObjectField","name":{"kind":"Name","value":"scheduledFrom"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scheduledFrom"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"scheduledTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scheduledTo"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"assignedShiftId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assignedShiftId"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}},{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"field"},"value":{"kind":"EnumValue","value":"SCHEDULED_DATE"}},{"kind":"ObjectField","name":{"kind":"Name","value":"order"},"value":{"kind":"EnumValue","value":"ASC"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<GetScheduledWorkOrdersQuery, GetScheduledWorkOrdersQueryVariables>;
export const CreateWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateWorkOrderMutation, CreateWorkOrderMutationVariables>;
export const AssignWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}}]}}]}}]} as unknown as DocumentNode<AssignWorkOrderMutation, AssignWorkOrderMutationVariables>;
export const UploadWorkOrderPhotoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadWorkOrderPhoto"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkOrderPhotoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadWorkOrderPhoto"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}}]}}]}}]} as unknown as DocumentNode<UploadWorkOrderPhotoMutation, UploadWorkOrderPhotoMutationVariables>;
export const GetWorkOrderByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkOrderById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}},{"kind":"Field","name":{"kind":"Name","value":"cause"}},{"kind":"Field","name":{"kind":"Name","value":"actionTaken"}},{"kind":"Field","name":{"kind":"Name","value":"toolsUsed"}},{"kind":"Field","name":{"kind":"Name","value":"observations"}},{"kind":"Field","name":{"kind":"Name","value":"functionalTimeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"downtimeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"breakdownDescription"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"pauseReason"}},{"kind":"Field","name":{"kind":"Name","value":"signatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"signatureImagePath"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}},{"kind":"Field","name":{"kind":"Name","value":"signer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoType"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customSparePart"}},{"kind":"Field","name":{"kind":"Name","value":"customMaterial"}},{"kind":"Field","name":{"kind":"Name","value":"spareParts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sparePart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"materials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"material"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"installationDate"}},{"kind":"Field","name":{"kind":"Name","value":"machinePhotoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"operationalManualUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"roleIds"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<GetWorkOrderByIdQuery, GetWorkOrderByIdQueryVariables>;
export const SignWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkOrderSignatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"signatureImagePath"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}},{"kind":"Field","name":{"kind":"Name","value":"workOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"signer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SignWorkOrderMutation, SignWorkOrderMutationVariables>;
export const AssignTechnicianDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignTechnician"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignTechnicianInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignTechnician"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}}]}}]} as unknown as DocumentNode<AssignTechnicianMutation, AssignTechnicianMutationVariables>;
export const UpdateWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledDate"}},{"kind":"Field","name":{"kind":"Name","value":"workType"}}]}}]}}]} as unknown as DocumentNode<UpdateWorkOrderMutation, UpdateWorkOrderMutationVariables>;
export const ResumeWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResumeWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumeWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ResumeWorkOrderMutation, ResumeWorkOrderMutationVariables>;
export const StartWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"breakdownDescription"}}]}}]}}]} as unknown as DocumentNode<StartWorkOrderMutation, StartWorkOrderMutationVariables>;
export const PauseWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PauseWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PauseWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pauseWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pauseReason"}}]}}]}}]} as unknown as DocumentNode<PauseWorkOrderMutation, PauseWorkOrderMutationVariables>;
export const CompleteWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downtimeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"breakdownDescription"}},{"kind":"Field","name":{"kind":"Name","value":"cause"}},{"kind":"Field","name":{"kind":"Name","value":"actionTaken"}},{"kind":"Field","name":{"kind":"Name","value":"toolsUsed"}},{"kind":"Field","name":{"kind":"Name","value":"observations"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"customSparePart"}},{"kind":"Field","name":{"kind":"Name","value":"customMaterial"}}]}}]}}]} as unknown as DocumentNode<CompleteWorkOrderMutation, CompleteWorkOrderMutationVariables>;
export const AddWorkOrderSparePartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddWorkOrderSparePart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddWorkOrderSparePartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addWorkOrderSparePart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"sparePart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}}]}}]}}]}}]} as unknown as DocumentNode<AddWorkOrderSparePartMutation, AddWorkOrderSparePartMutationVariables>;
export const AddWorkOrderMaterialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddWorkOrderMaterial"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddWorkOrderMaterialInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addWorkOrderMaterial"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"material"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}}]}}]}}]}}]} as unknown as DocumentNode<AddWorkOrderMaterialMutation, AddWorkOrderMaterialMutationVariables>;
export const GetActiveMaterialsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActiveMaterials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"materialsActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}}]}}]}}]} as unknown as DocumentNode<GetActiveMaterialsQuery, GetActiveMaterialsQueryVariables>;
export const GetMachineSparePartsForWoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachineSparePartsForWO"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"machineId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sparePartsByMachine"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"machineId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"machineId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"partNumber"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"unitOfMeasure"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<GetMachineSparePartsForWoQuery, GetMachineSparePartsForWoQueryVariables>;