import type { AllowedRole } from '@/lib/types';

export function resolveLoginRedirectPath(fromPath?: string): string {
  return fromPath || '/';
}

interface RouteAccessArgs {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasUser: boolean;
  isUserActive: boolean;
  activeRole: string | null;
  isBoss: boolean;
  allowedRoles?: AllowedRole[];
  requireActive?: boolean;
  redirectUnauthorizedTo?: string;
}

export function resolveProtectedRouteAccess({
  isLoading,
  isAuthenticated,
  hasUser,
  isUserActive,
  activeRole,
  isBoss,
  allowedRoles,
  requireActive = true,
  redirectUnauthorizedTo = '/login',
}: RouteAccessArgs): 'loading' | 'allow' | string {
  if (isLoading) return 'loading';

  if (!isAuthenticated || !hasUser) {
    return '/login';
  }

  if (requireActive && !isUserActive) {
    return redirectUnauthorizedTo;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess =
      (activeRole !== null && allowedRoles.includes(activeRole as AllowedRole)) ||
      (isBoss && allowedRoles.includes('BOSS' as AllowedRole));

    if (!hasAccess) {
      return redirectUnauthorizedTo;
    }
  }

  return 'allow';
}
