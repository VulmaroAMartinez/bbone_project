import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianSchedule } from './domain/entities';
import { AbsenceReasonsModule } from '../catalogs';
import { TechnicianSchedulesRepository } from './infrastructure/repositories';
import { TechnicianSchedulesService } from './application/services';
import { TechnicianSchedulesResolver } from './presentation/resolvers';



@Module({
    imports: [
        TypeOrmModule.forFeature([TechnicianSchedule]),
        AbsenceReasonsModule,
    ],
    providers: [
        TechnicianSchedulesRepository,
        TechnicianSchedulesService,
        TechnicianSchedulesResolver,
    ],
    exports: [
        TechnicianSchedulesService,
        TypeOrmModule,
    ],
})
export class TechnicianSchedulesModule {}