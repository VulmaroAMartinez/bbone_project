import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MaterialRequest,
  MaterialRequestItem,
  MaterialRequestMachine,
  MaterialRequestHistory,
  MaterialRequestPhoto,
} from './domain/entities';
import {
  MaterialRequestsRepository,
  MaterialRequestItemsRepository,
  MaterialRequestHistoryRepository,
  MaterialRequestPhotosRepository,
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
      MaterialRequestPhoto,
    ]),
    MaterialsModule,
    SparePartsModule,
  ],
  providers: [
    MaterialRequestsRepository,
    MaterialRequestItemsRepository,
    MaterialRequestHistoryRepository,
    MaterialRequestPhotosRepository,
    MaterialRequestsService,
    MaterialRequestsResolver,
  ],
  exports: [MaterialRequestsService, TypeOrmModule],
})
export class MaterialRequestsModule {}
