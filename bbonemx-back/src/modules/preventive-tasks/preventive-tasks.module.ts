import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreventiveTask, PreventiveTaskHistory } from './domain/entities';
import { PreventiveTasksRepository } from './infrastructure/repositories';
import { PreventiveTasksService } from './application/services';
import { PreventiveTasksResolver } from './presentation/resolvers';
import { WorkOrdersModule } from '../work-orders';

@Module({
  imports: [
    TypeOrmModule.forFeature([PreventiveTask, PreventiveTaskHistory]),
    forwardRef(() => WorkOrdersModule),
  ],
  providers: [
    PreventiveTasksRepository,
    PreventiveTasksService,
    PreventiveTasksResolver,
  ],
  exports: [
    PreventiveTasksService,
    TypeOrmModule,
  ],
})
export class PreventiveTasksModule {}
