import { Resolver, Query, Args, ID, Mutation } from "@nestjs/graphql";
import { MachineType } from "../types";
import { MachinesService } from "../../application/services";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, RolesGuard, Role, Roles } from "src/common";
import { CreateMachineInput, UpdateMachineInput } from "../../application/dto";

@Resolver(() => MachineType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachinesResolver {
    constructor(private readonly machinesService: MachinesService) {}

    @Query(() => [MachineType], { name: "machines" })
    async machines() {
        return this.machinesService.findAll();
    }

    @Query(() => [MachineType], { name: "machinesActive" })
    async machinesActive() {
        return this.machinesService.findAllActive();
    }

    @Query(() => MachineType, { name: "machine", nullable: true })
    async machine(@Args("id", { type: () => ID }) id: string) {
        return this.machinesService.findById(id);
    }

    @Mutation(() => MachineType, { name: "createMachine" })
    @Roles(Role.ADMIN)
    async createMachine(@Args("input") input: CreateMachineInput) {
        return this.machinesService.create(input);
    }

    @Mutation(() => MachineType, { name: "updateMachine" })
    @Roles(Role.ADMIN)
    async updateMachine(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateMachineInput) {
        return this.machinesService.update(id, input);
    }

    @Mutation(() => Boolean, { name: "deactivateMachine" })
    @Roles(Role.ADMIN)
    async deactivateMachine(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.machinesService.deactivate(id);
        return true;
    }

    @Mutation(() => MachineType, { name: "activateMachine" })
    @Roles(Role.ADMIN)
    async activateMachine(@Args("id", { type: () => ID }) id: string) {
        return this.machinesService.activate(id);
    }
}