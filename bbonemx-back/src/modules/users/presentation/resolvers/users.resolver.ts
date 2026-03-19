import { Query, Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from '../../application/services/users.service';
import { UserType } from '../types';
import { JwtAuthGuard, RolesGuard, Role, Roles } from 'src/common';
import { CreateUserInput, UpdateUserInput } from '../../application/dto';

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType], { name: 'users' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS, Role.TECHNICIAN)
  async users() {
    return this.usersService.findAll();
  }

  @Query(() => [UserType], { name: 'usersWithDeleted' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS, Role.TECHNICIAN)
  async usersWithDeleted() {
    return this.usersService.findAllWithDeleted();
  }

  @Query(() => UserType, { name: 'user', nullable: true })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.BOSS, Role.TECHNICIAN)
  async user(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findById(id);
  }

  @Mutation(() => UserType, { name: 'createUser' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => UserType, { name: 'updateUser' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deactivateUser' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deactivateUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.usersService.deactivate(id);
    return true;
  }

  @Mutation(() => UserType, { name: 'activateUser' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async activateUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.activate(id);
  }
}
