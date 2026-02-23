import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Finding } from "./domain/entities";
import { WorkOrdersModule } from "../work-orders";
import { FindingsRepository } from "./infrastructure/repositories";
import { FindingsService } from "./application/services";
import { FindingsResolver } from "./presentation/resolvers";

@Module({
    imports: [
        TypeOrmModule.forFeature([Finding]),
        forwardRef(() => WorkOrdersModule)
    ],
    providers:[
        FindingsRepository,
        FindingsService,
        FindingsResolver,
    ],
    exports: [
        FindingsService,
        TypeOrmModule,
    ],
})
export class FindingsModule {}