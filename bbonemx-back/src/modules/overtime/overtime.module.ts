import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Overtime } from './domain/entities';
import { OvertimeRepository } from './infrastructure/repositories';
import { OvertimeService } from './application/services';
import { OvertimeResolver } from './presentation/resolvers';
import { TechniciansModule } from 'src/modules/catalogs/technicians/technicians.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Overtime]),
    TechniciansModule,
  ],
  providers: [OvertimeRepository, OvertimeService, OvertimeResolver],
  exports: [OvertimeService, TypeOrmModule],
})
export class OvertimeModule {}
