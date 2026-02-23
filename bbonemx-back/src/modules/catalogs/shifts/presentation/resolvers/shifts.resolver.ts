import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ShiftType } from "../types";
import { JwtAuthGuard, Role, Roles, RolesGuard } from "src/common";
import { UseGuards } from "@nestjs/common";
import { ShiftsService } from "../../application/services/shifts.service";
import { CreateShiftInput, UpdateShiftInput } from "../../application/dto";

@Resolver(() => ShiftType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ShiftsResolver {
    constructor(private readonly shiftsService: ShiftsService) {}

    @Query(() => [ShiftType], { name: "shifts" })
    async shifts() {
        return this.shiftsService.findAll();
    }

    @Query(() => [ShiftType], { name: "shiftsActive" })
    async shiftsActive() {
        return this.shiftsService.findAllActive();
    }

    @Query(() => ShiftType, { name: "shift", nullable: true })
    async shift(@Args("id", { type: () => ID }) id: string) {
        return this.shiftsService.findById(id);
    }

    @Mutation(() => ShiftType, { name: "createShift" })
    async createShift(@Args("input") input: CreateShiftInput) {
        return this.shiftsService.create(input);
    }

    @Mutation(() => ShiftType, { name: "updateShift" })
    async updateShift(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateShiftInput) {
        return this.shiftsService.update(id, input);
    }

    @Mutation(() => Boolean, { name: "deactivateShift" })
    async deactivateShift(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.shiftsService.deactivate(id);
        return true;
    }

    @Mutation(() => ShiftType, { name: "activateShift" })
    async activateShift(@Args("id", { type: () => ID }) id: string) {
        return this.shiftsService.activate(id);
    }
 }