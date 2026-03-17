import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { MachineType } from '../types';
import { SparePartType } from 'src/modules/catalogs/spare-parts/presentation/types';
import { WorkOrderType } from 'src/modules/work-orders/presentation/types';
import { MaterialRequestType } from 'src/modules/material-requests/presentation/types';
import { MachinesService } from '../../application/services';
import { SparePartsService } from 'src/modules/catalogs/spare-parts/application/services';
import { WorkOrdersService } from 'src/modules/work-orders/application/services';
import { MaterialRequestsService } from 'src/modules/material-requests/application/services';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Role, Roles } from 'src/common';
import { CreateMachineInput, UpdateMachineInput } from '../../application/dto';
import { Machine } from '../../domain/entities';

@Resolver(() => MachineType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MachinesResolver {
  constructor(
    private readonly machinesService: MachinesService,
    private readonly sparePartsService: SparePartsService,
    @Inject(forwardRef(() => WorkOrdersService))
    private readonly workOrdersService: WorkOrdersService,
    @Inject(MaterialRequestsService)
    private readonly materialRequestsService: MaterialRequestsService,
  ) {}

  // =============================== QUERIES ===============================

  @Query(() => [MachineType], { name: 'machines' })
  async machines() {
    return this.machinesService.findAll();
  }

  @Query(() => [MachineType], { name: 'machinesActive' })
  async machinesActive() {
    return this.machinesService.findAllActive();
  }

  @Query(() => [MachineType], { name: 'machinesWithDeleted' })
  async machinesWithDeleted() {
    return this.machinesService.findAllWithDeleted();
  }

  @Query(() => [MachineType], { name: 'machinesByAreaOrSubArea' })
  async machinesByAreaOrSubArea(
    @Args('areaId', { type: () => ID, nullable: true }) areaId?: string,
    @Args('subAreaId', { type: () => ID, nullable: true }) subAreaId?: string,
  ) {
    return this.machinesService.findByAreaOrSubArea(areaId, subAreaId);
  }

  @Query(() => MachineType, { name: 'machine', nullable: true })
  async machine(@Args('id', { type: () => ID }) id: string) {
    return this.machinesService.findById(id);
  }

  /**
   * Query flexible para obtener máquinas filtradas por área y/o sub-área.
   * - machinesByArea(areaId: "xxx") → máquinas directas del área + de sus sub-áreas.
   * - machinesByArea(areaId: "xxx", subAreaId: "yyy") → solo máquinas de esa sub-área.
   * - machinesByArea(subAreaId: "yyy") → solo máquinas de esa sub-área.
   */
  @Query(() => [MachineType], {
    name: 'machinesByArea',
    description: 'Búsqueda flexible de máquinas por área y/o sub-área',
  })
  async machinesByArea(
    @Args('areaId', { type: () => ID, nullable: true }) areaId?: string,
    @Args('subAreaId', { type: () => ID, nullable: true }) subAreaId?: string,
  ) {
    return this.machinesService.findByAreaOrSubArea(areaId, subAreaId);
  }

  // =============================== MUTATIONS ===============================

  @Mutation(() => MachineType, { name: 'createMachine' })
  @Roles(Role.ADMIN)
  async createMachine(@Args('input') input: CreateMachineInput) {
    return this.machinesService.create(input);
  }

  @Mutation(() => MachineType, { name: 'updateMachine' })
  @Roles(Role.ADMIN)
  async updateMachine(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMachineInput,
  ) {
    return this.machinesService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deactivateMachine' })
  @Roles(Role.ADMIN)
  async deactivateMachine(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.machinesService.deactivate(id);
    return true;
  }

  @Mutation(() => MachineType, { name: 'activateMachine' })
  @Roles(Role.ADMIN)
  async activateMachine(@Args('id', { type: () => ID }) id: string) {
    return this.machinesService.activate(id);
  }

  // =============================== RESOLVE FIELDS ===============================

  @ResolveField(() => [SparePartType], { name: 'spareParts' })
  async spareParts(@Parent() machine: Machine) {
    return this.sparePartsService.findByMachineId(machine.id);
  }

  @ResolveField(() => [WorkOrderType], { name: 'workOrders' })
  async workOrders(@Parent() machine: Machine) {
    return this.workOrdersService.findByMachineId(machine.id);
  }

  @ResolveField(() => [MaterialRequestType], { name: 'materialRequests' })
  async materialRequests(@Parent() machine: Machine) {
    return this.materialRequestsService.findByMachineId(machine.id);
  }
}
