import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Technician } from "./domain/entities";
import { TechniciansService } from "./application/services";
import { TechniciansRepository } from "./infrastructure/repositories";
import { TechniciansResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([Technician])],
    providers: [TechniciansService, TechniciansRepository, TechniciansResolver],
    exports: [TechniciansService, TechniciansRepository, TypeOrmModule],
})
export class TechniciansModule {}
