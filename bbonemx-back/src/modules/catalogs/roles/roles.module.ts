import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesService } from "./application/services";
import { Role } from "./domain/entities";
import { RolesRepository } from "./infrastructure/repositories";
import { Module } from "@nestjs/common";
import { RolesResolver } from "./presentation/resolvers";
@Module({
    imports: [TypeOrmModule.forFeature([Role])],
    providers: [RolesService, RolesRepository, RolesResolver],
    exports: [RolesService, RolesRepository, TypeOrmModule],
})
export class RolesModule {}