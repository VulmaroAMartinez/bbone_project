import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
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
  const { user, logout, isAdmin, isTechnician, isRequester } = useAuth();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getNavItems = (): NavItem[] => {
    if (isAdmin) {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/ordenes', label: 'Órdenes', icon: ClipboardList },
        { href: '/admin/maquinas', label: 'Máquinas', icon: Forklift },
        { href: '/admin/hallazgos', label: 'Hallazgos', icon: Search },
        { href: '/admin/solicitud-material', label: 'Solicitud de material', icon: FileCog2 },
        {
          label: 'Gestión de Personal',
          icon: Users,
          children: [
            { href: '/admin/tecnicos', label: 'Lista de Técnicos', icon: Users },
            { href: '/admin/horarios', label: 'Horarios / Turnos', icon: Calendar },
          ]
        },
        {
          label: 'Catálogo',
          icon: LayoutList,
          children: [
            { href: '/admin/areas', label: 'Áreas', icon: Building },
          ]
        }
      ];
    }
    if (isTechnician) {
      return [
        { href: '/tecnico/pendientes', label: 'Mis Pendientes', icon: ClipboardList },
        { href: '/tecnico/horario', label: 'Mi Horario', icon: Calendar },
        { href: '/tecnico/asignaciones', label: 'Historial', icon: FileText },
      ];
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

              // Verificamos si la ruta actual es el item padre, o uno de sus hijos
              const isChildActive = item.children?.some(child => location.pathname === child.href || location.pathname.startsWith(`${child.href}/`));
              const isActive = (item.href && (location.pathname === item.href || location.pathname.startsWith(`${item.href}/`))) || isChildActive;

              return (
                <li key={item.label} className="space-y-1">
                  {/* Botón Principal (Padre) */}
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
                    {/* Flecha indicadora si tiene hijos */}
                    {hasChildren && (
                      <ChevronDown
                        className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")}
                      />
                    )}
                  </button>

                  {/* Sub-menú Desplegable */}
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
          <p className="text-xs text-muted-foreground capitalize">{getRoleLabel(user?.role?.name)}</p>
        </div>

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