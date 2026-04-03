import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { OfflineFallback } from '@/components/ui/offline-fallback';

function LogoutAndRedirect({ logout }: { logout: () => void }) {
  useEffect(() => {
    logout();
  }, [logout]);
  return <FullPageLoader />;
}

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  TECHNICIAN: '/tecnico/asignaciones',
  REQUESTER: '/solicitante/mis-ordenes',
};

export default function HomePage() {
  const { user, isAuthenticated, isLoading, activeRole, canSwitchRoles, isBoss, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated || !user) {
    if (!navigator.onLine) {
      return <OfflineFallback />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isActive) {
    return <Navigate to="/login" replace />;
  }

  // ADMIN+TECHNICIAN with no active role selected → show role selector
  if (canSwitchRoles && !activeRole) {
    return <Navigate to="/seleccionar-rol" replace />;
  }

  if (!activeRole) {
    if (isBoss) {
      return <Navigate to="/solicitud-material/nueva" replace />;
    }
    // No recognized role — avoid redirect loop with LoginPage by logging out.
    // Redirecting to /login would cause: LoginPage → / → LoginPage → loop.
    return <LogoutAndRedirect logout={logout} />;
  }

  const redirectTo =
    activeRole === 'TECHNICIAN' && isBoss
      ? '/tecnico/mis-ordenes'
      : HOME_BY_ROLE[activeRole] ?? '/login';
  return <Navigate to={redirectTo} replace />;
}
