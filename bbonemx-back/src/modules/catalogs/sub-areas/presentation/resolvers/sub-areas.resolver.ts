import { SubAreaType } from "../types";
import { SubAreasService } from "../../application/services";
import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard, Role } from "src/common";
import { CreateSubAreaInput, UpdateSubAreaInput } from "../../application/dto";

@Resolver(() => SubAreaType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubAreasResolver {
    constructor(private readonly subAreasService: SubAreasService) {}

    @Query(() => [SubAreaType], { name: "subAreas" })
    async subAreas() {
        return this.subAreasService.findAll();
    }

    @Query(() => [SubAreaType], { name: "subAreasActive" })
    async subAreasActive() {
        return this.subAreasService.findAllActive();
    }

    @Query(() => SubAreaType, { name: "subArea", nullable: true })
    async subArea(@Args("id", { type: () => ID }) id: string) {
        return this.subAreasService.findById(id);
    }

    @Query(() => [SubAreaType], { name: "subAreasByArea" })
    async subAreasByArea(@Args("areaId", { type: () => ID }) areaId: string) {
        return this.subAreasService.findByAreaId(areaId);
    }

    @Mutation(() => SubAreaType)
    @Roles(Role.ADMIN)
    async createSubArea(@Args("input") input: CreateSubAreaInput) {
        return this.subAreasService.create(input);
    }

    @Mutation(() => SubAreaType)
    @Roles(Role.ADMIN)
    async updateSubArea(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateSubAreaInput) {
        return this.subAreasService.update(id, input);
    }

    @Mutation(() => Boolean)
    @Roles(Role.ADMIN)
    async deactivateSubArea(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.subAreasService.deactivate(id);
        return true;
    }

    @Mutation(() => SubAreaType)
    @Roles(Role.ADMIN)
    async activateSubArea(@Args("id", { type: () => ID }) id: string) {
        return this.subAreasService.activate(id);
    }
}
