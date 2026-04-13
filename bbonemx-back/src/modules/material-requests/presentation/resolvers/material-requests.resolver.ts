import {
  MaterialRequestType,
  MaterialRequestItemType,
  MaterialRequestPhotoType,
} from '../types';
import { MaterialRequestsService } from '../../application/services';
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard, Role, CurrentUser } from 'src/common';
import { User } from 'src/modules/users/domain/entities';
import {
  CreateMaterialRequestInput,
  UpdateMaterialRequestInput,
  CreateMaterialRequestItemInput,
  SendMaterialRequestEmailInput,
  UpdateMaterialRequestHistoryInput,
  CreateMaterialRequestPhotoInput,
} from '../../application/dto';

@Resolver(() => MaterialRequestType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialRequestsResolver {
  constructor(
    private readonly materialRequestsService: MaterialRequestsService,
  ) {}

  @Query(() => [MaterialRequestType], { name: 'materialRequests' })
  async materialRequests() {
    return this.materialRequestsService.findAll();
  }

  @Query(() => [MaterialRequestType], { name: 'materialRequestsWithDeleted' })
  @Roles(Role.ADMIN, Role.BOSS)
  async materialRequestsWithDeleted(@CurrentUser() user: User) {
    return this.materialRequestsService.findAllWithDeletedForUser(user);
  }

  @Query(() => [MaterialRequestType], { name: 'materialRequestsActive' })
  async materialRequestsActive() {
    return this.materialRequestsService.findAllActive();
  }

  @Query(() => MaterialRequestType, { name: 'materialRequest', nullable: true })
  async materialRequest(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.materialRequestsService.findByIdForUser(id, user);
  }

  @Query(() => MaterialRequestType, {
    name: 'materialRequestByFolio',
    nullable: true,
  })
  async materialRequestByFolio(
    @Args('folio') folio: string,
    @CurrentUser() user: User,
  ) {
    return this.materialRequestsService.findByFolioForUser(folio, user);
  }

  @Mutation(() => MaterialRequestType)
  async createMaterialRequest(
    @Args('input') input: CreateMaterialRequestInput,
  ) {
    return this.materialRequestsService.create(input);
  }

  @Mutation(() => MaterialRequestType)
  async updateMaterialRequest(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMaterialRequestInput,
    @CurrentUser() user: User,
  ) {
    return this.materialRequestsService.update(id, input, user);
  }

  @Mutation(() => MaterialRequestItemType)
  async addMaterialToRequest(
    @Args('materialRequestId', { type: () => ID }) materialRequestId: string,
    @Args('input') input: CreateMaterialRequestItemInput,
    @CurrentUser() user: User,
  ) {
    return this.materialRequestsService.addMaterial(
      materialRequestId,
      input,
      user,
    );
  }

  @Mutation(() => Boolean)
  async removeMaterialFromRequest(
    @Args('materialRequestMaterialId', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.materialRequestsService.removeMaterial(id, user);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN, Role.BOSS)
  async deactivateMaterialRequest(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.materialRequestsService.deactivate(id, user);
  }

  @Mutation(() => Boolean, { name: 'sendMaterialRequestEmail' })
  @Roles(Role.ADMIN, Role.BOSS)
  async sendMaterialRequestEmail(
    @Args('input') input: SendMaterialRequestEmailInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.materialRequestsService.sendEmail(input, user);
  }

  @Mutation(() => MaterialRequestType)
  @Roles(Role.ADMIN, Role.BOSS)
  async updateMaterialRequestHistory(
    @Args('input') input: UpdateMaterialRequestHistoryInput,
    @CurrentUser() user: User,
  ) {
    return this.materialRequestsService.updateHistory(input, user);
  }

  @Mutation(() => MaterialRequestPhotoType)
  async addMaterialRequestPhoto(
    @Args('input') input: CreateMaterialRequestPhotoInput,
    @CurrentUser() user: User,
  ) {
    return this.materialRequestsService.addPhoto(input, user.id, user);
  }

  @Mutation(() => Boolean)
  async removeMaterialRequestPhoto(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.materialRequestsService.removePhoto(id, user);
  }
}
