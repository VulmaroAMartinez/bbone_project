import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AbsenceReason } from "./domain/entities";
import { AbsenceReasonsService } from "./application/services";
import { AbsenceReasonsRepository } from "./infrastructure/repositories";
import { AbsenceReasonsResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([AbsenceReason])],
    providers: [AbsenceReasonsService, AbsenceReasonsRepository, AbsenceReasonsResolver],
    exports: [AbsenceReasonsService, AbsenceReasonsRepository, TypeOrmModule],
})
export class AbsenceReasonsModule {}