import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  WorkOrder,
  WorkOrderPhoto,
  WorkOrderTechnician,
  WorkOrderSignature,
  WorkOrderSparePart,
  WorkOrderMaterial,
} from './domain/entities';

import {
  WorkOrdersRepository,
  WorkOrderPhotosRepository,
  WorkOrderTechniciansRepository,
  WorkOrderSignaturesRepository,
  WorkOrderSparePartsRepository,
  WorkOrderMaterialsRepository,
} from './infrastructure/repositories';

import {
  WorkOrdersService,
  WorkOrderPhotosService,
  WorkOrderTechniciansService,
  WorkOrderSignaturesService,
  WorkOrderSparePartsService,
  WorkOrderMaterialsService,
} from './application/services';

import { WorkOrdersResolver } from './presentation/resolvers';
import { AreasModule } from '../catalogs/areas/areas.module';
import { UsersModule } from '../users/users.module';

/**
 * Módulo de Órdenes de Trabajo.
 * Core del sistema CMMS.
 *
 * Incluye:
 * - WorkOrder: Entidad principal
 * - WorkOrderPhoto: Fotos antes/después
 * - WorkOrderTechnician: Técnicos asignados
 * - WorkOrderSignature: Firmas de cierre
 * - WorkOrderSparePart: Refacciones usadas
 * - WorkOrderMaterial: Materiales usados
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkOrder,
      WorkOrderPhoto,
      WorkOrderTechnician,
      WorkOrderSignature,
      WorkOrderSparePart,
      WorkOrderMaterial,
    ]),
    AreasModule,
    UsersModule,
  ],
  providers: [
    WorkOrdersRepository,
    WorkOrderPhotosRepository,
    WorkOrderTechniciansRepository,
    WorkOrderSignaturesRepository,
    WorkOrderSparePartsRepository,
    WorkOrderMaterialsRepository,
    WorkOrdersService,
    WorkOrderPhotosService,
    WorkOrderTechniciansService,
    WorkOrderSignaturesService,
    WorkOrderSparePartsService,
    WorkOrderMaterialsService,
    WorkOrdersResolver,
  ],
  exports: [
    WorkOrdersService,
    WorkOrderPhotosService,
    WorkOrderTechniciansService,
    WorkOrderSignaturesService,
    WorkOrderSparePartsService,
    WorkOrderMaterialsService,
    TypeOrmModule,
  ],
})
export class WorkOrdersModule {}
