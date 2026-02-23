import { Provider } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

/**
 * Token de inyección para PubSub.
 * Usado por el Dispatcher para publicar y por el Resolver para suscribir.
 */
export const NOTIFICATION_PUB_SUB = 'NOTIFICATION_PUB_SUB';

/** Nombres de los triggers para las subscriptions */
export const SUBSCRIPTION_TRIGGERS = {
    /** Trigger genérico: nueva notificación para un usuario */
    NEW_NOTIFICATION: 'newNotification',
    /** Trigger: contador de no leídas actualizado */
    UNREAD_COUNT_UPDATED: 'unreadCountUpdated',
} as const;

/**
 * Provider de PubSub para inyección de dependencias.
 * En producción, reemplazar PubSub() por RedisPubSub para multi-instancia.
 *
 * Ejemplo con Redis:
 *   import { RedisPubSub } from 'graphql-redis-subscriptions';
 *   useFactory: () => new RedisPubSub({ connection: { host: 'redis', port: 6379 } })
 */
export const PubSubProvider: Provider = {
    provide: NOTIFICATION_PUB_SUB,
    useFactory: () => new PubSub(),
};