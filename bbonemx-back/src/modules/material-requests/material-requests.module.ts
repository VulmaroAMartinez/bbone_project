import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaterialRequest, MaterialRequestMaterial } from "./domain/entities";
import { MaterialRequestsRepository, MaterialRequestMaterialsRepository } from "./infrastructure/repositories";
import { MaterialRequestsService } from "./application/services";
import { MaterialRequestsResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([MaterialRequest, MaterialRequestMaterial])],
    providers: [MaterialRequestsRepository, MaterialRequestMaterialsRepository, MaterialRequestsService, MaterialRequestsResolver],
    exports: [MaterialRequestsService, TypeOrmModule],
})
export class MaterialRequestsModule {}
