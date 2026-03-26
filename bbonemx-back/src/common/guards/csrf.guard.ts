import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLResolveInfo, OperationTypeNode } from 'graphql';
import { METADATA_KEYS } from '../constants';

const EXCLUDED_MUTATIONS = new Set(['login', 'refreshAuth', 'logout']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      METADATA_KEYS.IS_PUBLIC,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    if (context.getType<string>() !== 'graphql') {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo<GraphQLResolveInfo>();

    if (info.operation.operation !== OperationTypeNode.MUTATION) {
      return true;
    }
    if (EXCLUDED_MUTATIONS.has(info.fieldName)) {
      return true;
    }

    const req = gqlContext.getContext<{
      req: {
        cookies?: Record<string, string>;
        headers?: Record<string, string | string[] | undefined>;
      };
    }>().req;
    const csrfCookie = req?.cookies?.csrf_token;
    const csrfHeader = req?.headers?.['x-csrf-token'];

    const headerValue = Array.isArray(csrfHeader) ? csrfHeader[0] : csrfHeader;
    if (!csrfCookie || !headerValue || csrfCookie !== headerValue) {
      throw new BadRequestException('CSRF token inválido');
    }

    return true;
  }
}
