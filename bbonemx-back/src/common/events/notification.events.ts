/**
 * Eventos del sistema de notificaciones.
 * Los servicios emiten estos eventos y el NotificationDispatcherService los maneja.
 *
 * Flujo:
 *   WorkOrdersService.assign()     → emit('work_order.assigned', event)
 *   WorkOrdersService.complete()   → emit('work_order.completed', event)
 *   PreventiveTasksService         → emit('preventive_task.wo_generated', event)
 *   WorkOrdersResolver.create()    → emit('work_order.created_by_requester', event)
 */

export class WorkOrderAssignedEvent {
    constructor(
        /** ID de la orden de trabajo */
        public readonly workOrderId: string,
        /** Folio legible de la OT */
        public readonly workOrderFolio: string,
        /** Descripción de la OT */
        public readonly description: string,
        /** IDs de técnicos asignados (usuarios) */
        public readonly technicianUserIds: string[],
        /** ID del admin que asignó */
        public readonly assignedByUserId: string,
    ) {}
}

export class WorkOrderCompletedEvent {
    constructor(
        public readonly workOrderId: string,
        public readonly workOrderFolio: string,
        public readonly description: string,
        /** COMPLETED | TEMPORARY_REPAIR */
        public readonly finalStatus: string,
        /** ID del técnico que completó */
        public readonly completedByUserId: string,
        /** ID del solicitante de la OT */
        public readonly requesterUserId: string,
    ) {}
}

export class PreventiveTaskWoGeneratedEvent {
    constructor(
        public readonly preventiveTaskId: string,
        public readonly workOrderId: string,
        public readonly workOrderFolio: string,
        public readonly taskDescription: string,
    ) {}
}

export class WorkOrderCreatedByRequesterEvent {
    constructor(
        public readonly workOrderId: string,
        public readonly workOrderFolio: string,
        public readonly description: string,
        /** ID del requester que creó la OT */
        public readonly requesterUserId: string,
        /** Nombre del requester */
        public readonly requesterName: string,
    ) {}
}

/** Constantes de nombres de eventos para el EventEmitter */
export const NOTIFICATION_EVENTS = {
    WORK_ORDER_ASSIGNED: 'notification.work_order.assigned',
    WORK_ORDER_COMPLETED: 'notification.work_order.completed',
    PREVENTIVE_TASK_WO_GENERATED: 'notification.preventive_task.wo_generated',
    WORK_ORDER_CREATED_BY_REQUESTER: 'notification.work_order.created_by_requester',
} as const;
