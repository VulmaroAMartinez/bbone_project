import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UserType } from 'src/modules/users/presentation/types';
import { NotificationType, NotificationChannel, DevicePlatform } from 'src/common';

// ============================
// NOTIFICATION
// ============================

@ObjectType('Notification')
export class NotificationObjectType {
    @Field(() => ID) id: string;
    @Field(() => ID) recipientId: string;
    @Field(() => UserType) recipient: UserType;
    @Field(() => NotificationType) type: NotificationType;
    @Field() title: string;
    @Field() body: string;
    @Field({ nullable: true }) data?: string; // JSON string
    @Field({ nullable: true }) readAt?: Date;
    @Field() pushSent: boolean;
    @Field() emailSent: boolean;
    @Field() isActive: boolean;
    @Field() createdAt: Date;
}

@ObjectType()
export class NotificationPaginatedResponse {
    @Field(() => [NotificationObjectType]) data: NotificationObjectType[];
    @Field(() => Int) total: number;
    @Field(() => Int) page: number;
    @Field(() => Int) limit: number;
    @Field(() => Int) totalPages: number;
    @Field(() => Int) unreadCount: number;
}

// ============================
// DEVICE TOKEN
// ============================

@ObjectType('UserDeviceToken')
export class UserDeviceTokenType {
    @Field(() => ID) id: string;
    @Field(() => ID) userId: string;
    @Field() fcmToken: string;
    @Field(() => DevicePlatform) platform: DevicePlatform;
    @Field({ nullable: true }) deviceName?: string;
    @Field({ nullable: true }) lastUsedAt?: Date;
    @Field() isExpired: boolean;
    @Field() createdAt: Date;
}

// ============================
// NOTIFICATION PREFERENCE
// ============================

@ObjectType('NotificationPreference')
export class NotificationPreferenceType {
    @Field(() => ID, { nullable: true }) id?: string;
    @Field(() => ID) userId: string;
    @Field(() => NotificationType) notificationType: NotificationType;
    @Field() pushEnabled: boolean;
    @Field() emailEnabled: boolean;
    @Field() inAppEnabled: boolean;
    @Field({ nullable: true }) quietHoursStart?: string;
    @Field({ nullable: true }) quietHoursEnd?: string;
}
