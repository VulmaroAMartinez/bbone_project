import { MaterialRequestType, MaterialRequestMaterialType } from "../types";
import { MaterialRequestsService } from "../../application/services";
import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard, Roles, RolesGuard, Role } from "src/common";
import { CreateMaterialRequestInput, UpdateMaterialRequestInput, AddMaterialToRequestInput } from "../../application/dto";

@Resolver(() => MaterialRequestType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialRequestsResolver {
    constructor(private readonly materialRequestsService: MaterialRequestsService) {}

    @Query(() => [MaterialRequestType], { name: "materialRequests" })
    async materialRequests() {
        return this.materialRequestsService.findAll();
    }

    @Query(() => [MaterialRequestType], { name: "materialRequestsActive" })
    async materialRequestsActive() {
        return this.materialRequestsService.findAllActive();
    }

    @Query(() => MaterialRequestType, { name: "materialRequest", nullable: true })
    async materialRequest(@Args("id", { type: () => ID }) id: string) {
        return this.materialRequestsService.findById(id);
    }

    @Query(() => MaterialRequestType, { name: "materialRequestByFolio", nullable: true })
    async materialRequestByFolio(@Args("folio") folio: string) {
        return this.materialRequestsService.findByFolio(folio);
    }

    @Mutation(() => MaterialRequestType)
    async createMaterialRequest(@Args("input") input: CreateMaterialRequestInput) {
        return this.materialRequestsService.create(input);
    }

    @Mutation(() => MaterialRequestType)
    async updateMaterialRequest(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateMaterialRequestInput) {
        return this.materialRequestsService.update(id, input);
    }

    @Mutation(() => MaterialRequestMaterialType)
    async addMaterialToRequest(
        @Args("materialRequestId", { type: () => ID }) materialRequestId: string,
        @Args("input") input: AddMaterialToRequestInput,
    ) {
        return this.materialRequestsService.addMaterial(materialRequestId, input);
    }

    @Mutation(() => Boolean)
    async removeMaterialFromRequest(@Args("materialRequestMaterialId", { type: () => ID }) id: string) {
        return this.materialRequestsService.removeMaterial(id);
    }

    @Mutation(() => Boolean)
    @Roles(Role.ADMIN)
    async deactivateMaterialRequest(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        return this.materialRequestsService.deactivate(id);
    }
}
