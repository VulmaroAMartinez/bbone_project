import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  /** Técnico asignado a una OT */
  WORK_ORDER_ASSIGNED = 'WORK_ORDER_ASSIGNED',

  /** OT completada — recordatorio para firmar (Admin + Requester) */
  WORK_ORDER_COMPLETED = 'WORK_ORDER_COMPLETED',

  /** OT reparación temporal — recordatorio para firmar (Admin + Requester) */
  WORK_ORDER_TEMPORARY_REPAIR = 'WORK_ORDER_TEMPORARY_REPAIR',

  /** Tarea preventiva generó una OT (Admin) */
  PREVENTIVE_TASK_WO_GENERATED = 'PREVENTIVE_TASK_WO_GENERATED',

  /** Requester creó una OT (Admin) */
  WORK_ORDER_CREATED_BY_REQUESTER = 'WORK_ORDER_CREATED_BY_REQUESTER',

  /** OT rechazada por no-conformidad — técnicos deben re-trabajar */
  WORK_ORDER_NON_CONFORMITY = 'WORK_ORDER_NON_CONFORMITY',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'Tipos de notificación del sistema',
  valuesMap: {
    WORK_ORDER_ASSIGNED: { description: 'Técnico asignado a una OT' },
    WORK_ORDER_COMPLETED: {
      description: 'OT completada — recordatorio para firmar',
    },
    WORK_ORDER_TEMPORARY_REPAIR: {
      description: 'OT reparación temporal — recordatorio para firmar',
    },
    PREVENTIVE_TASK_WO_GENERATED: {
      description: 'Tarea preventiva generó una OT',
    },
    WORK_ORDER_CREATED_BY_REQUESTER: {
      description: 'Requester creó una nueva OT',
    },
    WORK_ORDER_NON_CONFORMITY: {
      description: 'OT rechazada por no-conformidad — re-trabajo requerido',
    },
  },
});
