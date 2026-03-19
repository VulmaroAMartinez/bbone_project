import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { IGqlContext } from '../../common/types';
import {
  FieldNode,
  FragmentDefinitionNode,
  GraphQLError,
  OperationDefinitionNode,
  SelectionNode,
  ValidationRule,
} from 'graphql';

const MAX_QUERY_DEPTH = 12;
const MAX_QUERY_FIELDS = 200;

function calculateDepth(
  selectionSet: readonly SelectionNode[],
  fragments: Record<string, FragmentDefinitionNode>,
  currentDepth = 1,
): number {
  let maxDepth = currentDepth;

  for (const selection of selectionSet) {
    if (selection.kind === 'Field') {
      const field = selection;
      if (!field.selectionSet) continue;
      maxDepth = Math.max(
        maxDepth,
        calculateDepth(
          field.selectionSet.selections,
          fragments,
          currentDepth + 1,
        ),
      );
      continue;
    }

    if (selection.kind === 'FragmentSpread') {
      const fragment = fragments[selection.name.value];
      if (!fragment) continue;
      maxDepth = Math.max(
        maxDepth,
        calculateDepth(
          fragment.selectionSet.selections,
          fragments,
          currentDepth + 1,
        ),
      );
      continue;
    }

    if (selection.kind === 'InlineFragment') {
      maxDepth = Math.max(
        maxDepth,
        calculateDepth(
          selection.selectionSet.selections,
          fragments,
          currentDepth + 1,
        ),
      );
    }
  }

  return maxDepth;
}

function countFields(
  selectionSet: readonly SelectionNode[],
  fragments: Record<string, FragmentDefinitionNode>,
): number {
  let count = 0;

  for (const selection of selectionSet) {
    if (selection.kind === 'Field') {
      count += 1;
      if (selection.selectionSet) {
        count += countFields(selection.selectionSet.selections, fragments);
      }
      continue;
    }

    if (selection.kind === 'FragmentSpread') {
      const fragment = fragments[selection.name.value];
      if (fragment) {
        count += countFields(fragment.selectionSet.selections, fragments);
      }
      continue;
    }

    if (selection.kind === 'InlineFragment') {
      count += countFields(selection.selectionSet.selections, fragments);
    }
  }

  return count;
}

const queryLimitsRule: ValidationRule = (context) => {
  const fragments = context
    .getDocument()
    .definitions.filter(
      (definition): definition is FragmentDefinitionNode =>
        definition.kind === 'FragmentDefinition',
    )
    .reduce<Record<string, FragmentDefinitionNode>>((acc, fragment) => {
      acc[fragment.name.value] = fragment;
      return acc;
    }, {});

  return {
    OperationDefinition(node: OperationDefinitionNode) {
      const depth = calculateDepth(node.selectionSet.selections, fragments);
      if (depth > MAX_QUERY_DEPTH) {
        context.reportError(
          new GraphQLError(
            `La profundidad máxima permitida es ${MAX_QUERY_DEPTH}. Profundidad recibida: ${depth}.`,
            [node],
          ),
        );
      }

      const fieldCount = countFields(node.selectionSet.selections, fragments);
      if (fieldCount > MAX_QUERY_FIELDS) {
        context.reportError(
          new GraphQLError(
            `La complejidad máxima permitida es ${MAX_QUERY_FIELDS} campos. Solicitud recibida: ${fieldCount}.`,
            [node],
          ),
        );
      }
    },
  };
};

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
          const isProduction =
            configService.get('app.nodeEnv') === 'production';

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
        validationRules: [queryLimitsRule],
      }),
    }),
  ],
  exports: [GraphQLModule],
})
export class CustomGraphqlModule {}
