import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { UserDeviceToken } from "../../domain/entities";

@Injectable()
export class UserDeviceTokensRepository {
    constructor(
        @InjectRepository(UserDeviceToken)
        private readonly repository: Repository<UserDeviceToken>,
    ) {}

    async findByUserId(userId: string): Promise<UserDeviceToken[]> {
        return this.repository.find({
            where: { userId, isActive: true, isExpired: false },
            order: { lastUsedAt: 'DESC' },
        });
    }

    async findByUserIds(userIds: string[]): Promise<UserDeviceToken[]> {
        if (userIds.length === 0) return [];
        return this.repository.find({
            where: { userId: In(userIds), isActive: true, isExpired: false },
        });
    }

    async findByToken(fcmToken: string): Promise<UserDeviceToken | null> {
        return this.repository.findOne({
            where: { fcmToken, isActive: true },
            relations: ['user'],
        });
    }

    async findByUserAndToken(userId: string, fcmToken: string): Promise<UserDeviceToken | null> {
        return this.repository.findOne({
            where: { userId, fcmToken, isActive: true },
        });
    }

    async create(data: Partial<UserDeviceToken>): Promise<UserDeviceToken> {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }

    async updateLastUsed(id: string): Promise<void> {
        await this.repository.update(id, { lastUsedAt: new Date() });
    }

    async markExpired(id: string): Promise<void> {
        await this.repository.update(id, { isExpired: true });
    }

    async markExpiredByToken(fcmToken: string): Promise<void> {
        await this.repository.update({ fcmToken }, { isExpired: true });
    }

    async softDelete(id: string): Promise<void> {
        await this.repository.update(id, { isActive: false, deletedAt: new Date() });
    }

    async softDeleteByUserAndToken(userId: string, fcmToken: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(UserDeviceToken)
            .set({ isActive: false, deletedAt: new Date() })
            .where('userId = :userId', { userId })
            .andWhere('fcmToken = :fcmToken', { fcmToken })
            .execute();
    }
}
