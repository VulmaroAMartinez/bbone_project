import { ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';

describe('AuthResolver', () => {
  const authService = {
    authenticateUser: jest.fn(),
    createSession: jest.fn(),
    login: jest.fn(),
    refreshSession: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'jwt.cookieSecure') return 'false';
      return undefined;
    }),
  } as unknown as ConfigService;

  const resolver = new AuthResolver(
    authService as unknown as import('src/modules/auth/application/services').AuthService,
    configService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login autentica usuario y retorna payload de login', async () => {
    const user = { id: 'u-1' };
    const session = {
      user,
      accessToken: 'a',
      refreshToken: 'r',
      csrfToken: 'c',
      accessTokenMaxAgeMs: 1,
      refreshTokenMaxAgeMs: 2,
    };
    authService.authenticateUser.mockResolvedValue(user);
    authService.createSession.mockResolvedValue(session);
    authService.login.mockReturnValue({ user, accessToken: 'a' });

    const resCookie = { cookie: jest.fn() };

    const result = await resolver.login(
      { employeeNumber: '1001', password: 'secret123' },
      {
        req: { ip: '127.0.0.1', headers: { 'user-agent': 'jest' } },
        res: resCookie,
      } as unknown as import('src/common/types').IGqlContext,
    );

    expect(authService.authenticateUser).toHaveBeenCalledWith(
      '1001',
      'secret123',
      '127.0.0.1',
    );
    expect(result).toEqual({ user, accessToken: 'a' });
  });

  it('refreshAuth regresa false sin refresh token', async () => {
    const result = await resolver.refreshAuth({
      req: { cookies: {} },
    } as unknown as import('src/common/types').IGqlContext);

    expect(result).toBe(false);
    expect(authService.refreshSession).not.toHaveBeenCalled();
  });

  it('logout revoca refresh token y responde true', async () => {
    authService.revokeRefreshToken.mockResolvedValue(undefined);

    const result = await resolver.logout({
      req: { cookies: { refresh_token: 'r1' } },
      res: { clearCookie: jest.fn() },
    } as unknown as import('src/common/types').IGqlContext);

    expect(authService.revokeRefreshToken).toHaveBeenCalledWith('r1');
    expect(result).toBe(true);
  });
});
