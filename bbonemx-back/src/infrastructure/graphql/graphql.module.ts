import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { IGqlContext } from '../../common/types';

/**
 * Módulo de GraphQL.
 * Configura Apollo Server con Code First approach.
 */
@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Code First: genera schema automáticamente desde decoradores
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        
        // Ordenar schema alfabéticamente
        sortSchema: true,
        
        // Playground para desarrollo
        playground: configService.get<boolean>('graphql.playground'),
        
        // Introspection para herramientas como GraphQL Playground
        introspection: configService.get<boolean>('graphql.introspection'),
        
        // Debug mode
        debug: configService.get<boolean>('graphql.debug'),
        
        // Contexto disponible en todos los resolvers
        context: ({ req, res }): IGqlContext => ({ req, res }),
        
        // Configuración de subscriptions (para notificaciones en tiempo real)
        subscriptions: {
          'graphql-ws': {
            onConnect: (context: any) => {
              // Aquí se puede validar el token JWT para subscriptions
              // const { connectionParams } = context;
              // return { user: validateToken(connectionParams.authorization) };
            },
          },
          'subscriptions-transport-ws': true, // Legacy support
        },
        
        // Formateo de errores
        formatError: (error) => {
          // En producción, ocultar detalles internos
          const isProduction = configService.get('app.nodeEnv') === 'production';
          
          if (isProduction) {
            // Eliminar stack trace y detalles sensibles
            return {
              message: error.message,
              extensions: {
                code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
              },
            };
          }
          
          // En desarrollo, mostrar todo
          return error;
        },
        
        // Configuración de caché
        cache: 'bounded',
        
        // Límites de seguridad
        validationRules: [
          // Se pueden agregar reglas de validación personalizadas
          // como limitación de profundidad de queries
        ],
      }),
    }),
  ],
  exports: [GraphQLModule],
})
export class CustomGraphqlModule {}
