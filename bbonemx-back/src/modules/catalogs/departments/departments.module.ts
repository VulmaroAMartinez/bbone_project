import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Department } from "./domain/entities";
import { DepartmentsRepository } from "./infrastructure/repositories";
import { DepartmentsService } from "./application/services";
import { DepartmentsResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([Department])],
    providers: [DepartmentsRepository, DepartmentsService, DepartmentsResolver],
    exports: [DepartmentsService, DepartmentsRepository, TypeOrmModule],
})
export class DepartmentsModule {}
