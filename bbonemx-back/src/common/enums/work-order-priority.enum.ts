import { registerEnumType } from '@nestjs/graphql';

export enum WorkOrderPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

registerEnumType(WorkOrderPriority, {
  name: 'WorkOrderPriority',
  description: 'Niveles de prioridad de una orden de trabajo',
  valuesMap: {
    LOW: { description: 'Prioridad baja (1)' },
    MEDIUM: { description: 'Prioridad media (2)' },
    HIGH: { description: 'Prioridad alta (3)' },
    CRITICAL: { description: 'Prioridad crítica (4)' },
  },
});
