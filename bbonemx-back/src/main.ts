import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const isDevelopment =
    configService.get<string>('app.nodeEnv') === 'development';
  const corsOrigins = configService.get<string[]>('app.cors.origin');

  app.setGlobalPrefix('api', {
    exclude: ['graphql'], 
  });

  // Seguridad con Helmet (ajustado para GraphQL Playground)
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: isDevelopment
        ? false 
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https:'],
              scriptSrc: ["'self'"],
            },
          },
    }),
  );

  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-CSRF-Token',
      'x-csrf-token',
    ],
  });

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: !isDevelopment,
    }),
  );

  // Iniciar servidor
  await app.listen(port || 3000);

  // Logs de inicio
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`Environment: ${configService.get<string>('app.nodeEnv')}`);
}

bootstrap();
