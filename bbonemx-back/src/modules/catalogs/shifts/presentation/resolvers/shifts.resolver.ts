import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ShiftType } from '../types';
import { JwtAuthGuard, Role, Roles, RolesGuard } from 'src/common';
import { UseGuards } from '@nestjs/common';
import { ShiftsService } from '../../application/services/shifts.service';
import { CreateShiftInput, UpdateShiftInput } from '../../application/dto';

@Resolver(() => ShiftType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsResolver {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Query(() => [ShiftType], { name: 'shifts' })
  @Roles(Role.ADMIN, Role.BOSS)
  async shifts() {
    return this.shiftsService.findAll();
  }

  @Query(() => [ShiftType], { name: 'shiftsActive' })
  @Roles(Role.ADMIN, Role.BOSS)
  async shiftsActive() {
    return this.shiftsService.findAllActive();
  }

  @Query(() => [ShiftType], { name: 'shiftsWithDeleted' })
  @Roles(Role.ADMIN, Role.BOSS)
  async shiftsWithDeleted() {
    return this.shiftsService.findAllWithDeleted();
  }

  @Query(() => ShiftType, { name: 'shift', nullable: true })
  @Roles(Role.ADMIN, Role.BOSS)
  async shift(@Args('id', { type: () => ID }) id: string) {
    return this.shiftsService.findById(id);
  }

  @Mutation(() => ShiftType, { name: 'createShift' })
  @Roles(Role.ADMIN)
  async createShift(@Args('input') input: CreateShiftInput) {
    return this.shiftsService.create(input);
  }

  @Mutation(() => ShiftType, { name: 'updateShift' })
  @Roles(Role.ADMIN)
  async updateShift(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateShiftInput,
  ) {
    return this.shiftsService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deactivateShift' })
  @Roles(Role.ADMIN)
  async deactivateShift(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.shiftsService.deactivate(id);
    return true;
  }

  @Mutation(() => ShiftType, { name: 'activateShift' })
  @Roles(Role.ADMIN)
  async activateShift(@Args('id', { type: () => ID }) id: string) {
    return this.shiftsService.activate(id);
  }
}
