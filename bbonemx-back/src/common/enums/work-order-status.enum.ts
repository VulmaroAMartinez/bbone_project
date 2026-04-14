import { registerEnumType } from '@nestjs/graphql';

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  COMPLETED = 'COMPLETED',
  TEMPORARY_REPAIR = 'TEMPORARY_REPAIR',
  CANCELLED = 'CANCELLED',
}

registerEnumType(WorkOrderStatus, {
  name: 'WorkOrderStatus',
  description: 'Estados posibles de una orden de trabajo',
  valuesMap: {
    PENDING: {
      description: 'Pendiente - OT creada, esperando asignación o inicio',
    },
    IN_PROGRESS: { description: 'En progreso - Técnico trabajando en la WO' },
    PAUSED: { description: 'Pausada - En espera de material u otra razón' },
    FINISHED: { description: 'Finalizada - El técnico terminó el trabajo' },
    COMPLETED: { description: 'Completada - Trabajo finalizado y firmado' },
    TEMPORARY_REPAIR: {
      description: 'Reparación temporal - Solución provisional aplicada',
    },
    CANCELLED: { description: 'Cancelada - OT anulada por el administrador' },
  },
});
