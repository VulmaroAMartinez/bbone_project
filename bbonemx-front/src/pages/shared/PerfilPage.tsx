'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/contexts/auth-context';
import { useNotification } from '@/contexts/notification-context';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Mail, Shield, Building, LogOut, Settings, Briefcase, Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/** Local query to fetch additional profile data (department) not included in UserBasicFragment. */
const PROFILE_DETAIL_QUERY = gql`
  query ProfileDetail {
    me {
      id
      department {
        id
        name
      }
    }
  }
`;

/** Local query to resolve the authenticated technician's position by matching user ID. */
const TECH_POSITION_QUERY = gql`
  query ProfileTechPosition {
    techniciansActive {
      id
      user {
        id
      }
      position {
        id
        name
      }
    }
  }
`;

const MY_NOTIFICATION_PREFERENCES_QUERY = gql`
  query MyNotificationPreferences {
    myNotificationPreferences {
      id
      userId
      notificationType
      pushEnabled
      emailEnabled
      inAppEnabled
      quietHoursStart
      quietHoursEnd
    }
  }
`;

const UPDATE_NOTIFICATION_PREFERENCE_MUTATION = gql`
  mutation UpdateNotificationPreference($input: UpdateNotificationPreferenceInput!) {
    updateNotificationPreference(input: $input) {
      id
      userId
      notificationType
      pushEnabled
      emailEnabled
      inAppEnabled
      quietHoursStart
      quietHoursEnd
    }
  }
`;

interface ProfileDetailData {
  me: {
    id: string;
    department: { id: string; name: string };
  };
}

interface TechPositionData {
  techniciansActive: Array<{
    id: string;
    user: { id: string };
    position: { id: string; name: string };
  }>;
}

interface NotificationPreference {
  id?: string;
  userId: string;
  notificationType: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

interface PreferencesData {
  myNotificationPreferences: NotificationPreference[];
}

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  WORK_ORDER_ASSIGNED: 'OT asignada',
  WORK_ORDER_COMPLETED: 'OT completada',
  WORK_ORDER_TEMPORARY_REPAIR: 'Reparación temporal',
  PREVENTIVE_TASK_WO_GENERATED: 'OT preventiva generada',
  WORK_ORDER_CREATED_BY_REQUESTER: 'OT creada por solicitante',
};

function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN': return 'Administrador';
    case 'TECHNICIAN': return 'Técnico';
    case 'REQUESTER': return 'Solicitante';
    case 'BOSS': return 'Jefe';
    default: return role;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'ADMIN': return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
    case 'TECHNICIAN': return 'bg-primary/20 text-primary border-primary/30';
    case 'REQUESTER': return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

export default function PerfilPage() {
  const { user, logout, isTechnician, isRequester } = useAuth();
  const {
    pushSupported,
    pushPermission,
    isPushEnabled,
    isRegisteringPush,
    registerPush,
  } = useNotification();
  const navigate = useNavigate();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const { data: profileData } = useQuery<ProfileDetailData>(PROFILE_DETAIL_QUERY);

  const { data: techData } = useQuery<TechPositionData>(TECH_POSITION_QUERY, {
    skip: !isTechnician,
  });

  const { data: prefsData, refetch: refetchPrefs } = useQuery<PreferencesData>(
    MY_NOTIFICATION_PREFERENCES_QUERY,
  );

  const [updatePreference] = useMutation(UPDATE_NOTIFICATION_PREFERENCE_MUTATION);

  const handleTogglePush = async () => {
    if (!isPushEnabled) {
      const success = await registerPush();
      if (success) {
        toast.success('Notificaciones push activadas');
      } else if (pushPermission === 'denied') {
        toast.error('Permiso de notificaciones bloqueado. Habilítalo desde la configuración del navegador.');
      } else {
        toast.error('No se pudieron activar las notificaciones push');
      }
    }
  };

  const handleTogglePreference = async (
    notificationType: string,
    field: 'pushEnabled' | 'emailEnabled',
    value: boolean,
  ) => {
    try {
      await updatePreference({
        variables: {
          input: {
            notificationType,
            [field]: value,
          },
        },
      });
      refetchPrefs();
    } catch {
      toast.error('Error al actualizar preferencia');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const initials = user.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const departmentName = profileData?.me.department.name;
  const technicianRecord = techData?.techniciansActive.find((t) => t.user.id === user.id);
  const positionName = technicianRecord?.position.name;
  const preferences = prefsData?.myNotificationPreferences || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>

      {/* Profile card */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl font-bold text-foreground">{user.fullName}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                {(() => {
                  const roleNames =
                    user.roles?.map((role) => role.name) ??
                    (user.role?.name ? [user.role.name] : []);
                  const primaryRole =
                    roleNames?.includes('ADMIN')
                      ? 'ADMIN'
                      : roleNames?.includes('TECHNICIAN')
                      ? 'TECHNICIAN'
                      : roleNames?.includes('REQUESTER')
                      ? 'REQUESTER'
                      : roleNames?.[0];
                  if (!primaryRole) return null;
                  return (
                    <Badge variant="outline" className={getRoleColor(primaryRole)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleLabel(primaryRole)}
                    </Badge>
                  );
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Información de la cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">Nombre completo</p>
              <p className="text-foreground font-medium">{user.fullName}</p>
            </div>
          </div>
          {user.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground">Correo electrónico</p>
                <p className="text-foreground font-medium">{user.email}</p>
              </div>
            </div>
          )}
          {user.employeeNumber && (
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground">Nómina</p>
                <p className="text-foreground font-medium">{user.employeeNumber}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground">Rol</p>
              <p className="text-foreground font-medium">
                {(() => {
                  const roleNames =
                    user.roles?.map((role) => role.name) ??
                    (user.role?.name ? [user.role.name] : []);
                  if (!roleNames || roleNames.length === 0) return 'Sin rol';
                  return roleNames.map((name) => getRoleLabel(name)).join(' / ');
                })()}
              </p>
            </div>
          </div>

          {/* Department — shown for REQUESTER and ADMIN roles */}
          {isRequester && departmentName && (
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground">Departamento</p>
                <p className="text-foreground font-medium">{departmentName}</p>
              </div>
            </div>
          )}

          {/* Position — shown only for TECHNICIAN role */}
          {isTechnician && positionName && (
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground">Puesto</p>
                <p className="text-foreground font-medium">{positionName}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Push toggle global */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPushEnabled ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Notificaciones push</p>
                <p className="text-xs text-muted-foreground">
                  {!pushSupported
                    ? 'No soportado en este navegador'
                    : pushPermission === 'denied'
                    ? 'Bloqueado — habilita desde configuración del navegador'
                    : isPushEnabled
                    ? 'Recibirás notificaciones aunque la app esté cerrada'
                    : 'Activa para recibir notificaciones en segundo plano'}
                </p>
              </div>
            </div>
            {pushSupported && pushPermission !== 'denied' && (
              <Button
                variant={isPushEnabled ? 'outline' : 'default'}
                size="sm"
                onClick={handleTogglePush}
                disabled={isRegisteringPush || isPushEnabled}
              >
                {isRegisteringPush ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPushEnabled ? (
                  'Activado'
                ) : (
                  'Activar'
                )}
              </Button>
            )}
          </div>

          {/* Per-type preferences */}
          {preferences.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Preferencias por tipo
              </p>
              {preferences.map((pref) => (
                <div
                  key={pref.notificationType}
                  className="flex items-center justify-between py-1"
                >
                  <p className="text-sm text-foreground">
                    {NOTIFICATION_TYPE_LABELS[pref.notificationType] || pref.notificationType}
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Push
                      <Switch
                        checked={pref.pushEnabled}
                        onCheckedChange={(checked) =>
                          handleTogglePreference(pref.notificationType, 'pushEnabled', checked)
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full gap-2"
        size="lg"
        onClick={() => setLogoutConfirmOpen(true)}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </Button>

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar sesión</DialogTitle>
            <DialogDescription>¿Está seguro de que desea cerrar sesión?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
