import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorador que extrae el usuario autenticado del request HTTP o del contexto GraphQL.
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
    let user: Record<string, unknown> | undefined;

    if (context.getType<string>() === 'http') {
      const req = context
        .switchToHttp()
        .getRequest<{ user?: Record<string, unknown> }>();
      user = req.user;
    } else {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext<{
        req: { user?: Record<string, unknown> };
      }>().req;
      user = request.user;
    }

    // Si se especifica una propiedad, retornar solo esa propiedad
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
