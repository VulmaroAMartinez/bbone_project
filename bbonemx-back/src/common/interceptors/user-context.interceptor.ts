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
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
    let request: any;

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
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
  private extractUserId(request: any): string | undefined {
    return request.user?.id || request.user?.sub;
  }

  /**
   * Extrae la dirección IP del cliente.
   * Considera headers de proxies como X-Forwarded-For.
   */
  private extractIpAddress(request: any): string | undefined {
    const forwardedFor = request.headers?.['x-forwarded-for'];
    if (forwardedFor) {
      const ips = forwardedFor.split(',');
      return ips[0]?.trim();
    }

    const realIp = request.headers?.['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    return (
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress
    );
  }

  /**
   * Extrae el User Agent del navegador/cliente.
   */
  private extractUserAgent(request: any): string | undefined {
    return request.headers?.['user-agent'];
  }

  /**
   * Extrae el ID de sesión.
   * Puede venir de un header personalizado o de una cookie.
   */
  private extractSessionId(request: any): string | undefined {
    const sessionHeader = request.headers?.['x-session-id'];
    if (sessionHeader) {
      return sessionHeader;
    }

    const sessionCookie = request.cookies?.['session_id'];
    if (sessionCookie) {
      return sessionCookie;
    }

    return request.user?.jti;
  }
}
