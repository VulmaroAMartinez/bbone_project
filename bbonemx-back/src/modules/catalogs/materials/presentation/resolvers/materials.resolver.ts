import { MaterialType } from "../types";
import { MaterialsService } from "../../application/services";
import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard, Role } from "src/common";
import { CreateMaterialInput, UpdateMaterialInput } from "../../application/dto";

@Resolver(() => MaterialType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsResolver {
    constructor(private readonly materialsService: MaterialsService) {}

    @Query(() => [MaterialType], { name: "materials" })
    async materials() {
        return this.materialsService.findAll();
    }

    @Query(() => [MaterialType], { name: "materialsActive" })
    async materialsActive() {
        return this.materialsService.findAllActive();
    }

    @Query(() => MaterialType, { name: "material", nullable: true })
    async material(@Args("id", { type: () => ID }) id: string) {
        return this.materialsService.findById(id);
    }

    @Mutation(() => MaterialType)
    @Roles(Role.ADMIN)
    async createMaterial(@Args("input") input: CreateMaterialInput) {
        return this.materialsService.create(input);
    }

    @Mutation(() => MaterialType)
    @Roles(Role.ADMIN)
    async updateMaterial(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateMaterialInput) {
        return this.materialsService.update(id, input);
    }

    @Mutation(() => Boolean)
    @Roles(Role.ADMIN)
    async deactivateMaterial(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.materialsService.deactivate(id);
        return true;
    }

    @Mutation(() => MaterialType)
    @Roles(Role.ADMIN)
    async activateMaterial(@Args("id", { type: () => ID }) id: string) {
        return this.materialsService.activate(id);
    }
}
