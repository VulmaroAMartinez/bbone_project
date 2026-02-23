import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SparePart } from "./domain/entities";
import { SparePartsRepository } from "./infrastructure/repositories";
import { SparePartsService } from "./application/services";
import { SparePartsResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([SparePart])],
    providers: [SparePartsRepository, SparePartsService, SparePartsResolver],
    exports: [SparePartsService, SparePartsRepository, TypeOrmModule],
})
export class SparePartsModule {}
