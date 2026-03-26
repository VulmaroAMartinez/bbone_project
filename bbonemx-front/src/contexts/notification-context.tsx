import {
  createContext,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/hooks/useAuth';
import {
  MarkAllNotificationsAsReadDocument,
  MarkNotificationAsReadDocument,
  MyNotificationsDocument,
  NotificationItemFragmentDoc,
  type NotificationItemFragment
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';
import { usePushNotifications } from '@/hooks/use-push-notifications';


export interface NotificationContextType {
  notifications: NotificationItemFragment[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
  // Push notifications
  pushSupported: boolean;
  pushPermission: NotificationPermission;
  isPushEnabled: boolean;
  isRegisteringPush: boolean;
  registerPush: () => Promise<boolean>;
  unregisterPush: () => Promise<void>;
}

// Crear contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export { NotificationContext };

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuth();

  const { data, loading, refetch } = useQuery(MyNotificationsDocument, {
    variables: { limit: 10, page: 1 },
    skip: !isAuthenticated || !user?.id,
    pollInterval: 30000,
    fetchPolicy: 'cache-and-network'
  });

  const [markReadMutation] = useMutation(MarkNotificationAsReadDocument);
  const [markAllReadMutation] = useMutation(MarkAllNotificationsAsReadDocument);

  // Push notifications
  const {
    isSupported: pushSupported,
    permissionStatus: pushPermission,
    isPushEnabled,
    isRegistering: isRegisteringPush,
    registerPush,
    unregisterPush,
  } = usePushNotifications({ isAuthenticated });

  // Auto-register push if permission was already granted
  useEffect(() => {
    if (isAuthenticated && pushSupported && Notification.permission === 'granted') {
      registerPush();
    }
  }, [isAuthenticated, pushSupported]); // eslint-disable-line react-hooks/exhaustive-deps

  const notifications = data?.myNotifications.data ? unmaskFragment(NotificationItemFragmentDoc, data.myNotifications.data) : [];
  const unreadCount = data?.myNotifications.unreadCount || 0;

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await markReadMutation({ variables: { id } });
      } catch (error) {
        console.error('Error al marcar notificación:', error);
      }
    },
    [markReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllReadMutation();
      refetch();
    } catch (error) {
      console.error('Error al marcar todas las notificaciones:', error);
    }
  }, [markAllReadMutation, refetch]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading: loading,
    markAsRead,
    markAllAsRead,
    refetch,
    pushSupported,
    pushPermission,
    isPushEnabled,
    isRegisteringPush,
    registerPush,
    unregisterPush,
  }

 
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
