import { Resolver, Query, Args, ID, Mutation } from "@nestjs/graphql";
import { RoleType } from "../types";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Role, Roles, RolesGuard, CurrentUser } from "src/common";
import { RolesService } from "../../application/services";
import { CreateRoleInput, UpdateRoleInput } from "../../application/dto";

@Resolver(() => RoleType)
@UseGuards(JwtAuthGuard)
export class RolesResolver {
    constructor (private readonly rolesService: RolesService){}

    @Query(() => [RoleType], { name: 'roles' })
    async findAll(): Promise<RoleType[]> {
        return this.rolesService.findAll();
    }

    @Query(() => RoleType, { name: 'rolesActive' })
    async findAllActive(): Promise<RoleType[]> {
        return this.rolesService.findAllActive();
    }

    @Query(() => RoleType, { name: 'role', nullable: true })
    async findByOne(@Args('id', { type: () => ID }) id: string): Promise<RoleType | null> {
        return this.rolesService.findByIdOrFail(id);
    }

    @Mutation(() => RoleType, { name: 'createRole' })
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async create(@Args('input') input: CreateRoleInput): Promise<RoleType> {
        return this.rolesService.create(input);
    }

    @Mutation(() => RoleType, { name: 'updateRole' })
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async update(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdateRoleInput): Promise<RoleType> {
        return this.rolesService.update(id, input);
    }

    @Mutation(() => RoleType, { name: 'deactivateRole' })
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async deactivate(@Args('id', { type: () => ID }) id: string): Promise<RoleType> {
        await this.rolesService.deactivate(id);
        return this.rolesService.findByIdOrFail(id);
    }

    @Mutation(() => RoleType, { name: 'activateRole' })
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    async activate(@Args('id', { type: () => ID }) id: string): Promise<RoleType> {
        await this.rolesService.activate(id);
        return this.rolesService.findByIdOrFail(id);
    }

}