import { Injectable, Logger } from "@nestjs/common";
import { UserDeviceTokensRepository } from "../../infrastructure/repositories";
import { UserDeviceToken } from "../../domain/entities";
import { RegisterDeviceTokenInput } from "../dto";

@Injectable()
export class UserDeviceTokensService {
    private readonly logger = new Logger(UserDeviceTokensService.name);
    constructor(private readonly tokensRepository: UserDeviceTokensRepository) {}

    async findByUserId(userId: string): Promise<UserDeviceToken[]> {
        return this.tokensRepository.findByUserId(userId);
    }

    async getTokensForUsers(userIds: string[]): Promise<Map<string, UserDeviceToken[]>> {
        const allTokens = await this.tokensRepository.findByUserIds(userIds);
        const tokenMap = new Map<string, UserDeviceToken[]>();

        for (const token of allTokens) {
            const existing = tokenMap.get(token.userId) || [];
            existing.push(token);
            tokenMap.set(token.userId, existing);
        }

        return tokenMap;
    }

    async register(userId: string, input: RegisterDeviceTokenInput): Promise<UserDeviceToken> {
        const existing = await this.tokensRepository.findByUserAndToken(userId, input.fcmToken);
        if (existing) {
            this.logger.debug(`Token ya registrado para usuario ${userId}`);
            return existing;
        }

        const otherUserToken = await this.tokensRepository.findByToken(input.fcmToken);
        if (otherUserToken) {
            this.logger.debug(`Token reasignado de usuario ${otherUserToken.userId} a ${userId}`);
            await this.tokensRepository.softDelete(otherUserToken.id);
        }

        return this.tokensRepository.create({
            userId,
            fcmToken: input.fcmToken,
            platform: input.platform,
            deviceName: input.deviceName,
        });
    }

    async unregister(userId: string, fcmToken: string): Promise<boolean> {
        await this.tokensRepository.softDeleteByUserAndToken(userId, fcmToken);
        return true;
    }

    async markExpired(fcmToken: string): Promise<void> {
        await this.tokensRepository.markExpiredByToken(fcmToken);
    }

    async updateLastUsed(tokenId: string): Promise<void> {
        await this.tokensRepository.updateLastUsed(tokenId);
    }
}