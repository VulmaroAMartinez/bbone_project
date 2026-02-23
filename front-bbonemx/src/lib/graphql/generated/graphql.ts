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

export type AddMaterialToRequestInput = {
  importance?: InputMaybe<MaterialRequestImportance>;
  materialId: Scalars['ID']['input'];
  maximumStock?: InputMaybe<Scalars['Int']['input']>;
  minimumStock?: InputMaybe<Scalars['Int']['input']>;
  quantity: Scalars['Int']['input'];
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
  stopType?: InputMaybe<StopType>;
  /** IDs de técnicos a asignar */
  technicianIds: Array<Scalars['ID']['input']>;
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
  actionTaken: Scalars['String']['input'];
  cause?: InputMaybe<Scalars['String']['input']>;
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
  machineId: Scalars['ID']['input'];
  photoPath: Scalars['String']['input'];
  shiftId: Scalars['ID']['input'];
};

export type CreateMachineInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  installationDate?: InputMaybe<Scalars['DateTime']['input']>;
  machinePhotoUrl?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  operationalManualUrl?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  subAreaId: Scalars['String']['input'];
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
  comments?: InputMaybe<Scalars['String']['input']>;
  isGenericOrAlternativeModel?: InputMaybe<Scalars['Boolean']['input']>;
  justification?: InputMaybe<Scalars['String']['input']>;
  machineId: Scalars['ID']['input'];
  priority: MaterialRequestPriority;
  requestText: Scalars['String']['input'];
  suggestedSupplier?: InputMaybe<Scalars['String']['input']>;
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
  roleId: Scalars['String']['input'];
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
};

export type DashboardCharts = {
  __typename?: 'DashboardCharts';
  downtimeByAreaTop5: Array<AreaMetric>;
  findingsConversion: Array<KeyValue>;
  maintenanceMixByPeriod: Array<MixPoint>;
  throughputByWeek: Array<TimeCount>;
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
  machine: Machine;
  machineId: Scalars['ID']['output'];
  photoPath: Scalars['String']['output'];
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
  brand?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  installationDate?: Maybe<Scalars['DateTime']['output']>;
  isActive: Scalars['Boolean']['output'];
  machinePhotoUrl?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  operationalManualUrl?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  subArea: SubArea;
  subAreaId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MachineMetric = {
  __typename?: 'MachineMetric';
  machineId: Scalars['String']['output'];
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
  comments?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  folio: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isGenericOrAlternativeModel: Scalars['Boolean']['output'];
  justification?: Maybe<Scalars['String']['output']>;
  machine: Machine;
  machineId: Scalars['ID']['output'];
  materials: Array<MaterialRequestMaterial>;
  priority: MaterialRequestPriority;
  requestText: Scalars['String']['output'];
  sequence: Scalars['Int']['output'];
  suggestedSupplier?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Importancia del material en la solicitud */
export type MaterialRequestImportance =
  /** Crítica */
  | 'CRITICAL'
  /** Alta */
  | 'HIGH'
  /** Baja */
  | 'LOW'
  /** Media */
  | 'MEDIUM';

export type MaterialRequestMaterial = {
  __typename?: 'MaterialRequestMaterial';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  importance?: Maybe<MaterialRequestImportance>;
  material: Material;
  materialId: Scalars['ID']['output'];
  materialRequestId: Scalars['ID']['output'];
  maximumStock?: Maybe<Scalars['Int']['output']>;
  minimumStock?: Maybe<Scalars['Int']['output']>;
  quantity: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Prioridad de solicitud de material */
export type MaterialRequestPriority =
  /** Crítica */
  | 'CRITICAL'
  /** Alta */
  | 'HIGH'
  /** Baja */
  | 'LOW'
  /** Media */
  | 'MEDIUM';

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
  addMaterialToRequest: MaterialRequestMaterial;
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
  createArea: Area;
  createDepartment: Department;
  createFinding: Finding;
  createMachine: Machine;
  createMaterial: Material;
  createMaterialRequest: MaterialRequest;
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
  deleteFinding: Finding;
  /** Elimina una notificación (soft delete) */
  deleteNotification: Scalars['Boolean']['output'];
  /** Elimina (soft-delete) una asignación de horario */
  deleteTechnicianSchedule: Scalars['Boolean']['output'];
  deleteWorkOrder: WorkOrder;
  deleteWorkOrderPhoto: WorkOrderPhoto;
  generateWorkOrdersForPreventiveTask: GenerateWorkOrdersResult;
  /** Inicia sesión con número de empleado y contraseña */
  login: LoginResponse;
  /** Marca todas las notificaciones como leídas. Retorna cantidad actualizada. */
  markAllNotificationsAsRead: Scalars['Int']['output'];
  /** Marca una notificación como leída */
  markNotificationAsRead: Notification;
  pausePreventiveTasksCron: Scalars['Boolean']['output'];
  pauseWorkOrder: WorkOrder;
  /** Registra un token FCM para recibir notificaciones push */
  registerDeviceToken: UserDeviceToken;
  removeMaterialFromRequest: Scalars['Boolean']['output'];
  removeWorkOrderMaterial: Scalars['Boolean']['output'];
  removeWorkOrderSparePart: Scalars['Boolean']['output'];
  resumePreventiveTasksCron: Scalars['Boolean']['output'];
  resumeWorkOrder: WorkOrder;
  runPreventiveTasksCron: GenerateWorkOrdersResult;
  setLeadTechnician: WorkOrderTechnician;
  signWorkOrder: WorkOrderSignature;
  startWorkOrder: WorkOrder;
  unassignTechnician: Scalars['Boolean']['output'];
  /** Elimina un token FCM (al cerrar sesión) */
  unregisterDeviceToken: Scalars['Boolean']['output'];
  updateAbsenceReason: AbsenceReason;
  updateArea: Area;
  updateDepartment: Department;
  updateFinding: Finding;
  updateMachine: Machine;
  updateMaterial: Material;
  updateMaterialRequest: MaterialRequest;
  /** Actualiza una preferencia de notificación */
  updateNotificationPreference: NotificationPreference;
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


export type MutationAddMaterialToRequestArgs = {
  input: AddMaterialToRequestInput;
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


export type MutationDeleteFindingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteNotificationArgs = {
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


export type MutationUpdateNotificationPreferenceArgs = {
  input: UpdateNotificationPreferenceInput;
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
  area?: Maybe<Area>;
  areaByName?: Maybe<Area>;
  areas: Array<Area>;
  areasActive: Array<Area>;
  dashboardData: DashboardData;
  department?: Maybe<Department>;
  departments: Array<Department>;
  departmentsActive: Array<Department>;
  finding?: Maybe<Finding>;
  findingByFolio?: Maybe<Finding>;
  findings: Array<Finding>;
  findingsCountOpen: Scalars['Int']['output'];
  findingsFiltered: FindingPaginatedResponse;
  findingsOpen: Array<Finding>;
  findingsStats: Array<FindingStats>;
  machine?: Maybe<Machine>;
  machines: Array<Machine>;
  machinesActive: Array<Machine>;
  material?: Maybe<Material>;
  materialRequest?: Maybe<MaterialRequest>;
  materialRequestByFolio?: Maybe<MaterialRequest>;
  materialRequests: Array<MaterialRequest>;
  materialRequestsActive: Array<MaterialRequest>;
  materials: Array<Material>;
  materialsActive: Array<Material>;
  /** Obtiene el usuario actualmente autenticado */
  me: User;
  myAssignedWorkOrders: Array<WorkOrder>;
  /** Obtiene los tokens FCM registrados del usuario autenticado */
  myDeviceTokens: Array<UserDeviceToken>;
  /** Obtiene las preferencias de notificación del usuario */
  myNotificationPreferences: Array<NotificationPreference>;
  /** Obtiene las notificaciones del usuario autenticado con paginación */
  myNotifications: NotificationPaginatedResponse;
  myRequestedWorkOrders: Array<WorkOrder>;
  position?: Maybe<Position>;
  positions: Array<Position>;
  positionsActive: Array<Position>;
  preventiveTaskById?: Maybe<PreventiveTask>;
  preventiveTaskCountActive: Scalars['Int']['output'];
  preventiveTaskStats: Array<PreventiveTaskStats>;
  preventiveTasks: Array<PreventiveTask>;
  preventiveTasksActive: Array<PreventiveTask>;
  preventiveTasksByMachineId: Array<PreventiveTask>;
  preventiveTasksCronStatus: CronJobStatus;
  preventiveTasksFiltered: PreventiveTaskPaginatedResponse;
  role?: Maybe<Role>;
  roles: Array<Role>;
  rolesActive: Role;
  schedulerStatus: SchedulerStatus;
  shift?: Maybe<Shift>;
  shifts: Array<Shift>;
  shiftsActive: Array<Shift>;
  sparePart?: Maybe<SparePart>;
  spareParts: Array<SparePart>;
  sparePartsActive: Array<SparePart>;
  sparePartsByMachine: Array<SparePart>;
  subArea?: Maybe<SubArea>;
  subAreas: Array<SubArea>;
  subAreasActive: Array<SubArea>;
  subAreasByArea: Array<SubArea>;
  technician?: Maybe<Technician>;
  /** Obtiene un horario por ID */
  technicianSchedule?: Maybe<TechnicianSchedule>;
  /** Obtiene todos los horarios de técnicos */
  technicianSchedules: Array<TechnicianSchedule>;
  /** Consulta horarios con filtros: por día, turno, técnico, semana, ausencia */
  technicianSchedulesFiltered: Array<TechnicianSchedule>;
  /** Obtiene los horarios de un técnico en una semana específica */
  technicianWeekSchedule: Array<TechnicianSchedule>;
  technicians: Array<Technician>;
  techniciansActive: Array<Technician>;
  /** Contador de notificaciones no leídas */
  unreadNotificationsCount: Scalars['Int']['output'];
  user?: Maybe<User>;
  users: Array<User>;
  /** Obtiene los horarios de una semana completa con resumen */
  weekSchedule: WeekScheduleSummary;
  workOrder?: Maybe<WorkOrder>;
  workOrderByFolio?: Maybe<WorkOrder>;
  workOrderStats: Array<WorkOrderStats>;
  workOrders: Array<WorkOrder>;
  workOrdersFiltered: WorkOrderPaginatedResponse;
};


export type QueryAbsenceReasonArgs = {
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

export type RegisterDeviceTokenInput = {
  /** El nombre del dispositivo */
  deviceName?: InputMaybe<Scalars['String']['input']>;
  /** El token de dispositivo */
  fcmToken: Scalars['String']['input'];
  /** La plataforma del dispositivo */
  platform?: DevicePlatform;
};

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
};

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
  scheduleDate: Scalars['DateTime']['output'];
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
  brand?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  installationDate?: InputMaybe<Scalars['DateTime']['input']>;
  machinePhotoUrl?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  operationalManualUrl?: InputMaybe<Scalars['String']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  subAreaId?: InputMaybe<Scalars['String']['input']>;
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

export type UpdateMaterialRequestInput = {
  comments?: InputMaybe<Scalars['String']['input']>;
  isGenericOrAlternativeModel?: InputMaybe<Scalars['Boolean']['input']>;
  justification?: InputMaybe<Scalars['String']['input']>;
  machineId?: InputMaybe<Scalars['ID']['input']>;
  priority?: InputMaybe<MaterialRequestPriority>;
  requestText?: InputMaybe<Scalars['String']['input']>;
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
  roleId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkOrderInput = {
  assignedShiftId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  /** Máquina asociada (requerida si stopType = BREAKDOWN o la OT tiene sub-área) */
  machineId?: InputMaybe<Scalars['ID']['input']>;
  maintenanceType?: InputMaybe<MaintenanceType>;
  observations?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<WorkOrderPriority>;
  stopType?: InputMaybe<StopType>;
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
  role: Role;
  roleId: Scalars['ID']['output'];
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
  description: Scalars['String']['output'];
  downtimeMinutes?: Maybe<Scalars['Int']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  findingId?: Maybe<Scalars['ID']['output']>;
  folio: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isFullySigned: Scalars['Boolean']['output'];
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
  /** Búsqueda por folio o descripción */
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<WorkOrderStatus>;
  statuses?: InputMaybe<Array<WorkOrderStatus>>;
  technicianId?: InputMaybe<Scalars['ID']['input']>;
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

export type WorkOrderSortInput = {
  field?: Scalars['String']['input'];
  order?: Scalars['String']['input'];
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

export type GetAreasQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAreasQuery = { __typename?: 'Query', areas: Array<(
    { __typename?: 'Area' }
    & { ' $fragmentRefs'?: { 'AreaBasicFragment': AreaBasicFragment } }
  )> };

export type GetSubAreasByAreaQueryVariables = Exact<{
  areaId: Scalars['ID']['input'];
}>;


export type GetSubAreasByAreaQuery = { __typename?: 'Query', subAreasByArea: Array<(
    { __typename?: 'SubArea' }
    & { ' $fragmentRefs'?: { 'SubAreaBasicFragment': SubAreaBasicFragment } }
  )> };

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

export type GetTechniciansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTechniciansQuery = { __typename?: 'Query', techniciansActive: Array<(
    { __typename?: 'Technician' }
    & { ' $fragmentRefs'?: { 'TechnicianBasicFragment': TechnicianBasicFragment } }
  )> };

export type GetShiftsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShiftsQuery = { __typename?: 'Query', shiftsActive: Array<{ __typename?: 'Shift', id: string, name: string, startTime: string, endTime: string, isActive: boolean }> };

export type GetMachinesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMachinesQuery = { __typename?: 'Query', machinesActive: Array<(
    { __typename?: 'Machine', subAreaId: string }
    & { ' $fragmentRefs'?: { 'MachineBasicFragment': MachineBasicFragment } }
  )> };

export type GetDashboardDataQueryVariables = Exact<{
  input: DashboardInput;
}>;


export type GetDashboardDataQuery = { __typename?: 'Query', dashboardData: { __typename?: 'DashboardData', generatedAt: string, kpis: { __typename?: 'DashboardKpis', activeBacklog: number, leadTimeHoursAvg: number, mttrHoursAvg: number, preventiveComplianceRate: number }, charts: { __typename?: 'DashboardCharts', downtimeByAreaTop5: Array<{ __typename?: 'AreaMetric', areaId: string, areaName: string, value: number }>, findingsConversion: Array<{ __typename?: 'KeyValue', key: string, value: number }>, maintenanceMixByPeriod: Array<{ __typename?: 'MixPoint', period: string, type: string, count: number }>, throughputByWeek: Array<{ __typename?: 'TimeCount', period: string, count: number }> }, rankings: { __typename?: 'DashboardRankings', topMachinesByDowntime: Array<{ __typename?: 'MachineMetric', machineId: string, machineName: string, value: number }>, topTechniciansByClosures: Array<{ __typename?: 'TechnicianMetric', technicianId: string, technicianName: string, value: number }> } } };

export type RoleBasicFragment = { __typename?: 'Role', id: string, name: string } & { ' $fragmentName'?: 'RoleBasicFragment' };

export type UserBasicFragment = { __typename?: 'User', id: string, employeeNumber: string, firstName: string, lastName: string, fullName: string, email?: string | null, isActive: boolean, role: (
    { __typename?: 'Role' }
    & { ' $fragmentRefs'?: { 'RoleBasicFragment': RoleBasicFragment } }
  ) } & { ' $fragmentName'?: 'UserBasicFragment' };

export type AreaBasicFragment = { __typename?: 'Area', id: string, name: string, type: AreaType, description?: string | null, isActive: boolean } & { ' $fragmentName'?: 'AreaBasicFragment' };

export type SubAreaBasicFragment = { __typename?: 'SubArea', id: string, name: string, description?: string | null, isActive: boolean, areaId: string } & { ' $fragmentName'?: 'SubAreaBasicFragment' };

export type MachineBasicFragment = { __typename?: 'Machine', id: string, name: string, code: string, serialNumber?: string | null, isActive: boolean } & { ' $fragmentName'?: 'MachineBasicFragment' };

export type PositionBasicFragment = { __typename?: 'Position', id: string, name: string, description?: string | null, isActive: boolean } & { ' $fragmentName'?: 'PositionBasicFragment' };

export type TechnicianBasicFragment = { __typename?: 'Technician', id: string, isActive: boolean, user: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'UserBasicFragment': UserBasicFragment } }
  ), position: (
    { __typename?: 'Position' }
    & { ' $fragmentRefs'?: { 'PositionBasicFragment': PositionBasicFragment } }
  ) } & { ' $fragmentName'?: 'TechnicianBasicFragment' };

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

export type WorkOrderItemFragment = { __typename?: 'WorkOrder', id: string, folio: string, description: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, stopType?: StopType | null, assignedShiftId?: string | null, machineId?: string | null, createdAt: string, isFullySigned: boolean, area: (
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
}>;


export type GetWorkOrdersFilteredQuery = { __typename?: 'Query', workOrdersFiltered: { __typename?: 'WorkOrderPaginatedResponse', total: number, data: Array<(
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


export type AssignWorkOrderMutation = { __typename?: 'Mutation', assignWorkOrder: { __typename?: 'WorkOrder', id: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, stopType?: StopType | null } };

export type UploadWorkOrderPhotoMutationVariables = Exact<{
  input: CreateWorkOrderPhotoInput;
}>;


export type UploadWorkOrderPhotoMutation = { __typename?: 'Mutation', uploadWorkOrderPhoto: { __typename?: 'WorkOrderPhoto', id: string, filePath: string } };

export type GetWorkOrderByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWorkOrderByIdQuery = { __typename?: 'Query', workOrder?: (
    { __typename?: 'WorkOrder', cause?: string | null, actionTaken?: string | null, toolsUsed?: string | null, observations?: string | null, functionalTimeMinutes: number, downtimeMinutes?: number | null, breakdownDescription?: string | null, startDate?: string | null, endDate?: string | null, pauseReason?: string | null, signatures: Array<{ __typename?: 'WorkOrderSignature', id: string, signatureImagePath: string, signedAt: string, signer: { __typename?: 'User', id: string, firstName: string, lastName: string, role: { __typename?: 'Role', name: string } } }>, photos: Array<{ __typename?: 'WorkOrderPhoto', id: string, photoType: PhotoType, filePath: string }> }
    & { ' $fragmentRefs'?: { 'WorkOrderItemFragment': WorkOrderItemFragment } }
  ) | null };

export type SignWorkOrderMutationVariables = Exact<{
  input: CreateWorkOrderSignatureInput;
}>;


export type SignWorkOrderMutation = { __typename?: 'Mutation', signWorkOrder: { __typename?: 'WorkOrderSignature', id: string, signatureImagePath: string, signedAt: string, workOrderId: string, signer: { __typename?: 'User', id: string, firstName: string, lastName: string, role: { __typename?: 'Role', name: string } } } };

export type AssignTechnicianMutationVariables = Exact<{
  input: AssignTechnicianInput;
}>;


export type AssignTechnicianMutation = { __typename?: 'Mutation', assignTechnician: { __typename?: 'WorkOrderTechnician', id: string, isLead: boolean, technician: { __typename?: 'User', id: string, firstName: string, lastName: string } } };

export type UpdateWorkOrderMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateWorkOrderInput;
}>;


export type UpdateWorkOrderMutation = { __typename?: 'Mutation', updateWorkOrder: { __typename?: 'WorkOrder', id: string, status: WorkOrderStatus, priority?: WorkOrderPriority | null, maintenanceType?: MaintenanceType | null, stopType?: StopType | null, assignedShiftId?: string | null, machineId?: string | null } };

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


export type CompleteWorkOrderMutation = { __typename?: 'Mutation', completeWorkOrder: { __typename?: 'WorkOrder', id: string, downtimeMinutes?: number | null, cause?: string | null, actionTaken?: string | null, toolsUsed?: string | null, observations?: string | null, status: WorkOrderStatus } };

export const RoleBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<RoleBasicFragment, unknown>;
export const UserBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<UserBasicFragment, unknown>;
export const PositionBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Position"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<PositionBasicFragment, unknown>;
export const TechnicianBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TechnicianBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Technician"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Position"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<TechnicianBasicFragment, unknown>;
export const NotificationItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<NotificationItemFragment, unknown>;
export const AreaBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<AreaBasicFragment, unknown>;
export const SubAreaBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}}]} as unknown as DocumentNode<SubAreaBasicFragment, unknown>;
export const MachineBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<MachineBasicFragment, unknown>;
export const WorkOrderItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}}]} as unknown as DocumentNode<WorkOrderItemFragment, unknown>;
export const GetAreasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAreas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<GetAreasQuery, GetAreasQueryVariables>;
export const GetSubAreasByAreaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSubAreasByArea"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subAreasByArea"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"areaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}}]} as unknown as DocumentNode<GetSubAreasByAreaQuery, GetSubAreasByAreaQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"employeeNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"employeeNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"employeeNumber"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const GetTechniciansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTechnicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"techniciansActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TechnicianBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PositionBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Position"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TechnicianBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Technician"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"position"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PositionBasic"}}]}}]}}]} as unknown as DocumentNode<GetTechniciansQuery, GetTechniciansQueryVariables>;
export const GetShiftsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShifts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shiftsActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<GetShiftsQuery, GetShiftsQueryVariables>;
export const GetMachinesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMachines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"machinesActive"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}},{"kind":"Field","name":{"kind":"Name","value":"subAreaId"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]} as unknown as DocumentNode<GetMachinesQuery, GetMachinesQueryVariables>;
export const GetDashboardDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDashboardData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DashboardInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeBacklog"}},{"kind":"Field","name":{"kind":"Name","value":"leadTimeHoursAvg"}},{"kind":"Field","name":{"kind":"Name","value":"mttrHoursAvg"}},{"kind":"Field","name":{"kind":"Name","value":"preventiveComplianceRate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"charts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"downtimeByAreaTop5"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areaId"}},{"kind":"Field","name":{"kind":"Name","value":"areaName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"findingsConversion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceMixByPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"throughputByWeek"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"rankings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"topMachinesByDowntime"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"machineName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topTechniciansByClosures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"technicianId"}},{"kind":"Field","name":{"kind":"Name","value":"technicianName"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetDashboardDataQuery, GetDashboardDataQueryVariables>;
export const MyNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"NotificationItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"unreadCount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"NotificationItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Notification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<MyNotificationsQuery, MyNotificationsQueryVariables>;
export const MarkNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"readAt"}}]}}]}}]} as unknown as DocumentNode<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkAllNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;
export const MyRequestedWorkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyRequestedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myRequestedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<MyRequestedWorkOrdersQuery, MyRequestedWorkOrdersQueryVariables>;
export const MyAssignedWorkOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAssignedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAssignedWorkOrders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<MyAssignedWorkOrdersQuery, MyAssignedWorkOrdersQueryVariables>;
export const GetWorkOrdersFilteredDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkOrdersFiltered"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrderStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"priority"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrderPriority"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workOrdersFiltered"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"priority"},"value":{"kind":"Variable","name":{"kind":"Name","value":"priority"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}},{"kind":"ObjectField","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<GetWorkOrdersFilteredQuery, GetWorkOrdersFilteredQueryVariables>;
export const CreateWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateWorkOrderMutation, CreateWorkOrderMutationVariables>;
export const AssignWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}}]}}]}}]} as unknown as DocumentNode<AssignWorkOrderMutation, AssignWorkOrderMutationVariables>;
export const UploadWorkOrderPhotoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UploadWorkOrderPhoto"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkOrderPhotoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadWorkOrderPhoto"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}}]}}]}}]} as unknown as DocumentNode<UploadWorkOrderPhotoMutation, UploadWorkOrderPhotoMutationVariables>;
export const GetWorkOrderByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWorkOrderById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkOrderItem"}},{"kind":"Field","name":{"kind":"Name","value":"cause"}},{"kind":"Field","name":{"kind":"Name","value":"actionTaken"}},{"kind":"Field","name":{"kind":"Name","value":"toolsUsed"}},{"kind":"Field","name":{"kind":"Name","value":"observations"}},{"kind":"Field","name":{"kind":"Name","value":"downtimeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"breakdownDescription"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"pauseReason"}},{"kind":"Field","name":{"kind":"Name","value":"signatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"signatureImagePath"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}},{"kind":"Field","name":{"kind":"Name","value":"signer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"photoType"}},{"kind":"Field","name":{"kind":"Name","value":"filePath"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Area"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SubAreaBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SubArea"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"areaId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MachineBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Machine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"serialNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RoleBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employeeNumber"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RoleBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkOrderItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"folio"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"isFullySigned"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subArea"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SubAreaBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"machine"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MachineBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"requester"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}},{"kind":"Field","name":{"kind":"Name","value":"technicians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserBasic"}}]}}]}}]}}]} as unknown as DocumentNode<GetWorkOrderByIdQuery, GetWorkOrderByIdQueryVariables>;
export const SignWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateWorkOrderSignatureInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"signatureImagePath"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}},{"kind":"Field","name":{"kind":"Name","value":"workOrderId"}},{"kind":"Field","name":{"kind":"Name","value":"signer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SignWorkOrderMutation, SignWorkOrderMutationVariables>;
export const AssignTechnicianDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignTechnician"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssignTechnicianInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignTechnician"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isLead"}},{"kind":"Field","name":{"kind":"Name","value":"technician"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}}]}}]}}]}}]} as unknown as DocumentNode<AssignTechnicianMutation, AssignTechnicianMutationVariables>;
export const UpdateWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"maintenanceType"}},{"kind":"Field","name":{"kind":"Name","value":"stopType"}},{"kind":"Field","name":{"kind":"Name","value":"assignedShiftId"}},{"kind":"Field","name":{"kind":"Name","value":"machineId"}}]}}]}}]} as unknown as DocumentNode<UpdateWorkOrderMutation, UpdateWorkOrderMutationVariables>;
export const ResumeWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResumeWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumeWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ResumeWorkOrderMutation, ResumeWorkOrderMutationVariables>;
export const StartWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StartWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"breakdownDescription"}}]}}]}}]} as unknown as DocumentNode<StartWorkOrderMutation, StartWorkOrderMutationVariables>;
export const PauseWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PauseWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PauseWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pauseWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pauseReason"}}]}}]}}]} as unknown as DocumentNode<PauseWorkOrderMutation, PauseWorkOrderMutationVariables>;
export const CompleteWorkOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteWorkOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompleteWorkOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeWorkOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"downtimeMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"cause"}},{"kind":"Field","name":{"kind":"Name","value":"actionTaken"}},{"kind":"Field","name":{"kind":"Name","value":"toolsUsed"}},{"kind":"Field","name":{"kind":"Name","value":"observations"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CompleteWorkOrderMutation, CompleteWorkOrderMutationVariables>;