import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PreventiveTasksModule } from '../preventive-tasks';
import { PreventiveTasksCronService } from './services';
import { SchedulerResolver } from './presentation/resolvers';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    PreventiveTasksModule,
  ],
  providers: [
    PreventiveTasksCronService,
    SchedulerResolver,
  ],
  exports: [PreventiveTasksCronService],
})
export class SchedulerModule {}
