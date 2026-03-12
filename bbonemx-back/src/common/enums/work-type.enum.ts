import { registerEnumType } from '@nestjs/graphql';

export enum WorkType {
  PAINTING = 'PAINTING',
  PNEUMATIC = 'PNEUMATIC',
  ELECTRONIC = 'ELECTRONIC',
  ELECTRICAL = 'ELECTRICAL',
  BUILDING = 'BUILDING',
  METROLOGY = 'METROLOGY',
  AUTOMATION = 'AUTOMATION',
  MECHANICAL = 'MECHANICAL',
  HYDRAULIC = 'HYDRAULIC',
  ELECTRICAL_CONTROL = 'ELECTRICAL_CONTROL',
  OTHER = 'OTHER',
}

registerEnumType(WorkType, {
  name: 'WorkType',
  description: 'Tipos de trabajo para órdenes de trabajo',
  valuesMap: {
    PAINTING:          { description: 'Pintura' },
    PNEUMATIC:         { description: 'Neumática' },
    ELECTRONIC:        { description: 'Electrónico' },
    ELECTRICAL:        { description: 'Eléctrico' },
    BUILDING:          { description: 'Edificio' },
    METROLOGY:         { description: 'Metrología' },
    AUTOMATION:        { description: 'Automatización' },
    MECHANICAL:        { description: 'Mecánico' },
    HYDRAULIC:         { description: 'Hidráulico' },
    ELECTRICAL_CONTROL:{ description: 'Control eléctrico' },
    OTHER:             { description: 'Otro' },
  },
});
