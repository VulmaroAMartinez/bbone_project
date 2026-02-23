import { cn } from '@/lib/utils';
import type { WorkOrderStatus, WorkOrderPriority, MaintenanceType, StopType } from '@/lib/graphql/generated/graphql';

// Configuración de estados de OT
const statusConfig: Record<WorkOrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pendiente',
    className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  },
  IN_PROGRESS: {
    label: 'En Progreso',
    className: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  },
  COMPLETED: {
    label: 'Completada',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  TEMPORARY_REPAIR: {
    label: 'Reparación Temporal',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  PAUSED: {
    label: 'Pausada',
    className: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  },
};

// Configuración de prioridades
const priorityConfig: Record<WorkOrderPriority, { label: string; className: string }> = {
  CRITICAL: {
    label: 'Crítica',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  HIGH: {
    label: 'Alta',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  MEDIUM: {
    label: 'Media',
    className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  },
  LOW: {
    label: 'Baja',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
};

// Configuración de tipos de mantenimiento
const maintenanceTypeConfig: Record<MaintenanceType, { label: string; className: string }> = {
  CORRECTIVE_EMERGENT: {
    label: 'Correctivo emergente',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  PREVENTIVE: {
    label: 'Preventivo',
    className: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  },
  FINDING: {
    label: 'Hallazgo',
    className: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  },
  CORRECTIVE_SCHEDULED: {
    label: 'Correctivo programado',
    className: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  }
};

interface StatusBadgeProps {
  status: WorkOrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: WorkOrderPriority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

interface MaintenanceTypeBadgeProps {
  type: MaintenanceType;
  size?: 'sm' | 'md';
}

export function MaintenanceTypeBadge({ type, size = 'md' }: MaintenanceTypeBadgeProps) {
  const config = maintenanceTypeConfig[type];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

// Función auxiliar para obtener label de estado
export function getStatusLabel(status: WorkOrderStatus): string {
  return statusConfig[status]?.label || status;
}

// Función auxiliar para obtener label de prioridad
export function getPriorityLabel(priority: WorkOrderPriority): string {
  return priorityConfig[priority]?.label || priority;
}

// Función auxiliar para obtener label de tipo de mantenimiento
export function getMaintenanceTypeLabel(type: MaintenanceType): string {
  return maintenanceTypeConfig[type]?.label || type;
}

// Configuración de tipos de parada
const stopTypeConfig: Record<StopType, { label: string; className: string }> = {
  BREAKDOWN: {
    label: 'Avería',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  OTHER: {
    label: 'Otro',
    className: 'bg-muted/60 text-muted-foreground border-border',
  },
};

interface StopTypeBadgeProps {
  stopType: StopType;
  size?: 'sm' | 'md';
}

/** Renders a localized badge for the work order stop type. */
export function StopTypeBadge({ stopType, size = 'md' }: StopTypeBadgeProps) {
  const config = stopTypeConfig[stopType];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

/** Returns the Spanish label for a given stop type. */
export function getStopTypeLabel(stopType: StopType): string {
  return stopTypeConfig[stopType]?.label ?? stopType;
}
