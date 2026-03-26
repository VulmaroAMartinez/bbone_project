import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MaterialRequest,
  MaterialRequestItem,
  MaterialRequestMachine,
  MaterialRequestHistory,
} from './domain/entities';
import {
  MaterialRequestsRepository,
  MaterialRequestItemsRepository,
  MaterialRequestHistoryRepository,
} from './infrastructure/repositories';
import { MaterialRequestsService } from './application/services';
import { MaterialRequestsResolver } from './presentation/resolvers';
import { SparePartsModule } from '../catalogs/spare-parts/spare-parts.module';
import { MaterialsModule } from '../catalogs/materials/materials.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialRequest,
      MaterialRequestItem,
      MaterialRequestMachine,
      MaterialRequestHistory,
    ]),
    MaterialsModule,
    SparePartsModule,
  ],
  providers: [
    MaterialRequestsRepository,
    MaterialRequestItemsRepository,
    MaterialRequestHistoryRepository,
    MaterialRequestsService,
    MaterialRequestsResolver,
  ],
  exports: [MaterialRequestsService, TypeOrmModule],
})
export class MaterialRequestsModule {}
