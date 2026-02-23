import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { UsersModule } from "../users";
import { Notification, UserDeviceToken, NotificationPreference } from "./domain/entities";
import { NotificationsRepository, UserDeviceTokensRepository, NotificationPreferencesRepository } from "./infrastructure/repositories";
import { NotificationsResolver } from "./presentation/resolvers";
import { NotificationsService } from "./application/services";
import { UserDeviceTokensService } from "./application/services";
import { NotificationPreferencesService } from "./application/services";
import { NotificationDispatcherService } from "./application/services";
import { FcmProvider } from "./infrastructure/providers";
import { PubSubProvider } from "./infrastructure/providers";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Notification,
            UserDeviceToken,
            NotificationPreference,
        ]),
        EventEmitterModule.forRoot(),
        UsersModule,
    ],
    providers: [
        // Infrastructure
        NotificationsRepository,
        UserDeviceTokensRepository,
        NotificationPreferencesRepository,
        FcmProvider,
        PubSubProvider,

        // Services
        NotificationsService,
        UserDeviceTokensService,
        NotificationPreferencesService,
        NotificationDispatcherService,

        // Presentation
        NotificationsResolver,
    ],
    exports: [
        NotificationsService,
        UserDeviceTokensService,
        NotificationPreferencesService,
        NotificationDispatcherService,
    ],
})
export class NotificationsModule {}