import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Activity,
  ActivityTechnician,
  ActivityWorkOrder,
  ActivityMaterialRequest,
} from './domain/entities';

import {
  ActivitiesRepository,
  ActivityTechniciansRepository,
  ActivityWorkOrdersRepository,
  ActivityMaterialRequestsRepository,
} from './infrastructure/repositories';

import {
  ActivitiesService,
  ActivityWorkOrdersService,
  ActivityMaterialRequestsService,
} from './application/services';

import { ActivitiesResolver } from './presentation/resolvers';
import { AreasModule } from '../catalogs/areas/areas.module';
import { MachinesModule } from '../catalogs/machines/machines.module';
import { UsersModule } from '../users/users.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { MaterialRequestsModule } from '../material-requests/material-requests.module';

import { ActivitiesExcelController } from './presentation/controllers/activities-excel.controller';
import { ActivitiesPdfController } from './presentation/controllers/activities-pdf.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityTechnician,
      ActivityWorkOrder,
      ActivityMaterialRequest,
    ]),
    AreasModule,
    MachinesModule,
    UsersModule,
    WorkOrdersModule,
    MaterialRequestsModule,
  ],
  providers: [
    ActivitiesRepository,
    ActivityTechniciansRepository,
    ActivityWorkOrdersRepository,
    ActivityMaterialRequestsRepository,
    ActivitiesService,
    ActivityWorkOrdersService,
    ActivityMaterialRequestsService,
    ActivitiesResolver,
  ],
  controllers: [ActivitiesExcelController, ActivitiesPdfController],
  exports: [
    ActivitiesService,
    TypeOrmModule,
  ],
})
export class ActivitiesModule {}
