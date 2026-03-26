import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { IUserContext, userContextStorage } from '../context/user.context';

/**
 * Interceptor que captura la información del usuario y la request,
 * estableciendo el contexto en AsyncLocalStorage para que esté
 * disponible en toda la cadena de ejecución.
 *
 * Este interceptor debe registrarse globalmente para que todas
 * las requests tengan acceso al contexto del usuario.
 *
 * Información capturada:
 * - userId: Del token JWT (si está autenticado)
 * - ipAddress: IP del cliente
 * - userAgent: User agent del navegador
 * - sessionId: ID de sesión (del header o token)
 */
@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const userContext = this.extractUserContext(context);

    // Ejecutamos el handler dentro del contexto de AsyncLocalStorage
    return new Observable((subscriber) => {
      userContextStorage.run(userContext, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }

  /**
   * Extrae el contexto del usuario desde la request.
   * Soporta tanto requests HTTP como GraphQL.
   */
  private extractUserContext(context: ExecutionContext): IUserContext {
    const contextType = context.getType<string>();
    let request: Record<string, unknown> | undefined;

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext<{ req: Record<string, unknown> }>().req;
    } else {
      request = context.switchToHttp().getRequest<Record<string, unknown>>();
    }

    if (!request) {
      return { requestTimestamp: new Date() };
    }

    return {
      userId: this.extractUserId(request),
      ipAddress: this.extractIpAddress(request),
      userAgent: this.extractUserAgent(request),
      sessionId: this.extractSessionId(request),
      requestTimestamp: new Date(),
    };
  }

  /**
   * Extrae el ID del usuario del token JWT (ya procesado por el guard).
   */
  private extractUserId(request: Record<string, unknown>): string | undefined {
    const user = request.user as { id?: string; sub?: string } | undefined;
    return user?.id || user?.sub;
  }

  /**
   * Extrae la dirección IP del cliente.
   * Considera headers de proxies como X-Forwarded-For.
   */
  private extractIpAddress(
    request: Record<string, unknown>,
  ): string | undefined {
    const headers = request.headers as
      | Record<string, string | string[]>
      | undefined;
    const forwardedFor = headers?.['x-forwarded-for'];
    if (forwardedFor) {
      const ips = (
        typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0]
      ).split(',');
      return ips[0]?.trim();
    }

    const realIp = headers?.['x-real-ip'];
    if (realIp) {
      return typeof realIp === 'string' ? realIp : realIp[0];
    }

    return (
      (request.ip as string) ||
      (request.connection as { remoteAddress?: string })?.remoteAddress ||
      (request.socket as { remoteAddress?: string })?.remoteAddress
    );
  }

  /**
   * Extrae el User Agent del navegador/cliente.
   */
  private extractUserAgent(
    request: Record<string, unknown>,
  ): string | undefined {
    const headers = request.headers as
      | Record<string, string | string[]>
      | undefined;
    const ua = headers?.['user-agent'];
    return typeof ua === 'string' ? ua : Array.isArray(ua) ? ua[0] : undefined;
  }

  /**
   * Extrae el ID de sesión.
   * Puede venir de un header personalizado o de una cookie.
   */
  private extractSessionId(
    request: Record<string, unknown>,
  ): string | undefined {
    const headers = request.headers as
      | Record<string, string | string[]>
      | undefined;
    const sessionHeader = headers?.['x-session-id'];
    if (sessionHeader) {
      return typeof sessionHeader === 'string'
        ? sessionHeader
        : sessionHeader[0];
    }

    const cookies = request.cookies as Record<string, string> | undefined;
    const sessionCookie = cookies?.['session_id'];
    if (sessionCookie) {
      return sessionCookie;
    }

    const user = request.user as { jti?: string } | undefined;
    return user?.jti;
  }
}
