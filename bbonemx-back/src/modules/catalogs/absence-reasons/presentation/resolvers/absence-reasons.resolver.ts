import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AbsenceReasonType } from "../types";
import { JwtAuthGuard, Role, Roles, RolesGuard } from "src/common";
import { AbsenceReasonsService } from "../../application/services";
import { CreateAbsenceReasonInput, UpdateAbsenceReasonInput } from "../../application/dto";

@Resolver(() => AbsenceReasonType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AbsenceReasonsResolver {
    constructor(private readonly absenceReasonsService: AbsenceReasonsService) {}

    @Query(() => [AbsenceReasonType], { name: "absenceReasons" })
    async absenceReasons() {
        return this.absenceReasonsService.findAll();
    }

    @Query(() => [AbsenceReasonType], { name: "absenceReasonsActive" })
    async absenceReasonsActive() {
        return this.absenceReasonsService.findAllActive();
    }

    @Query(() => AbsenceReasonType, { name: "absenceReason", nullable: true })
    async absenceReason(@Args("id", { type: () => ID }) id: string) {
        return this.absenceReasonsService.findById(id);
    }

    @Mutation(() => AbsenceReasonType, { name: "createAbsenceReason" })
    async createAbsenceReason(@Args("input") input: CreateAbsenceReasonInput) {
        return this.absenceReasonsService.create(input);
    }

    @Mutation(() => AbsenceReasonType, { name: "updateAbsenceReason" })
    async updateAbsenceReason(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateAbsenceReasonInput) {
        return this.absenceReasonsService.update(id, input);
    }

    @Mutation(() => Boolean, { name: "deactivateAbsenceReason" })
    async deactivateAbsenceReason(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        await this.absenceReasonsService.deactivate(id);
        return true;
    }

    @Mutation(() => AbsenceReasonType, { name: "activateAbsenceReason" })
    async activateAbsenceReason(@Args("id", { type: () => ID }) id: string) {
        return this.absenceReasonsService.activate(id);
    }
}