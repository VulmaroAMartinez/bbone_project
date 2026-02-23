import { SparePartType } from "../types";
import { SparePartsService } from "../../application/services";
import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard, Role } from "src/common";
import { CreateSparePartInput, UpdateSparePartInput } from "../../application/dto";

@Resolver(() => SparePartType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SparePartsResolver {
    constructor(private readonly sparePartsService: SparePartsService) {}

    @Query(() => [SparePartType], { name: "spareParts" })
    async spareParts() {
        return this.sparePartsService.findAll();
    }

    @Query(() => [SparePartType], { name: "sparePartsActive" })
    async sparePartsActive() {
        return this.sparePartsService.findAllActive();
    }

    @Query(() => SparePartType, { name: "sparePart", nullable: true })
    async sparePart(@Args("id", { type: () => ID }) id: string) {
        return this.sparePartsService.findById(id);
    }

    @Query(() => [SparePartType], { name: "sparePartsByMachine" })
    async sparePartsByMachine(@Args("machineId", { type: () => ID }) machineId: string) {
        return this.sparePartsService.findByMachineId(machineId);
    }

    @Mutation(() => SparePartType)
    @Roles(Role.ADMIN)
    async createSparePart(@Args("input") input: CreateSparePartInput) {
        return this.sparePartsService.create(input);
    }

    @Mutation(() => SparePartType)
    @Roles(Role.ADMIN)
    async updateSparePart(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateSparePartInput) {
        return this.sparePartsService.update(id, input);
    }

    @Mutation(() => Boolean)
    @Roles(Role.ADMIN)
    async deactivateSparePart(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.sparePartsService.deactivate(id);
        return true;
    }

    @Mutation(() => SparePartType)
    @Roles(Role.ADMIN)
    async activateSparePart(@Args("id", { type: () => ID }) id: string) {
        return this.sparePartsService.activate(id);
    }
}
