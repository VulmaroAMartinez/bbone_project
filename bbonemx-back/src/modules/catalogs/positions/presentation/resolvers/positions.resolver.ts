import { Injectable, UseGuards } from "@nestjs/common";
import { Query, Mutation, Args, ID, Resolver } from "@nestjs/graphql";
import { Role, Roles } from "src/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { PositionsService } from "../../application/services/positions.service";
import { PositionType } from "../types/position.type";
import { CreatePositionInput, UpdatePositionInput } from "../../application/dto";

@Resolver(() => PositionType)
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
export class PositionsResolver {
    constructor(private readonly positionsService: PositionsService) {} 

    @Query(() => [PositionType], { name: "positions" })
    async positions() {
        return this.positionsService.findAll();
    }

    @Query(() => [PositionType], { name: "positionsActive" })
    async positionsActive() {
        return this.positionsService.findAllActive();
    }

    @Query(() => PositionType, { name: "position", nullable: true })
    async position(@Args("id", { type: () => ID }) id: string) {
        return this.positionsService.findById(id);
    }

    @Mutation(() => PositionType, { name: "createPosition" })
    async createPosition(@Args("input") input: CreatePositionInput) {
        return this.positionsService.create(input);
    }

    @Mutation(() => PositionType, { name: "updatePosition" })
    async updatePosition(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdatePositionInput) {
        return this.positionsService.update(id, input);
    }

    @Mutation(() => Boolean, { name: "deactivatePosition" })
    async deactivatePosition(@Args("id", { type: () => ID }) id: string) {
        return this.positionsService.deactivate(id);
    }

    @Mutation(() => PositionType, { name: "activatePosition" })
    async activatePosition(@Args("id", { type: () => ID }) id: string) {
        return this.positionsService.activate(id);
    }
}