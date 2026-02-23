import { registerEnumType } from '@nestjs/graphql';

export enum AreaType {
  OPERATIONAL = 'OPERATIONAL',
  SERVICE = 'SERVICE',
}

registerEnumType(AreaType, {
  name: 'AreaType',
  description: 'Tipo de área',
  valuesMap: {
    OPERATIONAL: { description: 'Área operativa - Puede tener sub-áreas y máquinas' },
    SERVICE: { description: 'Área de servicio - No tiene sub-áreas' },
  },
});
