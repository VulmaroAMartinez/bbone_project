import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationsRepository } from "../../infrastructure/repositories";
import { Notification } from "../../domain/entities";
import { NotificationType } from "src/common";
import { NotificationFiltersInput, NotificationPaginationInput } from "../../application/dto";

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationsRepository: NotificationsRepository) { }

    async findById(id: string): Promise<Notification | null> {
        return this.notificationsRepository.findById(id);
    }

    async findByIdOrFail(id: string): Promise<Notification> {
        const notification = await this.notificationsRepository.findById(id);
        if (!notification) throw new NotFoundException('Notificación no encontrada');
        return notification;
    }

    async findByRecipient(
        recipientId: string,
        filters?: NotificationFiltersInput,
        pagination?: NotificationPaginationInput,
    ): Promise<{ data: Notification[]; total: number }> {
        return this.notificationsRepository.findByRecipient(recipientId, filters, pagination);
    }

    async countUnread(recipientId: string): Promise<number> {
        return this.notificationsRepository.countUnread(recipientId);
    }

    async create(data: {
        recipientId: string;
        type: NotificationType;
        title: string;
        body: string;
        data?: Record<string, any>;
    }): Promise<Notification> {
        return this.notificationsRepository.create(data);
    }

    async createForRecipients(
        recipientIds: string[],
        type: NotificationType,
        title: string,
        body: string,
        data?: Record<string, any>,
    ): Promise<Notification[]> {
        const notificationsData = recipientIds.map(recipientId => ({
            recipientId,
            type,
            title,
            body,
            data,
        }));
        return this.notificationsRepository.createMany(notificationsData);
    }

    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notification = await this.findByIdOrFail(id);
        if (notification.recipientId !== userId) {
            throw new NotFoundException('Notificación no encontrada');
        }
        const updated = await this.notificationsRepository.markAsRead(id);
        return updated!;
    }

    async markAllAsRead(userId: string): Promise<number> {
        return this.notificationsRepository.markAllAsRead(userId);
    }

    async updatePushSent(id: string, sent: boolean): Promise<void> {
        await this.notificationsRepository.updatePushSent(id, sent);
    }

    async updateEmailSent(id: string, sent: boolean): Promise<void> {
        await this.notificationsRepository.updateEmailSent(id, sent);
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const notification = await this.findByIdOrFail(id);
        if (notification.recipientId !== userId) {
            throw new NotFoundException('Notificación no encontrada');
        }
        await this.notificationsRepository.softDelete(id);
        return true;
    }
}