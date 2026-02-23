import { registerAs } from '@nestjs/config';

export default registerAs('graphql', () => ({
  playground: process.env.GRAPHQL_PLAYGROUND === 'true',
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
  debug: process.env.GRAPHQL_DEBUG === 'true',
  
  // Path donde se genera el schema automáticamente
  autoSchemaFile: 'schema.gql',
  
  // Ordenar el schema alfabéticamente
  sortSchema: true,
  
  // Subscriptions config (para notificaciones en tiempo real)
  subscriptions: {
    'graphql-ws': true,
    'subscriptions-transport-ws': true,
  },
}));
