import { registerEnumType } from '@nestjs/graphql';

export enum NotificationChannel {
    /** In-app via GraphQL Subscription (WebSocket) */
    IN_APP = 'IN_APP',

    /** Push via Firebase Cloud Messaging */
    PUSH = 'PUSH',

    /** Email via SMTP */
    EMAIL = 'EMAIL',
}

registerEnumType(NotificationChannel, {
    name: 'NotificationChannel',
    description: 'Canales de entrega de notificaciones',
});

export enum DevicePlatform {
    WEB = 'WEB',
    ANDROID = 'ANDROID',
    IOS = 'IOS',
}

registerEnumType(DevicePlatform, {
    name: 'DevicePlatform',
    description: 'Plataforma del dispositivo',
});
