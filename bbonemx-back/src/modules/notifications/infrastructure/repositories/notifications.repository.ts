import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Notification } from "../../domain/entities";
import { NotificationFiltersInput, NotificationPaginationInput } from "../../application/dto";

@Injectable()
export class NotificationsRepository {
    constructor(@InjectRepository(Notification) private readonly repository: Repository<Notification>) {}

    async findById(id: string): Promise<Notification | null> {
        return this.repository.findOne({
            where: { id, isActive: true },
            relations: ['recipient'],
        });
    }

    async findByRecipient(
        recipientId: string,
        filters?: NotificationFiltersInput,
        pagination?: NotificationPaginationInput,
    ): Promise<{ data: Notification[]; total: number }> {
        const qb = this.repository
            .createQueryBuilder('n')
            .leftJoinAndSelect('n.recipient', 'recipient')
            .where('n.recipientId = :recipientId', { recipientId })
            .andWhere('n.isActive = :active', { active: true });

        if (filters?.type) {
            qb.andWhere('n.type = :type', { type: filters.type });
        }

        if (filters?.unreadOnly) {
            qb.andWhere('n.readAt IS NULL');
        }

        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;

        const [data, total] = await qb
            .orderBy('n.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async countUnread(recipientId: string): Promise<number> {
        return this.repository.count({
            where: {
                recipientId,
                readAt: IsNull(),
                isActive: true,
            },
        });
    }

    async create(data: Partial<Notification>): Promise<Notification> {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }

    async createMany(data: Partial<Notification>[]): Promise<Notification[]> {
        const entities = data.map(d => this.repository.create(d));
        return this.repository.save(entities);
    }

    async markAsRead(id: string): Promise<Notification | null> {
        const notification = await this.repository.findOne({ where: { id } });
        if (!notification) return null;
        notification.readAt = new Date();
        return this.repository.save(notification);
    }

    async markAllAsRead(recipientId: string): Promise<number> {
        const result = await this.repository
            .createQueryBuilder()
            .update(Notification)
            .set({ readAt: new Date() })
            .where('recipientId = :recipientId', { recipientId })
            .andWhere('readAt IS NULL')
            .andWhere('isActive = :active', { active: true })
            .execute();

        return result.affected || 0;
    }

    async updatePushSent(id: string, sent: boolean): Promise<void> {
        await this.repository.update(id, { pushSent: sent });
    }

    async updateEmailSent(id: string, sent: boolean): Promise<void> {
        await this.repository.update(id, { emailSent: sent });
    }

    async softDelete(id: string): Promise<void> {
        await this.repository.update(id, { isActive: false, deletedAt: new Date() });
    }

}