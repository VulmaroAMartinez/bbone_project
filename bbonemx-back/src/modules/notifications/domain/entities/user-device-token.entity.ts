import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from "typeorm";
import { BaseEntity } from "src/infrastructure/database/base.entity";
import { User } from "src/modules/users";
import { DevicePlatform } from "src/common";

@Entity( { name: 'user_device_tokens' } )
@Unique('UQ_user_device_token', ['userId', 'fcmToken'])
@Index('IDX_device_token_user', ['userId'])
export class UserDeviceToken extends BaseEntity {
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'fcm_token', type: 'text' })
    fcmToken: string;

    @Column({
        name: 'platform',
        type: 'enum',
        enum: DevicePlatform,
        default: DevicePlatform.WEB,
    })
    platform: DevicePlatform;

    @Column({name: 'device_name', type: 'varchar', length: 255, nullable: true})
    deviceName?: string;

    @Column({name: 'last_used_at', type: 'timestamp with time zone', nullable: true})
    lastUsedAt?: Date;

    @Column({name: 'is_expired', type: 'boolean', default: false})
    isExpired: boolean;
}