import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubArea } from "./domain/entities";
import { SubAreasRepository } from "./infrastructure/repositories";
import { SubAreasService } from "./application/services";
import { SubAreasResolver } from "./presentation/resolvers";
import { AreasModule } from "../areas";

@Module({
    imports: [TypeOrmModule.forFeature([SubArea]), AreasModule],
    providers: [SubAreasRepository, SubAreasService, SubAreasResolver],
    exports: [SubAreasService, SubAreasRepository, TypeOrmModule],
})
export class SubAreasModule {}
