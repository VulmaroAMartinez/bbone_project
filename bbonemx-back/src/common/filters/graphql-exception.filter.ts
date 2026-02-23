import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

/**
 * Filtro de excepciones personalizado para GraphQL.
 * Formatea los errores de manera consistente y oculta detalles en producción.
 */
@Catch()
export class GraphqlExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphqlExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();
    
    // Log del error para debugging
    this.logger.error(
      `GraphQL Error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Determinar el código y mensaje del error
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let statusCode = 500;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || message;
        code = (response as any).error || this.getCodeFromStatus(statusCode);
      }
    } else if (exception instanceof GraphQLError) {
      message = exception.message;
      code = (exception.extensions?.code as string) || 'GRAPHQL_ERROR';
    } else if (exception instanceof Error) {
      message = this.isProduction() 
        ? 'Internal server error' 
        : exception.message;
    }

    // Retornar error formateado para GraphQL
    return new GraphQLError(message, {
      extensions: {
        code,
        statusCode,
        timestamp: new Date().toISOString(),
        ...(this.isProduction() ? {} : { 
          originalError: exception instanceof Error ? exception.message : undefined 
        }),
      },
    });
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private getCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codes[status] || 'INTERNAL_SERVER_ERROR';
  }
}
