import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from 'src/common/guards';
import { CurrentUser, Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';
import { ReasonForPayment } from 'src/common/enums/reason-for-payment.enum';
import { OvertimeService } from '../../application/services';
import {
  CreateOvertimeInput,
  UpdateOvertimeInput,
} from '../../application/dto';
import { OvertimeType } from '../types';
import { User } from 'src/modules/users/domain/entities';

@Resolver(() => OvertimeType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OvertimeResolver {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Query(() => [OvertimeType], { name: 'overtimeRecords' })
  @Roles(Role.ADMIN)
  async findAll(
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
    @Args('positionId', { type: () => ID, nullable: true }) positionId?: string,
    @Args('reasonForPayment', { type: () => ReasonForPayment, nullable: true })
    reasonForPayment?: ReasonForPayment,
  ) {
    return this.overtimeService.findAll({
      startDate,
      endDate,
      positionId,
      reasonForPayment,
    });
  }

  @Query(() => [OvertimeType], { name: 'myOvertimeRecords' })
  @Roles(Role.TECHNICIAN)
  async findMyRecords(@CurrentUser() user: User) {
    return this.overtimeService.findMyRecords(user.id);
  }

  @Query(() => OvertimeType, { name: 'overtimeRecord', nullable: true })
  async findById(@Args('id', { type: () => ID }) id: string) {
    return this.overtimeService.findById(id);
  }

  @Mutation(() => OvertimeType)
  async createOvertime(
    @Args('input') input: CreateOvertimeInput,
    @CurrentUser() user: User,
  ) {
    return this.overtimeService.create(input, user);
  }

  @Mutation(() => OvertimeType)
  async updateOvertime(
    @Args('input') input: UpdateOvertimeInput,
    @CurrentUser() user: User,
  ) {
    return this.overtimeService.update(input, user);
  }

  @Mutation(() => Boolean)
  async deleteOvertime(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.overtimeService.delete(id, user);
  }
}
