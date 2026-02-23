import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationPreference } from "../../domain/entities";
import { NotificationType } from "src/common";

@Injectable()
export class NotificationPreferencesRepository {
    constructor(
        @InjectRepository(NotificationPreference)
        private readonly repository: Repository<NotificationPreference>,
    ) {}

    async findByUserId(userId: string): Promise<NotificationPreference[]> {
        return this.repository.find({
            where: { userId, isActive: true },
            order: { notificationType: 'ASC' },
        });
    }

    async findByUserAndType(userId: string, type: NotificationType): Promise<NotificationPreference | null> {
        return this.repository.findOne({
            where: { userId, notificationType: type, isActive: true },
        });
    }

    async upsert(userId: string, type: NotificationType, data: Partial<NotificationPreference>): Promise<NotificationPreference> {
        let pref = await this.findByUserAndType(userId, type);

        if (pref) {
            Object.assign(pref, data);
            return this.repository.save(pref);
        }

        const entity = this.repository.create({
            userId,
            notificationType: type,
            ...data,
        });
        return this.repository.save(entity);
    }

    async getDefaults(userId: string, type: NotificationType): Promise<NotificationPreference> {
        const existing = await this.findByUserAndType(userId, type);
        if (existing) return existing;

        // Retorna un objeto con valores por defecto sin persistir
        const defaultPref = new NotificationPreference();
        defaultPref.userId = userId;
        defaultPref.notificationType = type;
        defaultPref.pushEnabled = true;
        defaultPref.emailEnabled = false;
        defaultPref.inAppEnabled = true;
        return defaultPref;
    }
}
