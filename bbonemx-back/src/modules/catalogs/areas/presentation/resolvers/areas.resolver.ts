import { AreaType } from "../types";
import { AreasService } from "../../application/services";
import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard, Role } from "src/common";
import { CreateAreaInput, UpdateAreaInput } from "../../application/dto";

@Resolver(() => AreaType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AreasResolver {
    constructor(private readonly areasService: AreasService) {}


    @Query(() => [AreaType], { name: "areas" })
    async areas() {
        return this.areasService.findAll();
    }

    @Query(() => [AreaType], { name: "areasActive" })
    async areasActive() {
        return this.areasService.findAllActive();
    }

    @Query(() => AreaType, { name: "area", nullable: true })
    async area(@Args("id", { type: () => ID }) id: string) {
        return this.areasService.findById(id);
    }

    @Query(() => AreaType, { name: "areaByName", nullable: true })
    async areaByName(@Args("name", { type: () => String }) name: string) {
        return this.areasService.findByName(name);
    }

    @Mutation(() => AreaType)
    @Roles(Role.ADMIN)
    async createArea(@Args("input") input: CreateAreaInput) {
        return this.areasService.create(input);
    }

    @Mutation(() => AreaType)
    @Roles(Role.ADMIN)
    async updateArea(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateAreaInput) {
        return this.areasService.update(id, input);
    }

    @Mutation(() => Boolean)
    @Roles(Role.ADMIN)
    async deactivateArea(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.areasService.deactivate(id);
        return true;
    }

    @Mutation(() => AreaType)
    @Roles(Role.ADMIN)
    async activateArea(@Args("id", { type: () => ID }) id: string) {
        return this.areasService.activate(id);
    }
}