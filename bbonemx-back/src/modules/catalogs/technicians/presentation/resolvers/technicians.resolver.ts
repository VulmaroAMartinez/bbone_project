import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { TechnicianType } from "../types/technician.type";
import { JwtAuthGuard, Role, Roles, RolesGuard } from "src/common";
import { TechniciansService } from "../../application/services";
import { CreateTechnicianInput, UpdateTechnicianInput } from "../../application/dto";

@Resolver(() => TechnicianType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class TechniciansResolver {
    constructor(private readonly techniciansService: TechniciansService) {}

    @Query(() => [TechnicianType], { name: "technicians" })
    async technicians() {
        return this.techniciansService.findAll();
    }

    @Query(() => [TechnicianType], { name: "techniciansActive" })
    async techniciansActive() {
        return this.techniciansService.findAllActive();
    }

    @Query(() => TechnicianType, { name: "technician", nullable: true })
    async technician(@Args("id", { type: () => ID }) id: string) {
        return this.techniciansService.findById(id);
    }

    @Mutation(() => TechnicianType, { name: "createTechnician" })
    async createTechnician(@Args("input") input: CreateTechnicianInput) {
        return this.techniciansService.create(input);
    }

    @Mutation(() => TechnicianType, { name: "updateTechnician" })
    async updateTechnician(
        @Args("id", { type: () => ID }) id: string,
        @Args("input") input: UpdateTechnicianInput,
    ) {
        return this.techniciansService.update(id, input);
    }

    @Mutation(() => Boolean, { name: "deactivateTechnician" })
    async deactivateTechnician(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        return this.techniciansService.deactivate(id);
    }

    @Mutation(() => TechnicianType, { name: "activateTechnician" })
    async activateTechnician(@Args("id", { type: () => ID }) id: string) {
        return this.techniciansService.activate(id);
    }
}
