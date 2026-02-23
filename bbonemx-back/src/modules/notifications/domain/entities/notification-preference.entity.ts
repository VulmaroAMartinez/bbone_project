import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { User } from "src/modules/users";
import { NotificationType } from "src/common";

@Entity( { name: 'notification_preferences' } )
@Unique('UQ_user_notification_type', ['userId', 'notificationType'])
export class NotificationPreference extends BaseEntity {
    @Column({name: 'user_id', type: 'uuid'})
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column({
        name: 'notification_type',
        type: 'enum',
        enum: NotificationType,
    })
    notificationType: NotificationType;

    @Column({name: 'push_enabled', type: 'boolean', default: true})
    pushEnabled: boolean;

    @Column({name: 'email_enabled', type: 'boolean', default: true})
    emailEnabled: boolean;

    @Column({name: 'in_app_enabled', type: 'boolean', default: true})
    inAppEnabled: boolean;

    @Column({ name: 'quiet_hours_start', type: 'time', nullable: true})
    quietHoursStart?: string;

    @Column({ name: 'quiet_hours_end', type: 'time', nullable: true})
    quietHoursEnd?: string;

    isInQuietHours(now: Date = new Date()): boolean {
        if (!this.quietHoursStart || !this.quietHoursEnd) return false;

        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const start = this.quietHoursStart;
        const end = this.quietHoursEnd;

        if (start > end) return currentTime >= start || currentTime < end;

        return currentTime >= start && currentTime < end;
    }
}