import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new RolesGuard(reflector);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('permite acceso cuando no hay roles requeridos', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deniega acceso si no hay usuario', () => {
    const context = {
      getType: jest.fn().mockReturnValue('http'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: null }) }),
    } as any;
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('permite acceso en graphql cuando coincide rol', () => {
    const context = {
      getType: jest.fn().mockReturnValue('graphql'),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['BOSS']);
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: () => ({
        req: { user: { roles: [{ name: 'BOSS' }] } },
      }),
    } as any);

    expect(guard.canActivate(context)).toBe(true);
  });
});
