import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Finding, FindingPhoto } from './domain/entities';
import { WorkOrdersModule } from '../work-orders';
import { FindingsRepository } from './infrastructure/repositories';
import { FindingsService, FindingPhotosService } from './application/services';
import { FindingsResolver } from './presentation/resolvers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finding, FindingPhoto]),
    forwardRef(() => WorkOrdersModule),
  ],
  providers: [
    FindingsRepository,
    FindingsService,
    FindingPhotosService,
    FindingsResolver,
  ],
  exports: [FindingsService, FindingPhotosService, TypeOrmModule],
})
export class FindingsModule {}
