import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums';

export const ROLES_KEY = 'roles';

/**
 * Decorador que define los roles que pueden acceder a un resolver o método.
 * Se usa en conjunto con RolesGuard.
 * 
 * @example
 * // Solo administradores
 * @Roles(Role.ADMIN)
 * @Mutation()
 * deleteUser() { ... }
 * 
 * @example
 * // Admin o Técnico
 * @Roles(Role.ADMIN, Role.TECHNICIAN)
 * @Query()
 * getWorkOrders() { ... }
 */
export const Roles = (...roles: Role[]) => 
  SetMetadata(ROLES_KEY, roles);
