import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Material } from "./domain/entities";
import { MaterialsRepository } from "./infrastructure/repositories";
import { MaterialsService } from "./application/services";
import { MaterialsResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([Material])],
    providers: [MaterialsRepository, MaterialsService, MaterialsResolver],
    exports: [MaterialsService, MaterialsRepository, TypeOrmModule],
})
export class MaterialsModule {}
