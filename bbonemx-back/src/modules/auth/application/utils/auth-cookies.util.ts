import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const CSRF_TOKEN_COOKIE = 'csrf_token';

export interface AuthCookiePayload {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  accessTokenMaxAgeMs: number;
  refreshTokenMaxAgeMs: number;
}

function resolveSecure(configService: ConfigService): boolean {
  const explicit = configService.get<string>('jwt.cookieSecure');
  if (typeof explicit === 'string') {
    return explicit === 'true';
  }
  return configService.get<string>('app.nodeEnv') === 'production';
}

function resolveDomain(configService: ConfigService): string | undefined {
  return configService.get<string>('jwt.cookieDomain') || undefined;
}

export function setAuthCookies(
  res: Response,
  configService: ConfigService,
  payload: AuthCookiePayload,
): void {
  const secure = resolveSecure(configService);
  const domain = resolveDomain(configService);

  const commonHttpOnly: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    domain,
  };

  res.cookie(ACCESS_TOKEN_COOKIE, payload.accessToken, {
    ...commonHttpOnly,
    path: '/',
    maxAge: payload.accessTokenMaxAgeMs,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, payload.refreshToken, {
    ...commonHttpOnly,
    path: '/graphql',
    maxAge: payload.refreshTokenMaxAgeMs,
  });

  // CSRF cookie legible por frontend para doble-submit.
  res.cookie(CSRF_TOKEN_COOKIE, payload.csrfToken, {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    domain,
    path: '/',
    maxAge: payload.refreshTokenMaxAgeMs,
  });
}

export function clearAuthCookies(
  res: Response,
  configService: ConfigService,
): void {
  const secure = resolveSecure(configService);
  const domain = resolveDomain(configService);

  const clearOptions: CookieOptions = {
    secure,
    sameSite: 'lax',
    domain,
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...clearOptions, path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...clearOptions, path: '/graphql' });
  res.clearCookie(CSRF_TOKEN_COOKIE, { ...clearOptions, path: '/' });
}
