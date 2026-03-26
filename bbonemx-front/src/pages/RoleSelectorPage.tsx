import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Wrench, LogOut } from 'lucide-react';
import logo from '@/assets/logo_color.svg';

export default function RoleSelectorPage() {
  const { user, selectRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: string) => {
    selectRole(role);
    const HOME: Record<string, string> = {
      ADMIN: '/admin/dashboard',
      TECHNICIAN: '/tecnico/asignaciones',
    };
    navigate(HOME[role] ?? '/', { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-background p-6">
      <div className="flex flex-col items-center gap-3">
        <img src={logo} alt="BB Maintenance" className="h-12 object-contain" />
        <h1 className="text-2xl font-bold text-foreground">¿Cómo deseas ingresar?</h1>
        {user && (
          <p className="text-sm text-muted-foreground">Bienvenido, {user.fullName}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <button
          onClick={() => handleSelect('ADMIN')}
          className="group focus:outline-none"
        >
          <Card className="h-full border-2 border-transparent hover:border-primary transition-all cursor-pointer group-focus-visible:border-primary">
            <CardContent className="flex flex-col items-center gap-4 py-8 px-6">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <LayoutDashboard className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Administrador</p>
                <p className="text-sm text-muted-foreground mt-1">Panel de control, órdenes y catálogos</p>
              </div>
            </CardContent>
          </Card>
        </button>

        <button
          onClick={() => handleSelect('TECHNICIAN')}
          className="group focus:outline-none"
        >
          <Card className="h-full border-2 border-transparent hover:border-primary transition-all cursor-pointer group-focus-visible:border-primary">
            <CardContent className="flex flex-col items-center gap-4 py-8 px-6">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Wrench className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">Técnico</p>
                <p className="text-sm text-muted-foreground mt-1">Mis asignaciones y órdenes de trabajo</p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive">
        <LogOut className="h-4 w-4" />
        Cerrar Sesión
      </Button>
    </div>
  );
}
