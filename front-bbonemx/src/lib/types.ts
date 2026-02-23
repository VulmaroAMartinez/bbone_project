/**
 * BB Maintenance - Sistema de Gestión de Mantenimiento Industrial
 * Definiciones de tipos TypeScript


// Roles del sistema
export type UserRole = 'solicitante' | 'tecnico' | 'administrador';

// Estados de órdenes de trabajo
export type OTStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';

// Tipos de mantenimiento
export type MaintenanceType = 'preventivo' | 'correctivo' | 'predictivo';

// Prioridades
export type Priority = 'alta' | 'media' | 'baja';

// Tipos de paro
export type StoppageType = 'programado' | 'no_programado' | 'emergencia' | 'ninguno';

// Usuario del sistema
export interface User {
  id: string;
  employeeNumber: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

// Área de trabajo
export interface Area {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// Orden de Trabajo (OT)
export interface WorkOrder {
  id: string;
  folioNumber: string;
  createdAt: string;
  updatedAt: string;
  
  // Campos del área
  areaId: string;
  area?: Area;
  
  // Campos del solicitante
  activityDescription: string;
  photo?: string;
  requesterId: string;
  requester?: User;
  
  // Campos del administrador
  priority?: Priority;
  maintenanceType?: MaintenanceType;
  status: OTStatus;
  stoppageType?: StoppageType;
  assignedTechnicianId?: string;
  assignedTechnician?: User;
  adminSignature?: string;
  signedAt?: string;
  signedBy?: string;
  
  // Campos del técnico
  failureDescription?: string;
  cause?: string;
  actionSolution?: string;
  downtime?: number; // en minutos
  startTime?: string;
  endTime?: string;
  notes?: string;
  machine?: string;
  toolsUsed?: string;
  partsMaterialsUsed?: string;
}

// Turno de trabajo
export interface WorkShift {
  id: string;
  technicianId: string;
  technician?: User;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: string;
}

// Notificación
export interface Notification {
  id: string;
  userId: string;
  type: 'ot_created' | 'ot_assigned' | 'ot_status_changed' | 'ot_completed';
  title: string;
  message: string;
  read: boolean;
  workOrderId?: string;
  createdAt: string;
}

// Contexto de autenticación
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (employeeNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Contexto de notificaciones
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

// Estadísticas para el dashboard
export interface DashboardStats {
  totalOTs: number;
  pendingOTs: number;
  inProgressOTs: number;
  completedOTs: number;
  cancelledOTs: number;
  avgResolutionTime: number; // en horas
  otsByTechnician: { technicianId: string; name: string; count: number }[];
  otsByPriority: { priority: Priority; count: number }[];
  otsByMaintenanceType: { type: MaintenanceType; count: number }[];
  weeklyTrend: { date: string; count: number }[];
}

// Formulario de creación de OT
export interface CreateOTForm {
  areaId: string;
  activityDescription: string;
  photo?: File | string;
}

// Formulario de actualización de OT (Admin)
export interface UpdateOTAdminForm {
  priority?: Priority;
  maintenanceType?: MaintenanceType;
  status?: OTStatus;
  stoppageType?: StoppageType;
  assignedTechnicianId?: string;
}

// Formulario de actualización de OT (Técnico)
export interface UpdateOTTechnicianForm {
  failureDescription?: string;
  cause?: string;
  actionSolution?: string;
  downtime?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  machine?: string;
  toolsUsed?: string;
  partsMaterialsUsed?: string;
  status?: 'en_progreso' | 'completada';
}

// Formulario de turno de trabajo
export interface CreateShiftForm {
  technicianId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}
 */

export enum UserRole {
    ADMIN = 'ADMIN',
    TECHNICIAN = 'TECHNICIAN',
    REQUESTER = 'REQUESTER',
}

export type AllowedRole = UserRole | string;