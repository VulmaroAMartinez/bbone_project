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

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo<import('graphql').GraphQLResolveInfo>();
    const ctx = gqlContext.getContext<{ req?: { user?: { id?: string } } }>();

    const operationType = info.parentType?.name || 'Unknown'; // Query, Mutation, Subscription
    const fieldName = info.fieldName || 'Unknown';
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
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${operationType}.${fieldName} - User: ${userId} - ${duration}ms - Error: ${(error as Error).message}`,
          );
        },
      }),
    );
  }
}
