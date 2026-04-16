import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PubSub } from 'graphql-subscriptions';
import { NotificationsService } from './notifications.service';
import { UserDeviceTokensService } from './user-device-tokens.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import {
  FcmProvider,
  FcmMessage,
  NOTIFICATION_PUB_SUB,
  SUBSCRIPTION_TRIGGERS,
} from '../../infrastructure/providers';
import { NotificationType } from 'src/common';
import {
  NOTIFICATION_EVENTS,
  WorkOrderAssignedEvent,
  WorkOrderCompletedEvent,
  PreventiveTaskWoGeneratedEvent,
  WorkOrderCreatedByRequesterEvent,
  WorkOrderNonConformityEvent,
} from 'src/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users';

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);
  private static readonly PUBLISH_BATCH_SIZE = 50;
  private static readonly UPDATE_BATCH_SIZE = 100;

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
    this.logger.log(
      `Evento: OT ${event.workOrderFolio} asignada a ${event.technicianUserIds.length} técnicos`,
    );

    const type = NotificationType.WORK_ORDER_ASSIGNED;
    const title = 'Nueva OT asignada';
    const body = `Se te asignó la OT ${event.workOrderFolio}: ${this.truncate(event.description, 80)}`;
    const data = {
      workOrderId: event.workOrderId,
      workOrderFolio: event.workOrderFolio,
      type: 'WORK_ORDER_ASSIGNED',
      link: `/work-orders/${event.workOrderId}`,
    };

    await this.dispatchToUsers(
      event.technicianUserIds,
      type,
      title,
      body,
      data,
    );
  }

  @OnEvent(NOTIFICATION_EVENTS.WORK_ORDER_COMPLETED)
  async handleWorkOrderCompleted(
    event: WorkOrderCompletedEvent,
  ): Promise<void> {
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
  async handlePreventiveTaskWoGenerated(
    event: PreventiveTaskWoGeneratedEvent,
  ): Promise<void> {
    this.logger.log(
      `Evento: Tarea preventiva generó OT ${event.workOrderFolio}`,
    );

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
  async handleWorkOrderCreatedByRequester(
    event: WorkOrderCreatedByRequesterEvent,
  ): Promise<void> {
    this.logger.log(
      `Evento: Requester ${event.requesterName} creó OT ${event.workOrderFolio}`,
    );

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

  @OnEvent(NOTIFICATION_EVENTS.WORK_ORDER_NON_CONFORMITY)
  async handleWorkOrderNonConformity(
    event: WorkOrderNonConformityEvent,
  ): Promise<void> {
    this.logger.log(
      `Evento: OT ${event.workOrderFolio} rechazada por no-conformidad (ciclo ${event.cycleNumber})`,
    );

    const type = NotificationType.WORK_ORDER_NON_CONFORMITY;
    const title = `OT rechazada — Re-trabajo requerido (Ciclo ${event.cycleNumber})`;
    const body = `La OT ${event.workOrderFolio} fue rechazada por el solicitante. Razón: ${this.truncate(event.reason, 100)}`;
    const data = {
      workOrderId: event.workOrderId,
      workOrderFolio: event.workOrderFolio,
      type: 'WORK_ORDER_NON_CONFORMITY',
      cycleNumber: String(event.cycleNumber),
      link: `/tecnico/ordenes/${event.workOrderId}`,
    };

    await this.dispatchToUsers(event.technicianUserIds, type, title, body, data);
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

      this.logger.debug(
        `Creadas ${notifications.length} notificaciones in-app`,
      );

      await this.runInBatches(
        notifications,
        NotificationDispatcherService.PUBLISH_BATCH_SIZE,
        async (notification) => {
          await this.pubSub.publish(SUBSCRIPTION_TRIGGERS.NEW_NOTIFICATION, {
            [SUBSCRIPTION_TRIGGERS.NEW_NOTIFICATION]: notification,
          });
        },
      );

      // 3. Preparar push por usuario
      const tokensMap =
        await this.deviceTokensService.getTokensForUsers(userIds);
      const tokensToSend: string[] = [];
      const notificationIdsByToken = new Map<string, Set<string>>();
      const preferencesByUserId =
        await this.preferencesService.getPreferencesForUsers(userIds, type);

      for (const notification of notifications) {
        const pref = preferencesByUserId.get(notification.recipientId);
        if (!pref) continue;

        if (pref.pushEnabled && !pref.isInQuietHours()) {
          const userTokens = tokensMap.get(notification.recipientId) || [];
          for (const deviceToken of userTokens) {
            tokensToSend.push(deviceToken.fcmToken);
            const notifIds = notificationIdsByToken.get(deviceToken.fcmToken);
            if (notifIds) {
              notifIds.add(notification.id);
            } else {
              notificationIdsByToken.set(
                deviceToken.fcmToken,
                new Set([notification.id]),
              );
            }
          }
        }
      }

      if (tokensToSend.length > 0) {
        const fcmMessage: FcmMessage = { title, body, data };
        const results = await this.fcmProvider.sendToTokens(
          tokensToSend,
          fcmMessage,
        );

        // 5. Procesar resultados
        const notificationIdsToMarkSent = new Set<string>();
        const invalidTokens = new Set<string>();

        for (const result of results) {
          const notifIds = notificationIdsByToken.get(result.token);

          if (result.success && notifIds) {
            for (const notificationId of notifIds) {
              notificationIdsToMarkSent.add(notificationId);
            }
          }

          if (
            !result.success &&
            result.error &&
            this.fcmProvider.isTokenInvalid(result.error)
          ) {
            invalidTokens.add(result.token);
          }
        }

        await this.runInBatches(
          Array.from(notificationIdsToMarkSent),
          NotificationDispatcherService.UPDATE_BATCH_SIZE,
          async (notificationId) => {
            await this.notificationsService.updatePushSent(
              notificationId,
              true,
            );
          },
        );

        await this.runInBatches(
          Array.from(invalidTokens),
          NotificationDispatcherService.UPDATE_BATCH_SIZE,
          async (token) => {
            await this.deviceTokensService.markExpired(token);
            this.logger.warn(
              `Token expirado eliminado: ${token.substring(0, 20)}...`,
            );
          },
        );
      }
    } catch (error) {
      this.logger.error(`Error despachando notificación tipo ${type}`, error);
    }
  }

  private async runInBatches<T>(
    items: T[],
    batchSize: number,
    worker: (item: T) => Promise<void>,
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((item) => worker(item)),
      );

      for (const result of results) {
        if (result.status === 'rejected') {
          this.logger.warn(
            `Error procesando elemento de lote de notificaciones: ${String(result.reason)}`,
          );
        }
      }
    }
  }

  private async getUserIdsByRole(roleName: string): Promise<string[]> {
    const users = await this.usersRepository
      .createQueryBuilder('u')
      .innerJoin('u.userRoles', 'userRole')
      .innerJoin('userRole.role', 'role')
      .where('role.name = :roleName', { roleName })
      .andWhere('u.isActive = :active', { active: true })
      .select('u.id')
      .getMany();

    return users.map((u) => u.id);
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}
