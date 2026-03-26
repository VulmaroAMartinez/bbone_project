export function shouldAttemptRefresh(
  operationName: string | undefined,
  hasRefreshed: boolean | undefined,
  graphQLErrorCodes: string[],
): boolean {
  const isUnauthenticated = graphQLErrorCodes.includes('UNAUTHENTICATED');
  const isRefreshOperation = operationName === 'RefreshAuth';
  return isUnauthenticated && !hasRefreshed && !isRefreshOperation;
}
