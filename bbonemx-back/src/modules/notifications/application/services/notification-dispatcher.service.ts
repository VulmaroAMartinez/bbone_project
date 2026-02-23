import { Injectable, Inject, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PubSub } from "graphql-subscriptions";
import { NotificationsService } from "./notifications.service";
import { UserDeviceTokensService } from "./user-device-tokens.service";
import { NotificationPreferencesService } from "./notification-preferences.service";
import { FcmProvider, FcmMessage, NOTIFICATION_PUB_SUB, SUBSCRIPTION_TRIGGERS } from "../../infrastructure/providers";
import { NotificationType } from "src/common";
import { 
    NOTIFICATION_EVENTS, 
    WorkOrderAssignedEvent,  
    WorkOrderCompletedEvent,
    PreventiveTaskWoGeneratedEvent,
    WorkOrderCreatedByRequesterEvent,
} from "src/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/modules/users";


@Injectable()
export class NotificationDispatcherService {
    private readonly logger = new Logger(NotificationDispatcherService.name);

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly deviceTokensService: UserDeviceTokensService,
        private readonly preferencesService: NotificationPreferencesService,
        private readonly fcmProvider: FcmProvider,
        @Inject(NOTIFICATION_PUB_SUB) private readonly pubSub: PubSub,
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
    ) {}

    @OnEvent(NOTIFICATION_EVENTS.WORK_ORDER_ASSIGNED)
    async handleWorkOrderAssigned(event: WorkOrderAssignedEvent): Promise<void> {
        this.logger.log(`Evento: OT ${event.workOrderFolio} asignada a ${event.technicianUserIds.length} técnicos`);

        const type = NotificationType.WORK_ORDER_ASSIGNED;
        const title = 'Nueva OT asignada';
        const body = `Se te asignó la OT ${event.workOrderFolio}: ${this.truncate(event.description, 80)}`;
        const data = {
            workOrderId: event.workOrderId,
            workOrderFolio: event.workOrderFolio,
            type: 'WORK_ORDER_ASSIGNED',
            link: `/work-orders/${event.workOrderId}`,
        };

        await this.dispatchToUsers(event.technicianUserIds, type, title, body, data);
    }

    @OnEvent(NOTIFICATION_EVENTS.WORK_ORDER_COMPLETED)
    async handleWorkOrderCompleted(event: WorkOrderCompletedEvent): Promise<void> {
        const isTemporary = event.finalStatus === 'TEMPORARY_REPAIR';
        const type = isTemporary
            ? NotificationType.WORK_ORDER_TEMPORARY_REPAIR
            : NotificationType.WORK_ORDER_COMPLETED;

        const statusLabel = isTemporary ? 'reparación temporal' : 'completada';
        this.logger.log(`Evento: OT ${event.workOrderFolio} ${statusLabel}`);

        const title = isTemporary
            ? 'OT con reparación temporal — Firma requerida'
            : 'OT completada — Firma requerida';
        const body = `La OT ${event.workOrderFolio} fue marcada como ${statusLabel}. Se requiere su firma.`;
        const data = {
            workOrderId: event.workOrderId,
            workOrderFolio: event.workOrderFolio,
            type: type,
            link: `/work-orders/${event.workOrderId}/sign`,
        };

        // Recipients: todos los ADMIN + el requester de la OT
        const adminIds = await this.getUserIdsByRole('ADMIN');
        const recipientIds = [...new Set([...adminIds, event.requesterUserId])];

        await this.dispatchToUsers(recipientIds, type, title, body, data);
    }

    @OnEvent(NOTIFICATION_EVENTS.PREVENTIVE_TASK_WO_GENERATED)
    async handlePreventiveTaskWoGenerated(event: PreventiveTaskWoGeneratedEvent): Promise<void> {
        this.logger.log(`Evento: Tarea preventiva generó OT ${event.workOrderFolio}`);

        const type = NotificationType.PREVENTIVE_TASK_WO_GENERATED;
        const title = 'OT generada por mantenimiento preventivo';
        const body = `Se generó la OT ${event.workOrderFolio} desde tarea preventiva: ${this.truncate(event.taskDescription, 80)}`;
        const data = {
            workOrderId: event.workOrderId,
            workOrderFolio: event.workOrderFolio,
            preventiveTaskId: event.preventiveTaskId,
            type: 'PREVENTIVE_TASK_WO_GENERATED',
            link: `/work-orders/${event.workOrderId}`,
        };

        const adminIds = await this.getUserIdsByRole('ADMIN');
        await this.dispatchToUsers(adminIds, type, title, body, data);
    }

    @OnEvent(NOTIFICATION_EVENTS.WORK_ORDER_CREATED_BY_REQUESTER)
    async handleWorkOrderCreatedByRequester(event: WorkOrderCreatedByRequesterEvent): Promise<void> {
        this.logger.log(`Evento: Requester ${event.requesterName} creó OT ${event.workOrderFolio}`);

        const type = NotificationType.WORK_ORDER_CREATED_BY_REQUESTER;
        const title = 'Nueva OT creada';
        const body = `${event.requesterName} creó la OT ${event.workOrderFolio}: ${this.truncate(event.description, 80)}`;
        const data = {
            workOrderId: event.workOrderId,
            workOrderFolio: event.workOrderFolio,
            requesterUserId: event.requesterUserId,
            type: 'WORK_ORDER_CREATED_BY_REQUESTER',
            link: `/work-orders/${event.workOrderId}`,
        };

        const adminIds = await this.getUserIdsByRole('ADMIN');
        await this.dispatchToUsers(adminIds, type, title, body, data);
    }

    private async dispatchToUsers(
        userIds: string[],
        type: NotificationType,
        title: string,
        body: string,
        data: Record<string, string>,
    ): Promise<void> {
        if (userIds.length === 0) return;

        try {
            // 1. Crear notificaciones in-app
            const notifications = await this.notificationsService.createForRecipients(
                userIds,
                type,
                title,
                body,
                data,
            );

            this.logger.debug(`Creadas ${notifications.length} notificaciones in-app`);

            // 2. Publicar via PubSub para GraphQL Subscriptions (IN_APP real-time)
            for (const notification of notifications) {
                await this.pubSub.publish(SUBSCRIPTION_TRIGGERS.NEW_NOTIFICATION, {
                    [SUBSCRIPTION_TRIGGERS.NEW_NOTIFICATION]: notification,
                });
            }

            // 3. Preparar push por usuario
            const tokensMap = await this.deviceTokensService.getTokensForUsers(userIds);
            const tokensToSend: string[] = [];
            const notificationIdByToken = new Map<string, string>();

            for (const notification of notifications) {
                const pref = await this.preferencesService.getPreference(
                    notification.recipientId,
                    type,
                );

                // Verificar si push está habilitado y no está en quiet hours
                if (pref.pushEnabled && !pref.isInQuietHours()) {
                    const userTokens = tokensMap.get(notification.recipientId) || [];
                    for (const deviceToken of userTokens) {
                        tokensToSend.push(deviceToken.fcmToken);
                        notificationIdByToken.set(deviceToken.fcmToken, notification.id);
                    }
                }
            }

            // 4. Enviar push en batch
            if (tokensToSend.length > 0) {
                const fcmMessage: FcmMessage = { title, body, data };
                const results = await this.fcmProvider.sendToTokens(tokensToSend, fcmMessage);

                // 5. Procesar resultados
                for (const result of results) {
                    const notifId = notificationIdByToken.get(result.token);

                    if (result.success && notifId) {
                        await this.notificationsService.updatePushSent(notifId, true);
                    }

                    // Marcar tokens expirados
                    if (!result.success && result.error && this.fcmProvider.isTokenInvalid(result.error)) {
                        await this.deviceTokensService.markExpired(result.token);
                        this.logger.warn(`Token expirado eliminado: ${result.token.substring(0, 20)}...`);
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Error despachando notificación tipo ${type}`, error);
        }
    }

    private async getUserIdsByRole(roleName: string): Promise<string[]> {
        const users = await this.usersRepository
            .createQueryBuilder('u')
            .innerJoin('u.role', 'role')
            .where('role.name = :roleName', { roleName })
            .andWhere('u.isActive = :active', { active: true })
            .select('u.id')
            .getMany();

        return users.map(u => u.id);
    }

    private truncate(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}