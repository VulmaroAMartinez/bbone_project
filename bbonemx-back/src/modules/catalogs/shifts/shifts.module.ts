import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shift } from "./domain/entities";
import { ShiftsService } from "./application/services/shifts.service";
import { ShiftsRepository } from "./infrastructure/repositories";
import { ShiftsResolver } from "./presentation/resolvers";

@Module({
    imports: [TypeOrmModule.forFeature([Shift])],
    providers: [ShiftsService, ShiftsRepository, ShiftsResolver],
    exports: [ShiftsService, ShiftsRepository, TypeOrmModule],
})
export class ShiftsModule {}