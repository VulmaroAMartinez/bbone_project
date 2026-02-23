import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Crear aplicación NestJS
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Obtener configuración
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const isDevelopment = configService.get<string>('app.nodeEnv') === 'development';
  const corsOrigins = configService.get<string[]>('app.cors.origin');

  // Prefijo global para API REST (health checks, etc.)
  app.setGlobalPrefix('api', {
    exclude: ['graphql'], // GraphQL no usa el prefijo
  });

  // Seguridad con Helmet (ajustado para GraphQL Playground)
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: isDevelopment
        ? false // Deshabilitar CSP en desarrollo para Playground
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

  // Compresión de respuestas
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      // Transformar payloads a instancias de DTO
      transform: true,
      // Permitir transformación implícita de tipos
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Remover propiedades no definidas en el DTO
      whitelist: true,
      // Lanzar error si hay propiedades no definidas
      forbidNonWhitelisted: true,
      // Deshabilitar mensajes de error detallados en producción
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
