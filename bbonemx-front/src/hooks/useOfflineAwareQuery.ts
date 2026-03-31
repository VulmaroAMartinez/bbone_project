import { useQuery } from '@apollo/client/react';
import type { TypedDocumentNode, OperationVariables } from '@apollo/client';
import { useSyncExternalStore } from 'react';

type OnlineFetchPolicy =
  | 'cache-first'
  | 'network-only'
  | 'cache-only'
  | 'cache-and-network'
  | 'no-cache'
  | 'standby';

type OfflineAwareOptions<TData, TVariables extends OperationVariables> = Omit<
  useQuery.Options<TData, TVariables>,
  'fetchPolicy'
> & {
  /** Fetch policy to use when online. Defaults to 'cache-and-network'. */
  onlinePolicy?: OnlineFetchPolicy;
};

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

const getOnlineSnapshot = (): boolean => navigator.onLine;
const getServerSnapshot = (): boolean => true;

/**
 * Wrapper around Apollo's useQuery that automatically switches to 'cache-only'
 * when the device is offline, preventing "Failed to fetch" errors while still
 * rendering cached data.
 *
 * Returns the same result as useQuery plus an `isOffline` boolean flag.
 */
export function useOfflineAwareQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(
  // TypedDocumentNode<TData, any> decouples the document's variable type from
  // TVariables to avoid a contravariance failure: codegen emits
  // Exact<{[key:string]:never}> for no-variable queries, which is incompatible
  // with the OperationVariables default when TData is explicitly specified.
  query: TypedDocumentNode<TData, any>,
  options?: OfflineAwareOptions<TData, TVariables>,
): useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming'> & { isOffline: boolean } {
  const isOnline = useSyncExternalStore(subscribe, getOnlineSnapshot, getServerSnapshot);
  const { onlinePolicy = 'cache-and-network', ...rest } = options ?? {};

  // Cast is required to satisfy Apollo's conditional-type constraint
  // on options when TVariables has required fields.
  const result = useQuery<TData, TVariables>(
    query as TypedDocumentNode<TData, TVariables>,
    {
      ...rest,
      fetchPolicy: isOnline ? onlinePolicy : 'cache-only',
    } as useQuery.Options<TData, TVariables>,
  );

  return { ...result, isOffline: !isOnline };
}
