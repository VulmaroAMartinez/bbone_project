import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./domain/entities";
import { UsersRepository } from "./infrastructure/persistence/repositories";
import { UsersService } from "./application/services";
import { RolesModule } from "../catalogs/roles";
import { DepartmentsModule } from "../catalogs/departments";
import { UsersResolver } from "./presentation/resolvers";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    DepartmentsModule,
  ],
  providers: [UsersService, UsersRepository, UsersResolver],
  exports: [UsersService, UsersRepository, TypeOrmModule],
})
export class UsersModule {}