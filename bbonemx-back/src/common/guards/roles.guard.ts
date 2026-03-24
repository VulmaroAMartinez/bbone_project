import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '../enums';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard que verifica si el usuario tiene los roles requeridos.
 * Se usa en conjunto con el decorador @Roles().
 *
 * @example
 * // En el resolver
 * @Roles(Role.ADMIN)
 * @UseGuards(RolesGuard)
 * @Mutation()
 * deleteUser() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      return false;
    }

    const userRoleNames =
      user.roles?.map((role: { name: string }) => role.name) ?? [];

    return requiredRoles.some((role) => userRoleNames.includes(role));
  }
}
