import { registerEnumType } from '@nestjs/graphql';

export enum ActivityStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

registerEnumType(ActivityStatus, {
  name: 'ActivityStatus',
  description: 'Estados posibles de una actividad de mantenimiento',
  valuesMap: {
    PENDING: { description: 'Pendiente' },
    IN_PROGRESS: { description: 'En progreso' },
    COMPLETED: { description: 'Realizado' },
  },
});
