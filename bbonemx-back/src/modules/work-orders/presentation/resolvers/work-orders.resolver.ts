import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import {
    WorkOrdersService,
    WorkOrderPhotosService,
    WorkOrderTechniciansService,
    WorkOrderSignaturesService,
    WorkOrderSparePartsService,
    WorkOrderMaterialsService,
} from "../../application/services";
import {
    CreateWorkOrderInput,
    AssignWorkOrderInput,
    StartWorkOrderInput,
    PauseWorkOrderInput,
    CompleteWorkOrderInput,
    UpdateWorkOrderInput,
    WorkOrderFiltersInput,
    PaginationInput,
    WorkOrderSortInput,
    CreateWorkOrderPhotoInput,
    AssignTechnicianInput,
    CreateWorkOrderSignatureInput,
    AddWorkOrderSparePartInput,
    AddWorkOrderMaterialInput,
} from "../../application/dto";
import {
    WorkOrderType,
    WorkOrderPaginatedResponse,
    WorkOrderStats,
    WorkOrderPhotoType,
    WorkOrderTechnicianType,
    WorkOrderSignatureType,
    WorkOrderSparePartType,
    WorkOrderMaterialType,
} from "../types";
import { UserType } from "src/modules/users/presentation/types";
import {
    JwtAuthGuard,
    RolesGuard,
    Role,
    Roles,
    CurrentUser,
    PhotoType,
    WorkOrderStatus
} from "src/common";
import { WorkOrder } from "../..";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
    NOTIFICATION_EVENTS,
    WorkOrderCreatedByRequesterEvent
 } from "src/common";
import { User, UsersService } from "src/modules/users";
import { WorkOrderTechnician } from "../../domain/entities";


@Resolver(() => WorkOrderType)
@UseGuards(JwtAuthGuard)
export class WorkOrdersResolver {
    constructor(
        private readonly workOrdersService: WorkOrdersService,
        private readonly workOrderPhotosService: WorkOrderPhotosService,
        private readonly workOrderTechniciansService: WorkOrderTechniciansService,
        private readonly workOrderSignaturesService: WorkOrderSignaturesService,
        private readonly workOrderSparePartsService: WorkOrderSparePartsService,
        private readonly workOrderMaterialsService: WorkOrderMaterialsService,
        private readonly usersService: UsersService,
        private readonly eventEmitter: EventEmitter2,
    ) { }


    // =============================== QUERIES ===============================

    @Query(() => [WorkOrderType], { name: "workOrders" })
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    findAll() {
        return this.workOrdersService.findAll();
    }

    @Query(() => WorkOrderPaginatedResponse, { name: "workOrdersFiltered" })
    async findFiltered(
        @Args('filters', { nullable: true }) filters?: WorkOrderFiltersInput,
        @Args('pagination', { nullable: true }) pagination?: PaginationInput,
        @Args('sort', { nullable: true }) sort?: WorkOrderSortInput,
    ): Promise<WorkOrderPaginatedResponse > {
        const { data, total } = await this.workOrdersService.findWithFilters(filters || {}, pagination || { page: 1, limit: 20 }, sort || { field: 'createdAt', order: 'DESC' });
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        return {
            data: data as unknown as WorkOrderType[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    @Query(() => WorkOrderType, { name: "workOrder", nullable: true })
    findById(@Args('id', { type: () => ID }) id: string) {
        return this.workOrdersService.findById(id);
    }

    @Query(() => WorkOrderType, { name: "workOrderByFolio", nullable: true })
    findByFolio(@Args('folio', { type: () => String }) folio: string) {
        return this.workOrdersService.findByFolio(folio);
    }

    @Query(() => [WorkOrderType], { name: "myAssignedWorkOrders" })
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    findMyAssigned(@CurrentUser('id') userId: string) {
        return this.workOrdersService.findByTechnicianId(userId);
    }

    @Query(() => [WorkOrderType], { name: 'myRequestedWorkOrders' })
    findMyRequested(@CurrentUser('id') userId: string) {
        return this.workOrdersService.findByRequesterId(userId);
    }

    @Query(() => [WorkOrderStats], { name: 'workOrderStats' })
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    getStats() {
        return this.workOrdersService.getStatsByStatus();
    }

    // =============================== MUTATIONS ===============================

    @Mutation(() => WorkOrderType)
    async createWorkOrder(
        @Args('input') input: CreateWorkOrderInput,
        @CurrentUser() user: User,
    ) {
        const wo = await this.workOrdersService.create(input, user.id);

        // Solo notificar si quien crea es REQUESTER
        if (user.role?.name === 'REQUESTER') {
            this.eventEmitter.emit(
                NOTIFICATION_EVENTS.WORK_ORDER_CREATED_BY_REQUESTER,
                new WorkOrderCreatedByRequesterEvent(
                    wo.id,
                    wo.folio,
                    wo.description,
                    user.id,
                    `${user.firstName} ${user.lastName}`,
                ),
            );
        }

        return wo;
    }

    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    assignWorkOrder(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: AssignWorkOrderInput,
        @CurrentUser('id') userId: string,
    ) {
        return this.workOrdersService.assign(id, input, userId);
    }

    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    startWorkOrder(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: StartWorkOrderInput,
        @CurrentUser('id') userId: string,
    ) {
        return this.workOrdersService.start(id, input, userId);
    }

    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    pauseWorkOrder(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: PauseWorkOrderInput,
        @CurrentUser('id') userId: string,
    ) {
        return this.workOrdersService.pause(id, input, userId);
    }

    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    resumeWorkOrder(
        @Args('id', { type: () => ID }) id: string,
    ) {
        return this.workOrdersService.resume(id);
    }

    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    completeWorkOrder(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: CompleteWorkOrderInput,
        @CurrentUser('id') userId: string,
    ) {
        return this.workOrdersService.complete(id, input, userId);
    }

    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    updateWorkOrder(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: UpdateWorkOrderInput,
    ) {
        return this.workOrdersService.update(id, input);
    }


    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    deleteWorkOrder(@Args('id', { type: () => ID }) id: string) {
        return this.workOrdersService.deactivate(id);
    }

    @Mutation(() => WorkOrderType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    changeWorkOrderStatus(
        @Args('id', { type: () => ID }) id: string,
        @Args('status') status: WorkOrderStatus,
    ) {
        return this.workOrdersService.changeStatus(id, status);
    }

    @Mutation(() => WorkOrderPhotoType)
    uploadWorkOrderPhoto(
        @Args('input') input: CreateWorkOrderPhotoInput,
        @CurrentUser('id') userId: string,
    ) {
        return this.workOrderPhotosService.create(input, userId);
    }

    @Mutation(() => WorkOrderPhotoType)
    deleteWorkOrderPhoto(@Args('id', { type: () => ID }) id: string) {
        return this.workOrderPhotosService.delete(id);
    }

    @Mutation(() => WorkOrderTechnicianType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    assignTechnician(
        @Args('input') input: AssignTechnicianInput,
        @CurrentUser('id') userId: string,
    ) {
        return this.workOrderTechniciansService.assignMetadata(input, userId);
    }

    @Mutation(() => WorkOrderTechnicianType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    setLeadTechnician(
        @Args('id', { type: () => ID }) id: string,
        @Args('technicianId', { type: () => ID }) technicianId: string,
    ) {
        return this.workOrderTechniciansService.setAsLead(id, technicianId);
    }


    @Mutation(() => Boolean)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN)
    async unassignTechnician(
        @Args('id', { type: () => ID }) id: string,
        @Args('technicianId', { type: () => ID }) technicianId: string,
    ): Promise<boolean> {
        await this.workOrderTechniciansService.unassign(id, technicianId);
        return true;
    }

    @Mutation(() => WorkOrderSignatureType)
    @UseGuards(RolesGuard) @Roles(Role.ADMIN, Role.TECHNICIAN, Role.REQUESTER)
    signWorkOrder(
        @Args('input') input: CreateWorkOrderSignatureInput,
        @CurrentUser() user: User,
    ) {
        return this.workOrderSignaturesService.sign(input, user);
    }

    // ── Spare Parts ──

    @Mutation(() => WorkOrderSparePartType)
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    addWorkOrderSparePart(@Args('input') input: AddWorkOrderSparePartInput) {
        return this.workOrderSparePartsService.add(input);
    }

    @Mutation(() => Boolean)
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    async removeWorkOrderSparePart(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        await this.workOrderSparePartsService.remove(id);
        return true;
    }

    // ── Materials ──

    @Mutation(() => WorkOrderMaterialType)
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    addWorkOrderMaterial(@Args('input') input: AddWorkOrderMaterialInput) {
        return this.workOrderMaterialsService.add(input);
    }

    @Mutation(() => Boolean)
    @UseGuards(RolesGuard) @Roles(Role.TECHNICIAN)
    async removeWorkOrderMaterial(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
        await this.workOrderMaterialsService.remove(id);
        return true;
    }

    // =============================== RESOLVE FIELDS ===============================

    @ResolveField(() => [WorkOrderPhotoType, {name: 'photos'}])
    async photos(@Parent() workOrder: WorkOrder) {
        return this.workOrderPhotosService.findByWorkOrderId(workOrder.id);
    }

    @ResolveField(() => [WorkOrderPhotoType], {name: 'photosBeforeStart'})
    getPhotosBeforeStart(@Parent() workOrder: WorkOrder) {
        return this.workOrderPhotosService.findByWorkOrderAndPhotoType(workOrder.id, PhotoType.BEFORE);
    }

    @ResolveField(() => [WorkOrderPhotoType], {name: 'photosAfterStart'})
    getPhotosAfterStart(@Parent() workOrder: WorkOrder) {
        return this.workOrderPhotosService.findByWorkOrderAndPhotoType(workOrder.id, PhotoType.AFTER);
    }

    @ResolveField(() => [WorkOrderTechnicianType], {name: 'technicians'})
    getTechnicians(@Parent() workOrder: WorkOrder) {
        return this.workOrderTechniciansService.findByWorkOrderId(workOrder.id);
    }

    @ResolveField(() => [WorkOrderSignatureType], {name: 'signatures'})
    getSignatures(@Parent() workOrder: WorkOrder) {
        return this.workOrderSignaturesService.findByWorkOrderId(workOrder.id);
    }

    @ResolveField(() => Int, {name: 'signaturesCount'})
    getSignaturesCount(@Parent() workOrder: WorkOrder) {
        return this.workOrderSignaturesService.countByWorkOrderId(workOrder.id);
    }

    @ResolveField(() => Boolean, {name: 'isFullySigned'})
    getIsFullySigned(@Parent() workOrder: WorkOrder) {
        return this.workOrderSignaturesService.isFullySigned(workOrder.id);
    }

    @ResolveField(() => [WorkOrderSparePartType], {name: 'spareParts'})
    getSpareParts(@Parent() workOrder: WorkOrder) {
        return this.workOrderSparePartsService.findByWorkOrderId(workOrder.id);
    }

    @ResolveField(() => [WorkOrderMaterialType], {name: 'materials'})
    getMaterials(@Parent() workOrder: WorkOrder) {
        return this.workOrderMaterialsService.findByWorkOrderId(workOrder.id);
    }

    @ResolveField(() => UserType, { name: 'technician' })
    async technician(@Parent() wot: WorkOrderTechnician) {
        return this.usersService.findById(wot.technicianId);
    }

}
