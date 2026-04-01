import type { AllowedRole } from '@/lib/types';

export function resolveLoginRedirectPath(fromPath?: string): string {
  if (!fromPath || fromPath === '/login') {
    return '/';
  }
  return fromPath;
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
      // Redirect authenticated users with wrong role to / (not /login).
      // Redirecting to /login would cause an infinite loop: LoginPage navigates
      // back to `from`, ProtectedRoute rejects again, and the cycle repeats.
      // Sending to / lets HomePage dispatch the user to their correct section.
      return '/';
    }
  }

  return 'allow';
}
