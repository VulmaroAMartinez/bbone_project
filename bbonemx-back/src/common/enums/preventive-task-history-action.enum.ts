import { registerEnumType } from '@nestjs/graphql';

/**
 * Acciones registradas en el historial de tareas preventivas.
 * Según diseño BD: CREATED, UPDATED, DEACTIVATED, CLOSED, POLICY_CHANGE
 */
export enum PreventiveTaskHistoryAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DEACTIVATED = 'DEACTIVATED',
  CLOSED = 'CLOSED',
  POLICY_CHANGE = 'POLICY_CHANGE',
}

registerEnumType(PreventiveTaskHistoryAction, {
  name: 'PreventiveTaskHistoryAction',
  description: 'Tipo de acción registrada en el historial de tareas preventivas',
  valuesMap: {
    CREATED: { description: 'Tarea creada' },
    UPDATED: { description: 'Tarea actualizada' },
    DEACTIVATED: { description: 'Tarea desactivada' },
    CLOSED: { description: 'Tarea cerrada' },
    POLICY_CHANGE: { description: 'Cambio de política' },
  },
});
