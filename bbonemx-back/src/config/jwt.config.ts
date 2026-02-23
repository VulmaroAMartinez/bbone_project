import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Opciones adicionales para passport-jwt
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
}));
