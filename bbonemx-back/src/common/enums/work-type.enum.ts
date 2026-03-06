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
});
