import { registerEnumType } from '@nestjs/graphql';

export enum RequestPriority {
  URGENT = 'URGENT',
  SCHEDULED = 'SCHEDULED',
}

export enum RequestImportance {
  VERY_IMPORTANT = 'VERY_IMPORTANT',
  IMPORTANT = 'IMPORTANT',
  UNIMPORTANT = 'UNIMPORTANT',
}

export enum RequestCategory {
  EQUIPMENT = 'EQUIPMENT',
  PPE = 'PPE',
  TOOLS = 'TOOLS',
  MATERIAL_WITH_SKU = 'MATERIAL_WITH_SKU',
  NON_INVENTORY_MATERIAL = 'NON_INVENTORY_MATERIAL',
  REQUEST_SKU_MATERIAL = 'REQUEST_SKU_MATERIAL',
  SPARE_PART_WITH_SKU = 'SPARE_PART_WITH_SKU',
  NON_INVENTORY_SPARE_PART = 'NON_INVENTORY_SPARE_PART',
  REQUEST_SKU_SPARE_PART = 'REQUEST_SKU_SPARE_PART',
  UPDATE_SKU = 'UPDATE_SKU',
  SERVICE = 'SERVICE',
  SERVICE_WITH_MATERIAL = 'SERVICE_WITH_MATERIAL',
}

registerEnumType(RequestPriority, {
  name: 'RequestPriority',
  description: 'Prioridad de la solicitud',
  valuesMap: {
    URGENT: { description: 'Urgente' },
    SCHEDULED: { description: 'Programada' },
  },
});

registerEnumType(RequestImportance, {
  name: 'RequestImportance',
  description: 'Importancia de la solicitud',
  valuesMap: {
    VERY_IMPORTANT: { description: 'Muy importante' },
    IMPORTANT: { description: 'Importante' },
    UNIMPORTANT: { description: 'poco importante' },
  },
});

registerEnumType(RequestCategory, {
  name: 'RequestCategory',
  description: 'Categoría de la solicitud',
  valuesMap: {
    EQUIPMENT: { description: 'Equipo' },
    PPE: { description: 'Protección personal' },
    TOOLS: { description: 'Herramientas' },
    MATERIAL_WITH_SKU: { description: 'Material con SKU' },
    NON_INVENTORY_MATERIAL: { description: 'Material noInventariado' },
    REQUEST_SKU_MATERIAL: { description: 'Solicitud de material con SKU' },
    SPARE_PART_WITH_SKU: { description: 'Pieza de repuesto con SKU' },
    NON_INVENTORY_SPARE_PART: {
      description: 'Pieza de repuesto noInventariada',
    },
    REQUEST_SKU_SPARE_PART: {
      description: 'Solicitud de pieza de repuesto con SKU',
    },
    UPDATE_SKU: { description: 'Actualización de SKU' },
    SERVICE: { description: 'Servicio' },
    SERVICE_WITH_MATERIAL: { description: 'Servicio con material' },
  },
});
