import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Machine } from "./domain/entities";
import { MachinesService } from "./application/services";
import { MachinesRepository } from "./infrastructure/repositories";
import { MachinesResolver } from "./presentation/resolvers";


@Module({
    imports: [TypeOrmModule.forFeature([Machine])],
    providers: [MachinesService, MachinesRepository, MachinesResolver],
    exports: [MachinesService, MachinesRepository, TypeOrmModule],
})
export class MachinesModule {}