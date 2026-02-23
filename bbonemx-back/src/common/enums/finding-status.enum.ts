import { registerEnumType } from '@nestjs/graphql';

export enum FindingStatus {
  OPEN = 'OPEN',
  CONVERTED_TO_WO = 'CONVERTED_TO_WO',
}

registerEnumType(FindingStatus, {
  name: 'FindingStatus',
  description: 'Estados posibles de un hallazgo',
  valuesMap: {
    OPEN: { description: 'Abierto - Hallazgo registrado pendiente de acción' },
    CONVERTED_TO_WO: { description: 'Convertido a OT - Se generó una orden de trabajo' },
  },
});
