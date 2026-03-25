import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import {
  appConfig,
  databaseConfig,
  graphqlConfig,
  jwtConfig,
  schedulerConfig,
  emailConfig,
} from './config';

import { DatabaseModule } from './infrastructure/database/database.module';
import { CustomGraphqlModule } from './infrastructure/graphql/graphql.module';

import { GraphqlExceptionFilter } from './common/filters';
import { CsrfGuard, GqlThrottlerGuard, JwtAuthGuard } from './common/guards';
import {
  LoggingInterceptor,
  UserContextInterceptor,
} from './common/interceptors';
import { PasswordModule, EmailModule } from './common/modules';
import { ExcelModule } from './infrastructure/excel';

// Módulos de dominio
import { FindingsModule } from './modules/findings';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { WorkOrdersModule } from './modules/work-orders';
import { CatalogsModule } from './modules/catalogs';
import { AuditModule } from './modules/audit';
import { PreventiveTasksModule } from './modules/preventive-tasks';
import { TechnicianSchedulesModule } from './modules/technician-schedules';
import { SchedulerModule } from './modules/scheduler';
import { NotificationsModule } from './modules/notifications';
import { MaterialRequestsModule } from './modules/material-requests';
import { DashboardModule } from './modules/dashboard';
import { UploadsModule } from './modules/uploads/uploads.module';
import { OvertimeModule } from './modules/overtime';
import { ActivitiesModule } from './modules/activities';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [
        appConfig,
        databaseConfig,
        graphqlConfig,
        jwtConfig,
        schedulerConfig,
        emailConfig,
      ],
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    DatabaseModule,
    CustomGraphqlModule,
    PasswordModule,
    EmailModule,
    ExcelModule,

    // Módulo de auditoría (debe cargarse antes que otros módulos de dominio)
    AuditModule,

    // Módulos de dominio
    AuthModule,
    CatalogsModule,
    DashboardModule,
    FindingsModule,
    MaterialRequestsModule,
    NotificationsModule,
    PreventiveTasksModule,
    TechnicianSchedulesModule,
    SchedulerModule,
    UsersModule,
    WorkOrdersModule,
    ActivitiesModule,
    UploadsModule,
    OvertimeModule,

    // NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GraphqlExceptionFilter,
    },

    {
      provide: APP_INTERCEPTOR,
      useClass: UserContextInterceptor,
    },

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },

    // Interceptor de logging global (opcional)
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
  ],
})
export class AppModule {}
