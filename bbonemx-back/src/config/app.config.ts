import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  name: process.env.APP_NAME ?? 'CMMS-Backend',
  
  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  },
  
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  },
}));
