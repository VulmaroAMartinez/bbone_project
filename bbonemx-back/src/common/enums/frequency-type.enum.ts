import { registerEnumType } from '@nestjs/graphql';

/**
 * Tipo de frecuencia para tareas preventivas.
 * Según diseño BD: DAILY, WEEKLY, MONTHLY, CUSTOM
 */
export enum FrequencyType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

registerEnumType(FrequencyType, {
  name: 'FrequencyType',
  description: 'Tipo de frecuencia para tareas preventivas',
  valuesMap: {
    DAILY: { description: 'Diario' },
    WEEKLY: { description: 'Semanal' },
    MONTHLY: { description: 'Mensual' },
    CUSTOM: { description: 'Personalizado (cada N días/horas)' },
  },
});
