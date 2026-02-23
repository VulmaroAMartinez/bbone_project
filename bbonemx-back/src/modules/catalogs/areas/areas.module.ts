import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Area } from "./domain/entities";
import { AreasRepository } from "./infrastructure/repositories";
import { AreasService } from "./application/services";
import { AreasResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([Area])],
    providers: [AreasRepository, AreasService, AreasResolver],
    exports: [AreasService, AreasRepository, TypeOrmModule],
})
export class AreasModule {}