import { registerEnumType } from '@nestjs/graphql';

export enum MaterialRequestImportance {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

registerEnumType(MaterialRequestImportance, {
  name: 'MaterialRequestImportance',
  description: 'Importancia del material en la solicitud',
  valuesMap: {
    LOW: { description: 'Baja' },
    MEDIUM: { description: 'Media' },
    HIGH: { description: 'Alta' },
    CRITICAL: { description: 'Crítica' },
  },
});
