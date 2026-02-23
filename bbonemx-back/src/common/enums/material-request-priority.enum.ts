import { registerEnumType } from '@nestjs/graphql';

export enum MaterialRequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

registerEnumType(MaterialRequestPriority, {
  name: 'MaterialRequestPriority',
  description: 'Prioridad de solicitud de material',
  valuesMap: {
    LOW: { description: 'Baja' },
    MEDIUM: { description: 'Media' },
    HIGH: { description: 'Alta' },
    CRITICAL: { description: 'Crítica' },
  },
});
