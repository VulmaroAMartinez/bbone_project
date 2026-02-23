import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { METADATA_KEYS } from '../constants';

/**
 * Guard que verifica la autenticación JWT en requests GraphQL.
 * Respeta el decorador @Public() para endpoints que no requieren auth.
 * 
 * Se aplica globalmente en AppModule.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determina si el request puede proceder.
   * Retorna true si el endpoint es público o si el JWT es válido.
   */
  canActivate(context: ExecutionContext) {
    // Verificar si el endpoint está marcado como público
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      METADATA_KEYS.IS_PUBLIC,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Obtiene el request del contexto GraphQL.
   * Necesario porque GraphQL no usa el request HTTP directamente.
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
