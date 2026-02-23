import { registerEnumType } from '@nestjs/graphql';

export enum StopType {
  BREAKDOWN = 'BREAKDOWN',
  OTHER = 'OTHER',
}

registerEnumType(StopType, {
  name: 'StopType',
  description: 'Tipo de parada de la orden de trabajo',
  valuesMap: {
    BREAKDOWN: { description: 'Avería - Requiere campos adicionales de diagnóstico' },
    OTHER: { description: 'Otro tipo de actividad' },
  },
});
