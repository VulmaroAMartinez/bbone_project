import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Users,
  Calendar,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
  Forklift,
  Search,
  LayoutList,
  Building,
  FileCog2,
  Building2,
  Briefcase,
  Bolt,
  Drill,
  Clock,
  User,
  RefreshCw,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLocation, useNavigate } from "react-router-dom";
import logo_color from '@/assets/logo_color.svg';
import logo from '@/assets/logo2.png';
import { getRoleLabel } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  children?: { href: string; label: string, icon: LucideIcon }[];
};

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isTechnician, isRequester, isBoss, canSwitchRoles, activeRole, selectRole, user, logout } = useAuth();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSwitchRole = () => {
    const next = isAdmin ? 'TECHNICIAN' : 'ADMIN';
    selectRole(next);
    navigate('/', { replace: true });
  };

  const getNavItems = (): NavItem[] => {
    if (isAdmin) {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/ordenes', label: 'Órdenes', icon: ClipboardList },
        { href: '/admin/ordenes-programadas', label: 'Programadas', icon: Calendar },
        { href: '/maquinas', label: 'Máquinas', icon: Forklift },
        { href: '/hallazgos', label: 'Hallazgos', icon: Search },
        { href: '/solicitud-material', label: 'Solicitud de material', icon: FileCog2 },
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
            { href: '/repuestos', label: 'Repuestos', icon: Bolt },
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

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border overflow-hidden">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer h-12 w-full"
        >
          <img src={isCollapsed ? logo : logo_color} alt="BB Maintenance" className="h-full object-contain" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
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
                      if (isCollapsed) {
                        onToggleCollapse();
                        setExpandedItems((prev) => ({ ...prev, [item.label]: true }));
                      } else {
                        toggleExpand(item.label);
                      }
                    } else if (item.href) {
                      navigate(item.href);
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors outline-none',
                    isActive && !hasChildren
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                    isActive && hasChildren && 'text-sidebar-primary font-semibold',
                    isCollapsed ? 'justify-center' : 'justify-between')}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(isActive ? 'text-sidebar-primary' : 'text-muted-foreground')}>
                      <item.icon className="h-5 w-5" />
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && hasChildren && (
                    <ChevronDown
                      className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")}
                    />
                  )}
                </button>

                {!isCollapsed && hasChildren && isExpanded && (
                  <ul className="mt-1 space-y-1 pl-9 pr-2">
                    {item.children!.map((child) => {
                      const isChildCurrent = location.pathname === child.href || location.pathname.startsWith(`${child.href}/`);
                      return (
                        <li key={child.href}>
                          <button
                            onClick={() => navigate(child.href)}
                            className={cn(
                              'w-full flex items-center gap-3 py-2 px-3 rounded-md transition-colors text-sm',
                              isChildCurrent
                                ? 'bg-sidebar-accent/50 text-sidebar-primary font-medium'
                                : 'text-muted-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                            )}
                          >
                            <child.icon className="h-4 w-4" />
                            <span className="truncate">{child.label}</span>
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

        {!isCollapsed && (
          <div className="px-3 mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cuenta
            </p>
          </div>
        )}
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate('/perfil')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                location.pathname === '/perfil'
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                isCollapsed ? 'justify-center' : 'justify-start'
              )}
              title={isCollapsed ? 'Perfil' : undefined}
            >
              <User className="h-5 w-5 text-muted-foreground" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Perfil</span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* User info & logout */}
      <div className="border-t border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {getRoleLabel(activeRole ?? undefined)}
              {isBoss && isTechnician && (
                <span className="ml-1 text-primary font-medium"> · Jefe</span>
              )}
            </p>
          </div>
        )}

        {canSwitchRoles && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwitchRole}
            className={cn(
              'w-full text-muted-foreground hover:text-primary mb-1',
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            )}
            title={isCollapsed ? (isAdmin ? 'Cambiar a Técnico' : 'Cambiar a Admin') : undefined}
          >
            <RefreshCw className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
            {!isCollapsed && (isAdmin ? 'Cambiar a Técnico' : 'Cambiar a Admin')}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            'w-full text-muted-foreground hover:text-destructive',
            isCollapsed ? 'justify-center px-0' : 'justify-start'
          )}
          title={isCollapsed ? 'Cerrar Sesión' : undefined}
        >
          <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-2')} />
          {!isCollapsed && 'Cerrar Sesión'}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
