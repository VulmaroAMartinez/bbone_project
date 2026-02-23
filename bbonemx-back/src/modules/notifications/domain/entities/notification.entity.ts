import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm"; 
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { User } from "src/modules/users";
import { NotificationType } from "src/common";

@Entity( { name: 'notifications' } )
@Index('IDX_notification_recipient_read', ['recipientId', 'readAt'])
@Index('IDX_notification_type', ['type'])
export class Notification extends BaseEntity {
    @Column({name: 'recipient_id', type: 'uuid'})
    recipientId: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'recipient_id'})
    recipient: User;

    @Column({name: 'type', type: 'enum', enum: NotificationType})
    type: NotificationType;

    @Column({name: 'title', type: 'varchar', length: 255})
    title: string;

    @Column({name: 'body', type: 'text'})
    body: string;

    @Column({ type: "jsonb", nullable: true})
    data?: Record<string, any>;

    @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true})
    readAt?: Date;

    @Column({name: 'push_sent', type: 'boolean', default: false})
    pushSent: boolean;

    @Column({name: 'email_sent', type: 'boolean', default: false})
    emailSent: boolean;

    isRead(): boolean {
        return this.readAt !== null && this.readAt !== undefined;
    }
}