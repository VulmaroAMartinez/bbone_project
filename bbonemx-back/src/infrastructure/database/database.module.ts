import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BaseEntitySubscriber } from './subscribers/base-entity.subscriber';

/**
 * Módulo de base de datos.
 * Configura TypeORM con PostgreSQL usando las variables de entorno.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        
        // Carga automática de entidades (no recomendado para producción)
        autoLoadEntities: true,
        
        // Sincronización automática (SOLO para desarrollo)
        synchronize: configService.get<boolean>('database.synchronize'),
        
        // Logging de queries
        logging: configService.get<boolean>('database.logging'),
        
        // Configuración de migraciones
        migrations: ['dist/infrastructure/database/migrations/*.js'],
        migrationsTableName: 'migrations',
        
        // Configuración adicional de PostgreSQL
        extra: {
          // Pool de conexiones
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),
  ],
  // Proveer el subscriber para que sea inyectado con el DataSource
  providers: [BaseEntitySubscriber],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
