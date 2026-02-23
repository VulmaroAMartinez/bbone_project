'use client';

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from './ui/skeleton';
import type { AllowedRole } from '@/lib/types';

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireActive && !user.isActive) {
    return <Navigate to={redirectUnauthorizedTo} replace />;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role?.name)
  ) {
    return <Navigate to={redirectUnauthorizedTo} replace />;
  }

  return <Outlet/>;
}
