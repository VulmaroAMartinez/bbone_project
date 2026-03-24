import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PreventiveTasksModule } from '../preventive-tasks';
import { TechniciansModule } from '../catalogs/technicians/technicians.module';
import { UsersModule } from '../users/users.module';
import {
  PreventiveTasksCronService,
  TechnicianBirthdaysCronService,
  TechnicianBirthdaysNotificationService,
} from './services';
import { SchedulerResolver } from './presentation/resolvers';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    PreventiveTasksModule,
    TechniciansModule,
    UsersModule,
  ],
  providers: [
    PreventiveTasksCronService,
    TechnicianBirthdaysNotificationService,
    TechnicianBirthdaysCronService,
    SchedulerResolver,
  ],
  exports: [PreventiveTasksCronService, TechnicianBirthdaysCronService],
})
export class SchedulerModule {}
