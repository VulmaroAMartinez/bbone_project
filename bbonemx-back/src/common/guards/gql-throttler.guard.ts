import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  override getRequestResponse(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{
        req: Record<string, any>;
        res: Record<string, any>;
      }>();
      return { req: ctx.req, res: ctx.res };
    }
    return super.getRequestResponse(context);
  }

  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo<import('graphql').GraphQLResolveInfo>();
      // Skip throttling for subscriptions (no HTTP request available)
      if (
        info?.operation?.operation ===
        ('subscription' as import('graphql').OperationTypeNode)
      ) {
        return Promise.resolve(true);
      }
      // Skip if req is somehow missing (e.g. WebSocket context)
      const ctx = gqlCtx.getContext<{ req: unknown; res: unknown }>();
      if (!ctx.req) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
}
