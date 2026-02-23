import { registerEnumType } from '@nestjs/graphql';

/**
 * Estado de una tarea preventiva.
 * Según diseño BD: ACTIVE, INACTIVE, CLOSED
 */
export enum PreventiveTaskStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
}

registerEnumType(PreventiveTaskStatus, {
  name: 'PreventiveTaskStatus',
  description: 'Estado de una tarea preventiva',
  valuesMap: {
    ACTIVE: { description: 'Activa - Generando WOs según programación' },
    INACTIVE: { description: 'Inactiva - Pausada temporalmente' },
    CLOSED: { description: 'Cerrada - Terminada por cambio de política' },
  },
});
