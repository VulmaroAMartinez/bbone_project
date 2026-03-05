import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { UserRole } from '@/lib/types';

const HOME_BY_ROLE: Record<string, string> = {
  [UserRole.ADMIN]: '/admin/dashboard',
  [UserRole.TECHNICIAN]: '/tecnico/asignaciones',
  [UserRole.REQUESTER]: '/solicitante/mis-ordenes',
};

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isActive) {
    return <Navigate to="/403" replace />;
  }

  const roleName = user.role?.name;
  const redirectTo = roleName ? HOME_BY_ROLE[roleName] : undefined;

  return <Navigate to={redirectTo ?? '/403'} replace />;
}