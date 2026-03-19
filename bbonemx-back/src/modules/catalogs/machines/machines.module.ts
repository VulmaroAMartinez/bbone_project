import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './domain/entities';
import { MachinesService } from './application/services';
import { MachinesRepository } from './infrastructure/repositories';
import { MachinesResolver } from './presentation/resolvers';
import { SparePartsModule } from '../spare-parts/spare-parts.module';
import { AreasModule } from '../areas/areas.module';
import { SubAreasModule } from '../sub-areas/sub-areas.module';
import { WorkOrdersModule } from 'src/modules/work-orders/work-orders.module';
import { MaterialRequestsModule } from 'src/modules/material-requests/material-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Machine]),
    AreasModule,
    SubAreasModule,
    SparePartsModule,
    forwardRef(() => WorkOrdersModule),
    forwardRef(() => MaterialRequestsModule),
  ],
  providers: [MachinesService, MachinesRepository, MachinesResolver],
  exports: [MachinesService, MachinesRepository, TypeOrmModule],
})
export class MachinesModule {}
