import { BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new CsrfGuard(reflector);

  const buildContext = () =>
    ({
      getType: jest.fn().mockReturnValue('graphql'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as import('@nestjs/common').ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
  });

  it('permite mutaciones excluidas sin validar csrf', () => {
    const context = buildContext();
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getInfo: () => ({
        operation: { operation: 'mutation' },
        fieldName: 'login',
      }),
    } as unknown as GqlExecutionContext);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('lanza error cuando csrf cookie/header no coinciden', () => {
    const context = buildContext();
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getInfo: () => ({
        operation: { operation: 'mutation' },
        fieldName: 'createWorkOrder',
      }),
      getContext: () => ({
        req: {
          cookies: { csrf_token: 'cookie-a' },
          headers: { 'x-csrf-token': 'header-b' },
        },
      }),
    } as unknown as GqlExecutionContext);

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });

  it('permite mutaciones con csrf válido', () => {
    const context = buildContext();
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getInfo: () => ({
        operation: { operation: 'mutation' },
        fieldName: 'createWorkOrder',
      }),
      getContext: () => ({
        req: {
          cookies: { csrf_token: 'ok' },
          headers: { 'x-csrf-token': 'ok' },
        },
      }),
    } as unknown as GqlExecutionContext);

    expect(guard.canActivate(context)).toBe(true);
  });
});
