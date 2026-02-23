import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor que registra las operaciones GraphQL.
 * Útil para debugging y monitoreo de performance.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const ctx = gqlContext.getContext();
    
    const operationType = info.parentType.name; // Query, Mutation, Subscription
    const fieldName = info.fieldName;
    const userId = ctx.req?.user?.id || 'anonymous';
    
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `${operationType}.${fieldName} - User: ${userId} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${operationType}.${fieldName} - User: ${userId} - ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
