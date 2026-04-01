import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { OfflineFallback } from '@/components/ui/offline-fallback';

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  TECHNICIAN: '/tecnico/asignaciones',
  REQUESTER: '/solicitante/mis-ordenes',
};

export default function HomePage() {
  const { user, isAuthenticated, isLoading, activeRole, canSwitchRoles, isBoss } = useAuth();
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
    return <Navigate to="/login" replace />;
  }

  const redirectTo =
    activeRole === 'TECHNICIAN' && isBoss
      ? '/tecnico/mis-ordenes'
      : HOME_BY_ROLE[activeRole] ?? '/login';
  return <Navigate to={redirectTo} replace />;
}
