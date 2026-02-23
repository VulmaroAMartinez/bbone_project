import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import {
  appConfig,
  databaseConfig,
  graphqlConfig,
  jwtConfig,
  schedulerConfig,
} from './config';

import { DatabaseModule } from './infrastructure/database/database.module';
import { CustomGraphqlModule } from './infrastructure/graphql/graphql.module';

import { GraphqlExceptionFilter } from './common/filters';
import { JwtAuthGuard } from './common/guards';
import { LoggingInterceptor, UserContextInterceptor } from './common/interceptors';
import { PasswordModule } from './common/modules';

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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig, databaseConfig, graphqlConfig, jwtConfig, schedulerConfig],
      cache: true,
    }),

    DatabaseModule,
    CustomGraphqlModule,
    PasswordModule,

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

    // NotificationsModule,
  ],
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
    
    // Interceptor de logging global (opcional)
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor,
    // },
  ],
})
export class AppModule {}