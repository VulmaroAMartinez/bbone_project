import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './domain/entities';
import { PositionsRepository } from './infrastructure/repositories';
import { PositionsService } from './application/services';
import { PositionsResolver } from './presentation/resolvers';

@Module({
  imports: [TypeOrmModule.forFeature([Position])],
  providers: [PositionsRepository, PositionsService, PositionsResolver],
  exports: [PositionsService, PositionsRepository],
})
export class PositionsModule {}