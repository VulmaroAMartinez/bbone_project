import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn, getRoleLabel } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Users,
  Calendar,
  FileText,
  User,
  LogOut,
  ChevronDown,
  type LucideIcon,
  Forklift,
  Search,
  LayoutList,
  Building,
  FileCog2,
  Drill,
  Briefcase,
  Building2,
  Bolt,
  Clock,
  RefreshCw,
  Timer,
  ClipboardCheck,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from "react-router-dom";
import logo from '@/assets/logo_color.svg';

interface MobileNavProps {
  onClose: () => void;
}

type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  children?: { href: string; label: string, icon: LucideIcon }[];
};

export function MobileNav({ onClose }: MobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isTechnician, isRequester, isBoss, canSwitchRoles, activeRole, selectRole } = useAuth();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSwitchRole = () => {
    const next = isAdmin ? 'TECHNICIAN' : 'ADMIN';
    selectRole(next);
    onClose();
    navigate('/', { replace: true });
  };

  const getNavItems = (): NavItem[] => {
    if (isAdmin) {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/ordenes', label: 'Órdenes', icon: ClipboardList },
        { href: '/admin/ordenes-programadas', label: 'Programadas', icon: Calendar },
        { href: '/admin/actividades', label: 'Actividades', icon: ListChecks },
        { href: '/maquinas', label: 'Máquinas', icon: Forklift },
        { href: '/hallazgos', label: 'Hallazgos', icon: Search },
        { href: '/admin/solicitud-material', label: 'Solicitud de material', icon: FileCog2 },
        { href: '/seguimiento-solicitudes', label: 'Seguimiento SM', icon: ClipboardCheck },
        {
          label: 'Gestión de Técnicos',
          icon: Users,
          children: [
            { href: '/tecnicos', label: 'Técnicos', icon: Users },
            { href: '/horarios', label: 'Horarios / Turnos', icon: Calendar },
            { href: '/horas-extra', label: 'Horas Extra', icon: Timer },
          ]
        },
        {
          label: 'Catálogo',
          icon: LayoutList,
          children: [
            { href: '/areas', label: 'Áreas', icon: Building2 },
            { href: '/departamentos', label: 'Departamentos', icon: Building },
            { href: '/puestos', label: 'Puestos', icon: Briefcase },
            { href: '/solicitantes', label: 'Solicitantes', icon: Users },
            { href: '/repuestos', label: 'Refacciones', icon: Bolt },
            { href: '/materiales', label: 'Materiales', icon: Drill },
            { href: '/turnos', label: 'Turnos', icon: Clock }
          ]
        }
      ];
    }
    if (isTechnician) {
      const items: NavItem[] = [
        { href: '/tecnico/pendientes', label: 'Mis Pendientes', icon: ClipboardList },
        ...(isBoss ? [{ href: '/tecnico/mis-ordenes', label: 'Mis Órdenes', icon: ClipboardList } as NavItem] : []),
        { href: '/horario', label: 'Mi Horario', icon: Calendar },
        { href: '/tecnico/asignaciones', label: 'Historial', icon: FileText },
        { href: '/tecnico/horas-extra', label: 'Horas Extra', icon: Timer },
      ];
      if (isBoss || isAdmin) {
        items.push(
          ...(isBoss ? [] : [{ href: '/solicitante/crear-ot', label: 'Crear Solicitud', icon: PlusCircle } as NavItem]),
          { href: '/solicitud-material/nueva', label: 'Solicitud de Material', icon: FileCog2 },
        );
      }
      return items;
    }
    if (isRequester) {
      return [
        { href: '/solicitante/mis-ordenes', label: 'Mis Órdenes', icon: ClipboardList },
        { href: '/solicitante/crear-ot', label: 'Crear Solicitud', icon: PlusCircle },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  const handleNavigation = (href: string) => {
    onClose();
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <button
          onClick={() => handleNavigation('/')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className='mr-4'>
            <img src={logo} alt="BB Maintenance" className="h-full w-full" />
          </div>
        </button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="py-4 px-2">
          <div className="px-3 mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Menú Principal
            </p>
          </div>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const hasChildren = !!item.children?.length;
              const isExpanded = expandedItems[item.label];

              const isChildActive = item.children?.some(child => location.pathname === child.href || location.pathname.startsWith(`${child.href}/`));
              const isActive = (item.href && (location.pathname === item.href || location.pathname.startsWith(`${item.href}/`))) || isChildActive;

              return (
                <li key={item.label} className="space-y-1">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpand(item.label);
                      } else if (item.href) {
                        handleNavigation(item.href);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors',
                      isActive && !hasChildren
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                      isActive && hasChildren && 'text-sidebar-primary font-semibold'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(isActive ? 'text-sidebar-primary' : 'text-muted-foreground')}>
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {hasChildren && (
                      <ChevronDown
                        className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")}
                      />
                    )}
                  </button>

                  {hasChildren && isExpanded && (
                    <ul className="mt-1 space-y-1 pl-10 pr-2">
                      {item.children!.map((child) => {
                        const isChildCurrent = location.pathname === child.href || location.pathname.startsWith(`${child.href}/`);
                        return (
                          <li key={child.href}>
                            <button
                              onClick={() => handleNavigation(child.href)}
                              className={cn(
                                'w-full flex items-center py-2 px-3 rounded-md transition-colors text-sm',
                                isChildCurrent
                                  ? 'bg-sidebar-accent/50 text-sidebar-primary font-medium'
                                  : 'text-muted-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                              )}
                            >
                              {child.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <Separator className="my-4" />

          <div className="px-3 mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cuenta
            </p>
          </div>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleNavigation('/perfil')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  location.pathname === '/perfil'
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Perfil</span>
              </button>
            </li>
          </ul>
        </nav>
      </ScrollArea>

      {/* User info & logout */}
      <div className="border-t border-sidebar-border p-4 shrink-0">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {getRoleLabel(activeRole ?? undefined)}
            {isBoss && isTechnician && (
              <span className="ml-1 text-primary font-medium">· Jefe</span>
            )}
          </p>
        </div>

        {canSwitchRoles && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitchRole}
            className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10 mb-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isAdmin ? 'Cambiar a Técnico' : 'Cambiar a Admin'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
