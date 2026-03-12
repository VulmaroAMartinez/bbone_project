import { registerEnumType } from '@nestjs/graphql';

export enum AreaType {
  PRODUCTION = 'PRODUCTION',
  OPERATIONAL = 'OPERATIONAL',
  SERVICE = 'SERVICE',
}

registerEnumType(AreaType, {
  name: 'AreaType',
  description: 'Tipo de área',
  valuesMap: {
    OPERATIONAL: { description: 'Área operativa - Puede tener sub-áreas y máquinas' },
    SERVICE: { description: 'Área de servicio - No tiene sub-áreas' },
    PRODUCTION: { description: 'Área de producción - Puede tener líneas (sub-áreas) y máquinas directas' },
  },
});
