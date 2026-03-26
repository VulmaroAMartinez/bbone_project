import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret:
    process.env.JWT_SECRET ??
    (process.env.NODE_ENV === 'production'
      ? (() => {
          throw new Error('JWT_SECRET es requerido en producción');
        })()
      : 'dev-only-secret'),
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? '7d',
  cookieSecure: process.env.COOKIE_SECURE,
  cookieDomain: process.env.COOKIE_DOMAIN,

  // Opciones adicionales para passport-jwt
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
}));
