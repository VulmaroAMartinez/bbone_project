import { registerEnumType } from '@nestjs/graphql';

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  TEMPORARY_REPAIR = 'TEMPORARY_REPAIR',
}

registerEnumType(WorkOrderStatus, {
  name: 'WorkOrderStatus',
  description: 'Estados posibles de una orden de trabajo',
  valuesMap: {
    PENDING: { description: 'Pendiente - OT creada, esperando asignación o inicio' },
    IN_PROGRESS: { description: 'En progreso - Técnico trabajando en la WO' },
    PAUSED: { description: 'Pausada - En espera de material u otra razón' },
    COMPLETED: { description: 'Completada - Trabajo finalizado' },
    TEMPORARY_REPAIR: { description: 'Reparación temporal - Solución provisional aplicada' },
  },
});
