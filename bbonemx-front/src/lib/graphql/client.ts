import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
  type FetchResult,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
} from '@apollo/client/errors';

import { logDevWarning, reportError } from '../logging';

const GRAPHLQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL;

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
    const isUnauthenticated = error.errors.some(
      (entry) => entry.extensions?.code === 'UNAUTHENTICATED',
    );
    const hasRefreshed = operation.getContext().hasRefreshed;
    const isRefreshOperation = operation.operationName === 'RefreshAuth';
    const isLoginOperation = operation.operationName === 'Login';

    if (isUnauthenticated && !hasRefreshed && !isRefreshOperation) {
      operation.setContext({ hasRefreshed: true });

      refreshPromise ??= executeRefresh().finally(() => {
        refreshPromise = null;
      });

      return new Observable<FetchResult>((observer) => {
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

    logDevWarning('GraphQL', 'La operación GraphQL devolvió errores.', {
      operationName: operation.operationName || 'anonymous',
      errorCount: error.errors.length,
      codes: error.errors.map((entry) => entry.extensions?.code ?? 'UNKNOWN'),
    });
    return;
  }

  if (CombinedProtocolErrors.is(error)) {
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

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, csrfLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});