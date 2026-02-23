import { Resolver, Query, Mutation, Subscription, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { JwtAuthGuard, CurrentUser } from 'src/common';
import {
    NotificationsService,
    UserDeviceTokensService,
    NotificationPreferencesService,
} from '../../application/services';
import {
    NotificationObjectType,
    NotificationPaginatedResponse,
    UserDeviceTokenType,
    NotificationPreferenceType
} from '../types/notification.type';
import {
    RegisterDeviceTokenInput,
    UnregisterDeviceTokenInput,
    UpdateNotificationPreferenceInput,
    BulkUpdatePreferencesInput,
    NotificationFiltersInput,
    NotificationPaginationInput,
} from '../../application/dto';
import { NOTIFICATION_PUB_SUB, SUBSCRIPTION_TRIGGERS } from '../../infrastructure/providers';

@Resolver(() => NotificationObjectType)
@UseGuards(JwtAuthGuard)
export class NotificationsResolver {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly deviceTokensService: UserDeviceTokensService,
        private readonly preferencesService: NotificationPreferencesService,
        @Inject(NOTIFICATION_PUB_SUB) private readonly pubSub: PubSub,
    ) {}


    @Query(() => NotificationPaginatedResponse, {
        name: 'myNotifications',
        description: 'Obtiene las notificaciones del usuario autenticado con paginación',
    })
    async myNotifications(
        @CurrentUser('id') userId: string,
        @Args('filters', { nullable: true }) filters?: NotificationFiltersInput,
        @Args('pagination', { nullable: true }) pagination?: NotificationPaginationInput,
    ): Promise<NotificationPaginatedResponse> {
        const { data, total } = await this.notificationsService.findByRecipient(userId, filters, pagination);
        const unreadCount = await this.notificationsService.countUnread(userId);
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;

        return {
            data: data.map(n => this.mapNotification(n)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            unreadCount,
        };
    }

    @Query(() => Int, {
        name: 'unreadNotificationsCount',
        description: 'Contador de notificaciones no leídas',
    })
    async unreadCount(@CurrentUser('id') userId: string): Promise<number> {
        return this.notificationsService.countUnread(userId);
    }

    @Mutation(() => NotificationObjectType, {
        name: 'markNotificationAsRead',
        description: 'Marca una notificación como leída',
    })
    async markAsRead(
        @Args('id', { type: () => ID }) id: string,
        @CurrentUser('id') userId: string,
    ): Promise<NotificationObjectType> {
        const notification = await this.notificationsService.markAsRead(id, userId);
        return this.mapNotification(notification);
    }

    @Mutation(() => Int, {
        name: 'markAllNotificationsAsRead',
        description: 'Marca todas las notificaciones como leídas. Retorna cantidad actualizada.',
    })
    async markAllAsRead(@CurrentUser('id') userId: string): Promise<number> {
        return this.notificationsService.markAllAsRead(userId);
    }

    @Mutation(() => Boolean, {
        name: 'deleteNotification',
        description: 'Elimina una notificación (soft delete)',
    })
    async deleteNotification(
        @Args('id', { type: () => ID }) id: string,
        @CurrentUser('id') userId: string,
    ): Promise<boolean> {
        return this.notificationsService.delete(id, userId);
    }

    @Subscription(() => NotificationObjectType, {
        name: 'newNotification',
        description: 'Recibe notificaciones en tiempo real para el usuario autenticado',
        filter: (payload, _variables, context) => {
            const userId = context?.req?.user?.id || context?.connection?.context?.userId;
            const notification = payload?.newNotification;
            return notification?.recipientId === userId;
        },
        resolve: (payload) => {
            const n = payload?.newNotification;
            return {
                ...n,
                data: n?.data ? JSON.stringify(n.data) : null,
            };
        },
    })
    subscribeToNotifications() {
        return this.pubSub.asyncIterableIterator(SUBSCRIPTION_TRIGGERS.NEW_NOTIFICATION);
    }

    @Query(() => [UserDeviceTokenType], {
        name: 'myDeviceTokens',
        description: 'Obtiene los tokens FCM registrados del usuario autenticado',
    })
    async myDeviceTokens(
        @CurrentUser('id') userId: string,
    ): Promise<UserDeviceTokenType[]> {
        return this.deviceTokensService.findByUserId(userId) as unknown as UserDeviceTokenType[];
    }

    @Mutation(() => UserDeviceTokenType, {
        name: 'registerDeviceToken',
        description: 'Registra un token FCM para recibir notificaciones push',
    })
    async registerToken(
        @Args('input') input: RegisterDeviceTokenInput,
        @CurrentUser('id') userId: string,
    ): Promise<UserDeviceTokenType> {
        return this.deviceTokensService.register(userId, input) as unknown as UserDeviceTokenType;
    }

    @Mutation(() => Boolean, {
        name: 'unregisterDeviceToken',
        description: 'Elimina un token FCM (al cerrar sesión)',
    })
    async unregisterToken(
        @Args('input') input: UnregisterDeviceTokenInput,
        @CurrentUser('id') userId: string,
    ): Promise<boolean> {
        return this.deviceTokensService.unregister(userId, input.fcmToken);
    }

    @Query(() => [NotificationPreferenceType], {
        name: 'myNotificationPreferences',
        description: 'Obtiene las preferencias de notificación del usuario',
    })
    async myPreferences(
        @CurrentUser('id') userId: string,
    ): Promise<NotificationPreferenceType[]> {
        return this.preferencesService.findByUserId(userId) as unknown as NotificationPreferenceType[];
    }

    @Mutation(() => NotificationPreferenceType, {
        name: 'updateNotificationPreference',
        description: 'Actualiza una preferencia de notificación',
    })
    async updatePreference(
        @Args('input') input: UpdateNotificationPreferenceInput,
        @CurrentUser('id') userId: string,
    ): Promise<NotificationPreferenceType> {
        return this.preferencesService.update(userId, input) as unknown as NotificationPreferenceType;
    }

    @Mutation(() => [NotificationPreferenceType], {
        name: 'bulkUpdateNotificationPreferences',
        description: 'Actualiza múltiples preferencias de notificación en batch',
    })
    async bulkUpdatePreferences(
        @Args('input') input: BulkUpdatePreferencesInput,
        @CurrentUser('id') userId: string,
    ): Promise<NotificationPreferenceType[]> {
        return this.preferencesService.bulkUpdate(
            userId,
            input.preferences,
        ) as unknown as NotificationPreferenceType[];
    }

    private mapNotification(n: any): NotificationObjectType {
        return {
            ...n,
            data: n.data ? JSON.stringify(n.data) : null,
        };
    }

}