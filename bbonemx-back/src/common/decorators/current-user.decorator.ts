import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorador que extrae el usuario autenticado del contexto GraphQL.
 *
 * @example
 * // Obtener usuario completo
 * @Query()
 * me(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * // Obtener solo una propiedad del usuario
 * @Mutation()
 * createOrder(@CurrentUser('id') userId: string) {
 *   // ...
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext<{
      req: { user?: Record<string, unknown> };
    }>().req;
    const user = request.user;

    // Si se especifica una propiedad, retornar solo esa propiedad
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
