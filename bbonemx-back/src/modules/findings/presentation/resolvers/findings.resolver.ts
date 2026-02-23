import { Resolver, Query, Mutation, Args, ID, Int } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { FindingsService } from "../../application/services";
import {
    CreateFindingInput,
    UpdateFindingInput,
    FindingFiltersInput,
    FindingPaginationInput,
    FindingSortInput,
} from "../../application/dto";
import { FindingType, FindingPaginatedResponse, FindingStats } from "../types";
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser, Role } from "src/common";

@Resolver(() => FindingType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FindingsResolver {
    constructor(private readonly findingsService: FindingsService) { }

    @Query(() => [FindingType], { name: "findings" })
    async findings() {
        return this.findingsService.findAll();
    }

    @Query(() => [FindingType], { name: "findingsOpen" })
    async findingsOpen() {
        return this.findingsService.findAllOpen();
    }

    @Query(() => FindingType, { name: "finding", nullable: true })
    async finding(@Args("id", { type: () => ID }) id: string) {
        return this.findingsService.findById(id);
    }

    @Query(() => FindingType, { name: "findingByFolio", nullable: true })
    async findingByFolio(@Args("folio", { type: () => String }) folio: string) {
        return this.findingsService.findByFolio(folio);
    }

    @Query(() => FindingPaginatedResponse, { name: 'findingsFiltered' })
    async findFiltered(
        @Args('filters', { nullable: true }) filters?: FindingFiltersInput,
        @Args('pagination', { nullable: true }) pagination?: FindingPaginationInput,
        @Args('sort', { nullable: true }) sort?: FindingSortInput,
    ): Promise<FindingPaginatedResponse> {
        const { data, total } = await this.findingsService.findWithFilters(filters, pagination, sort);
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        return {
            data: data as unknown as FindingType[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    @Query(() => [FindingStats], { name: "findingsStats" })
    async findingsStats() {
        return this.findingsService.getStatsByStatus();
    }

    @Query(() => Int, { name: "findingsCountOpen" })
    async findingsCountOpen() {
        return this.findingsService.countOpen();
    }

    @Mutation(() => FindingType)
    createFinding(@Args("input") input: CreateFindingInput) {
        return this.findingsService.create(input);
    }

    @Mutation(() => FindingType)
    updateFinding(@Args("id", { type: () => ID }) id: string, @Args("input") input: UpdateFindingInput) {
        return this.findingsService.update(id, input);
    }

    @Mutation(() => FindingType)
    deleteFinding(@Args("id", { type: () => ID }) id: string) {
        return this.findingsService.softDelete(id);
    }

    @Mutation(() => FindingType)
    convertToWorkOrder(@Args("id", { type: () => ID }) id: string) {
        return this.findingsService.convertToWorkOrder(id);
    }

}