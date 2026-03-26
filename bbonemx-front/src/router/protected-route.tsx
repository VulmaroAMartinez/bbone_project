'use client';

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import type { AllowedRole } from '@/lib/types';
import { resolveProtectedRouteAccess } from '@/lib/auth/auth-flow';

interface ProtectedRouteProps {
  allowedRoles?: AllowedRole[];
  requireActive?: boolean;
  redirectUnauthorizedTo?: string;
}

export const ProtectedRoute = ({
  allowedRoles,
  requireActive = true,
  redirectUnauthorizedTo = '/login',
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, activeRole, isBoss } = useAuth();
  const location = useLocation();

  const accessResult = resolveProtectedRouteAccess({
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    isUserActive: !!user?.isActive,
    activeRole,
    isBoss,
    allowedRoles,
    requireActive,
    redirectUnauthorizedTo,
  });

  if (accessResult === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (accessResult === '/login') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (accessResult !== 'allow') {
    return <Navigate to={accessResult} replace />;
  }

  return <Outlet />;
};
