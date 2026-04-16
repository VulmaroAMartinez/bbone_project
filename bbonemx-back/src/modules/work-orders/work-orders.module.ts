import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  WorkOrder,
  WorkOrderPhoto,
  WorkOrderTechnician,
  WorkOrderSignature,
  WorkOrderSparePart,
  WorkOrderMaterial,
  WorkOrderConformityRecord,
} from './domain/entities';

import {
  WorkOrdersRepository,
  WorkOrderPhotosRepository,
  WorkOrderTechniciansRepository,
  WorkOrderSignaturesRepository,
  WorkOrderSparePartsRepository,
  WorkOrderMaterialsRepository,
  WorkOrderConformityRecordsRepository,
} from './infrastructure/repositories';

import {
  WorkOrdersService,
  WorkOrderPhotosService,
  WorkOrderTechniciansService,
  WorkOrderSignaturesService,
  WorkOrderSparePartsService,
  WorkOrderMaterialsService,
  WorkOrderPdfService,
  WorkOrderConformityService,
} from './application/services';

import {
  WorkOrdersResolver,
  WorkOrderConformityResolver,
} from './presentation/resolvers';
import { AreasModule } from '../catalogs/areas/areas.module';
import { SubAreasModule } from '../catalogs/sub-areas/sub-areas.module';
import { UsersModule } from '../users/users.module';
import { TechnicianSchedulesModule } from '../technician-schedules/technician-schedules.module';
import { ShiftsModule } from '../catalogs/shifts/shifts.module';

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
      WorkOrderConformityRecord,
    ]),
    AreasModule,
    SubAreasModule,
    UsersModule,
    TechnicianSchedulesModule,
    ShiftsModule,
  ],
  providers: [
    WorkOrdersRepository,
    WorkOrderPhotosRepository,
    WorkOrderTechniciansRepository,
    WorkOrderSignaturesRepository,
    WorkOrderSparePartsRepository,
    WorkOrderMaterialsRepository,
    WorkOrderConformityRecordsRepository,
    WorkOrdersService,
    WorkOrderPhotosService,
    WorkOrderTechniciansService,
    WorkOrderSignaturesService,
    WorkOrderSparePartsService,
    WorkOrderMaterialsService,
    WorkOrderPdfService,
    WorkOrderConformityService,
    WorkOrdersResolver,
    WorkOrderConformityResolver,
  ],
  exports: [
    WorkOrdersService,
    WorkOrderPhotosService,
    WorkOrderTechniciansService,
    WorkOrderSignaturesService,
    WorkOrderSparePartsService,
    WorkOrderMaterialsService,
    WorkOrderConformityService,
    TypeOrmModule,
  ],
})
export class WorkOrdersModule {}
