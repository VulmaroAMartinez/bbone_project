import { registerEnumType } from '@nestjs/graphql';

/**
 * Unidad de frecuencia para tareas preventivas personalizadas.
 * Según diseño BD: DAYS, HOURS
 */
export enum FrequencyUnit {
  DAYS = 'DAYS',
  HOURS = 'HOURS',
}

registerEnumType(FrequencyUnit, {
  name: 'FrequencyUnit',
  description: 'Unidad de frecuencia para tareas preventivas',
  valuesMap: {
    DAYS: { description: 'Días' },
    HOURS: { description: 'Horas' },
  },
});
