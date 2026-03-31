import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import localforage from 'localforage';
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
} from '@apollo/client/errors';

import { logDevWarning, reportError } from '../logging';
import { shouldAttemptRefresh } from './error-handling';

const GRAPHLQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL;
const SHOW_RAW_GRAPHQL_ERRORS = import.meta.env.DEV;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

const csrfLink = new ApolloLink((operation, forward) => {
  const csrfToken = readCookie('csrf_token');
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    },
  }));

  return forward(operation);
});


let refreshPromise: Promise<boolean> | null = null;

async function executeRefresh(): Promise<boolean> {
  const csrfToken = readCookie('csrf_token');
  const response = await fetch(GRAPHLQL_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    },
    body: JSON.stringify({
      query: 'mutation RefreshAuth { refreshAuth }',
    }),
  });

  if (!response.ok) {
    return false;
  }

  const body = (await response.json()) as {
    data?: { refreshAuth?: boolean };
  };
  return body?.data?.refreshAuth === true;
}

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    const codes = error.errors.map((entry) => String(entry.extensions?.code ?? 'UNKNOWN'));
    const hasRefreshed = operation.getContext().hasRefreshed as boolean | undefined;
    const isLoginOperation = operation.operationName === 'Login';

    if (shouldAttemptRefresh(operation.operationName, hasRefreshed, codes)) {
      operation.setContext({ hasRefreshed: true });

      refreshPromise ??= executeRefresh().finally(() => {
        refreshPromise = null;
      });

      return new Observable<ApolloLink.Result>((observer) => {
        refreshPromise
          ?.then((didRefresh) => {
            if (!didRefresh || isLoginOperation) {
              observer.error(error);
              return;
            }
            forward(operation).subscribe(observer);
          })
          .catch((refreshError) => observer.error(refreshError));
      });
    }

    if (SHOW_RAW_GRAPHQL_ERRORS) {
      console.error('[GraphQL][RAW_ERRORS]', {
        operationName: operation.operationName || 'anonymous',
        errors: error.errors,
      });
    }

    logDevWarning('GraphQL', 'La operación GraphQL devolvió errores.', {
      operationName: operation.operationName || 'anonymous',
      errorCount: error.errors.length,
      codes: error.errors.map((entry) => entry.extensions?.code ?? 'UNKNOWN'),
    });
    return;
  }

  if (CombinedProtocolErrors.is(error)) {
    if (SHOW_RAW_GRAPHQL_ERRORS) {
      console.error('[GraphQL][RAW_PROTOCOL_ERRORS]', {
        operationName: operation.operationName || 'anonymous',
        errors: error.errors,
      });
    }

    logDevWarning('GraphQL', 'Se detectó un error de protocolo en Apollo Client.', {
      operationName: operation.operationName || 'anonymous',
      errorCount: error.errors.length,
    });
    return;
  }

  reportError('GraphQL', 'Apollo Client recibió un error inesperado.', error, {
    operationName: operation.operationName || 'anonymous',
  });
});

const httpLink = new HttpLink({
  uri: GRAPHLQL_ENDPOINT,
  credentials: 'include',
});

const retryLink = new RetryLink({
  delay: { initial: 300, max: 5000, jitter: true },
  attempts: {
    max: 3,
    retryIf: (error, operation) => {
      const isMutation = operation.query.definitions.some(
        (def) => def.kind === 'OperationDefinition' && def.operation === 'mutation',
      );
      return !isMutation && !!error;
    },
  },
});

export const cache = new InMemoryCache();

const CACHE_PERSIST_KEY = 'apollo-cache-persist';
const CACHE_MAX_BYTES = 10_485_760; // 10 MB

export async function initApolloCache(): Promise<void> {
  try {
    const raw = await localforage.getItem<string>(CACHE_PERSIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ReturnType<typeof cache.extract>;
      cache.restore(parsed);
    }
  } catch (err) {
    logDevWarning('Cache', 'Error al restaurar el cache persistido. Se continuará con cache vacío.', { err });
    await localforage.removeItem(CACHE_PERSIST_KEY).catch(() => undefined);
  }

  setInterval(() => {
    const serialized = JSON.stringify(cache.extract());
    if (serialized.length <= CACHE_MAX_BYTES) {
      localforage.setItem(CACHE_PERSIST_KEY, serialized).catch(() => undefined);
    } else {
      localforage.removeItem(CACHE_PERSIST_KEY).catch(() => undefined);
    }
  }, 30_000);
}

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, csrfLink, retryLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});