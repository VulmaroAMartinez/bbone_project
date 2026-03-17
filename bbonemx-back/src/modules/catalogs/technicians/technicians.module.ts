import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './domain/entities';
import { TechniciansService } from './application/services';
import { TechniciansRepository } from './infrastructure/repositories';
import { TechniciansResolver } from './presentation/resolvers';
import { UsersModule } from 'src/modules/users/users.module';
import { RolesModule } from 'src/modules/catalogs/roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Technician]), UsersModule, RolesModule],
  providers: [TechniciansService, TechniciansRepository, TechniciansResolver],
  exports: [TechniciansService, TechniciansRepository, TypeOrmModule],
})
export class TechniciansModule {}
