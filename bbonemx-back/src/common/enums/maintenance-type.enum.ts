import { registerEnumType } from '@nestjs/graphql';

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE_EMERGENT = 'CORRECTIVE_EMERGENT',
  CORRECTIVE_SCHEDULED = 'CORRECTIVE_SCHEDULED',
  FINDING = 'FINDING',
}

registerEnumType(MaintenanceType, {
  name: 'MaintenanceType',
  description: 'Tipos de mantenimiento',
  valuesMap: {
    PREVENTIVE: { description: 'Mantenimiento preventivo programado' },
    CORRECTIVE_EMERGENT: { description: 'Correctivo emergente - falla inesperada' },
    CORRECTIVE_SCHEDULED: { description: 'Correctivo programado' },
    FINDING: { description: 'Mantenimiento derivado de hallazgo' },
  },
});
