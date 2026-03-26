import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from './auth-cookies.util';

describe('auth-cookies.util', () => {
  const payload = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    csrfToken: 'csrf-token',
    accessTokenMaxAgeMs: 60_000,
    refreshTokenMaxAgeMs: 120_000,
  };

  const buildConfig = (values: Record<string, string | undefined>) =>
    ({
      get: jest.fn((key: string) => values[key]),
    }) as unknown as ConfigService;

  it('setea cookies de auth con banderas seguras en producción por default', () => {
    const config = buildConfig({ 'app.nodeEnv': 'production' });
    const res = {
      cookie: jest.fn(),
    } as any;

    setAuthCookies(res, config, payload);

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      payload.accessToken,
      expect.objectContaining({ httpOnly: true, secure: true, path: '/' }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      payload.refreshToken,
      expect.objectContaining({ httpOnly: true, secure: true, path: '/graphql' }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      CSRF_TOKEN_COOKIE,
      payload.csrfToken,
      expect.objectContaining({ httpOnly: false, secure: true, path: '/' }),
    );
  });

  it('permite sobreescribir secure y domain desde configuración', () => {
    const config = buildConfig({
      'jwt.cookieSecure': 'false',
      'jwt.cookieDomain': '.example.com',
      'app.nodeEnv': 'production',
    });
    const res = {
      cookie: jest.fn(),
    } as any;

    setAuthCookies(res, config, payload);

    const [, , options] = res.cookie.mock.calls[0];
    expect(options.secure).toBe(false);
    expect(options.domain).toBe('.example.com');
  });

  it('limpia cookies con sus paths correctos', () => {
    const config = buildConfig({ 'jwt.cookieSecure': 'true' });
    const res = {
      clearCookie: jest.fn(),
    } as any;

    clearAuthCookies(res, config);

    expect(res.clearCookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      expect.objectContaining({ path: '/' }),
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      expect.objectContaining({ path: '/graphql' }),
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      CSRF_TOKEN_COOKIE,
      expect.objectContaining({ path: '/' }),
    );
  });
});
