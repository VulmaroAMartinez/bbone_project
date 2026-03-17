import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialRequest, MaterialRequestItem } from './domain/entities';
import {
  MaterialRequestsRepository,
  MaterialRequestItemsRepository,
} from './infrastructure/repositories';
import { MaterialRequestsService } from './application/services';
import { MaterialRequestsResolver } from './presentation/resolvers';
import { SparePartsModule } from '../catalogs/spare-parts/spare-parts.module';
import { MaterialsModule } from '../catalogs/materials/materials.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaterialRequest, MaterialRequestItem]),
    MaterialsModule,
    SparePartsModule,
  ],
  providers: [
    MaterialRequestsRepository,
    MaterialRequestItemsRepository,
    MaterialRequestsService,
    MaterialRequestsResolver,
  ],
  exports: [MaterialRequestsService, TypeOrmModule],
})
export class MaterialRequestsModule {}
