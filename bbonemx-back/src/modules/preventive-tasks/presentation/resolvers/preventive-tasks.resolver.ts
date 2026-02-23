import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { PreventiveTasksService } from "../../application/services";
import {
    CreatePreventiveTaskInput,
    UpdatePreventiveTaskInput,
    ClosePreventiveTaskInput,
    PreventiveTaskFiltersInput,
    PreventiveTaskPaginationInput,
    PreventiveTaskSortInput,
} from "../../application/dto";
import {
    PreventiveTaskType,
    PreventiveTaskPaginatedResponse,
    PreventiveTaskStats,
    GenerateWorkOrdersResult,
} from "../types";
import { PreventiveTask } from "../../domain/entities";
import { JwtAuthGuard, RolesGuard, Role, Roles, CurrentUser } from "src/common";

@Resolver(() => PreventiveTaskType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PreventiveTasksResolver {
    constructor(private readonly preventiveTasksService: PreventiveTasksService) { }

    @Query(() => [PreventiveTaskType], { name: "preventiveTasks" })
    findAll() {
        return this.preventiveTasksService.findAll();
    }

    @Query(() => [PreventiveTaskType], { name: "preventiveTasksActive" })
    findAllActive() {
        return this.preventiveTasksService.findAllActive();
    }

    @Query(() => PreventiveTaskPaginatedResponse, { name: 'preventiveTasksFiltered' })
    async findFiltered(
        @Args('filters', { nullable: true }) filters?: PreventiveTaskFiltersInput,
        @Args('pagination', { nullable: true }) pagination?: PreventiveTaskPaginationInput,
        @Args('sort', { nullable: true }) sort?: PreventiveTaskSortInput,
    ): Promise<PreventiveTaskPaginatedResponse> {
        const { data, total } = await this.preventiveTasksService.findWithFilters(filters, pagination, sort);
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        return {
            data: data as unknown as PreventiveTaskType[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    @Query(() => PreventiveTaskType, { name: "preventiveTaskById", nullable: true })
    findById(@Args('id', { type: () => ID }) id: string) {
        return this.preventiveTasksService.findById(id);
    }

    @Query(() => [PreventiveTaskType], { name: "preventiveTasksByMachineId" })
    findByMachineId(@Args('machineId', { type: () => ID }) machineId: string) {
        return this.preventiveTasksService.findByMachineId(machineId);
    }

    @Query(() => [PreventiveTaskStats], { name: "preventiveTaskStats" })
    getStats() {
        return this.preventiveTasksService.getStatsByStatus();
    }

    @Query(() => Int, { name: "preventiveTaskCountActive" })
    countActive() {
        return this.preventiveTasksService.countActive();
    }

    @Mutation(() => PreventiveTaskType, { name: "createPreventiveTask" })
    create(@Args('input') input: CreatePreventiveTaskInput) {
        return this.preventiveTasksService.create(input);
    }

    @Mutation(() => PreventiveTaskType, { name: "updatePreventiveTask" })
    update(@Args('id', { type: () => ID }) id: string, @Args('input') input: UpdatePreventiveTaskInput) {
        return this.preventiveTasksService.update(id, input);
    }

    @Mutation(() => PreventiveTaskType, { name: "activatePreventiveTask" })
    activate(@Args('id', { type: () => ID }) id: string) {
        return this.preventiveTasksService.activate(id);
    }

    @Mutation(() => PreventiveTaskType, { name: "deactivatePreventiveTask" })
    deactivate(@Args('id', { type: () => ID }) id: string) {
        return this.preventiveTasksService.deactivate(id);
    }

    @Mutation(() => PreventiveTaskType, { name: "closePreventiveTask" })
    close(@Args('id', { type: () => ID }) id: string, @Args('input') input: ClosePreventiveTaskInput) {
        return this.preventiveTasksService.close(id, input);
    }

    @Mutation(() => GenerateWorkOrdersResult, { name: "generateWorkOrdersForPreventiveTask" })
    generateWorkOrders() {
        return this.preventiveTasksService.generateDueWorkOrders();
    }

    recalculateNextExecution(@Args('id', { type: () => ID }) id: string) {
        return this.preventiveTasksService.recalculateNextExecution(id);
    }

    @ResolveField(() => String, { name: 'frequencyDescription' })
    getFrequencyDescription(@Parent() task: PreventiveTask): string {
        return task.getFrequencyDescription();
    }
}