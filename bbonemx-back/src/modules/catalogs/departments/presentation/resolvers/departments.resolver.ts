import { DepartmentType } from "../types";
import { DepartmentsService } from "../../application/services";
import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard, Role } from "src/common";
import { CreateDepartmentInput, UpdateDepartmentInput } from "../../application/dto";

@Resolver(() => DepartmentType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsResolver {
    constructor(private readonly departmentsService: DepartmentsService) {}

    @Query(() => [DepartmentType], { name: "departments" })
    async departments() {
        return this.departmentsService.findAll();
    }

    @Query(() => [DepartmentType], { name: "departmentsActive" })
    async departmentsActive() {
        return this.departmentsService.findAllActive();
    }

    @Query(() => DepartmentType, { name: "department", nullable: true })
    async department(@Args("id", { type: () => ID }) id: string) {
        return this.departmentsService.findById(id);
    }

    @Mutation(() => DepartmentType)
    @Roles(Role.ADMIN)
    async createDepartment(@Args("input") input: CreateDepartmentInput) {
        return this.departmentsService.create(input);
    }

    @Mutation(() => DepartmentType)
    @Roles(Role.ADMIN)
    async updateDepartment(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateDepartmentInput) {
        return this.departmentsService.update(id, input);
    }

    @Mutation(() => Boolean)
    @Roles(Role.ADMIN)
    async deactivateDepartment(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.departmentsService.deactivate(id);
        return true;
    }

    @Mutation(() => DepartmentType)
    @Roles(Role.ADMIN)
    async activateDepartment(@Args("id", { type: () => ID }) id: string) {
        return this.departmentsService.activate(id);
    }
}
