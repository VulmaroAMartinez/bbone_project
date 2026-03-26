import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { verify } from 'jsonwebtoken';
import { IGqlContext } from '../../common/types';
import type { Context } from 'graphql-ws';
import {
  FragmentDefinitionNode,
  GraphQLError,
  OperationDefinitionNode,
  SelectionNode,
  ValidationRule,
  Kind,
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
    if (selection.kind === Kind.FIELD) {
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

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
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

    if (selection.kind === Kind.INLINE_FRAGMENT) {
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
    if (selection.kind === Kind.FIELD) {
      count += 1;
      if (selection.selectionSet) {
        count += countFields(selection.selectionSet.selections, fragments);
      }
      continue;
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragment = fragments[selection.name.value];
      if (fragment) {
        count += countFields(fragment.selectionSet.selections, fragments);
      }
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
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
        definition.kind === Kind.FRAGMENT_DEFINITION,
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
        // Evitar escribir dentro de `src/` en runtime (p.ej. Docker).
        // `graphql.autoSchemaFile` viene de config y por defecto es `schema.gql`.
        autoSchemaFile: join(
          process.cwd(),
          configService.get<string>('graphql.autoSchemaFile') ?? 'schema.gql',
        ),
        sortSchema: true,
        playground: configService.get<boolean>('graphql.playground'),
        introspection: configService.get<boolean>('graphql.introspection'),
        debug: configService.get<boolean>('graphql.debug'),
        context: ({ req, res }: { req: unknown; res: unknown }): IGqlContext =>
          ({ req, res }) as unknown as IGqlContext,

        subscriptions: {
          'graphql-ws': {
            onConnect: (context: Context) => {
              const secret = configService.getOrThrow<string>('jwt.secret');

              const connParams = context.connectionParams as
                | { authorization?: string }
                | undefined;
              const paramToken =
                typeof connParams?.authorization === 'string'
                  ? connParams.authorization.replace(/^Bearer\s+/i, '')
                  : null;

              const extra = context.extra as
                | { request?: { headers?: Record<string, string> } }
                | undefined;
              const cookieHeader = extra?.request?.headers?.cookie ?? '';
              const cookieToken = cookieHeader
                .split('; ')
                .find((c: string) => c.startsWith('access_token='))
                ?.split('=')[1];

              const token = paramToken ?? cookieToken;
              if (!token) {
                throw new Error('Token de acceso no proporcionado');
              }

              try {
                verify(token, secret);
              } catch {
                throw new Error('Token de acceso inválido');
              }
            },
          },
          'subscriptions-transport-ws': true,
        },

        formatError: (error) => {
          const isProduction =
            configService.get('app.nodeEnv') === 'production';

          if (isProduction) {
            return {
              message: error.message,
              extensions: {
                code: error.extensions?.code ?? 'INTERNAL_SERVER_ERROR',
              },
            };
          }

          return error;
        },

        cache: 'bounded',

        validationRules: [queryLimitsRule],
      }),
    }),
  ],
  exports: [GraphQLModule],
})
export class CustomGraphqlModule {}
