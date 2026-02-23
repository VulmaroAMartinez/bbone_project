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
    // Obtener roles requeridos del decorador
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario del contexto GraphQL
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    // Si no hay usuario, denegar acceso
    if (!user) {
      return false;
    }

    const userRoleName = user.role?.name;
    return requiredRoles.some((role) => role === userRoleName);
  }
}
