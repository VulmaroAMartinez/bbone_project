import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from './auth-context';
import { 
  MarkAllNotificationsAsReadDocument, 
  MarkNotificationAsReadDocument, 
  MyNotificationsDocument,
  NotificationItemFragmentDoc,
  type NotificationItemFragment 
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';


export interface NotificationContextType {
  notifications: NotificationItemFragment[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}

// Crear contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useAuth();

  const { data, loading ,refetch } = useQuery(MyNotificationsDocument, {
    variables: { limit: 10, page: 1 },
    skip: !isAuthenticated || !user?.id,
    pollInterval: 30000, 
    fetchPolicy: 'cache-and-network'
  });

  const [markReadMutation] = useMutation(MarkNotificationAsReadDocument);
  const [markAllReadMutation] = useMutation(MarkAllNotificationsAsReadDocument);

  const notifications = data?.myNotifications.data ? unmaskFragment(NotificationItemFragmentDoc, data.myNotifications.data) : [];
  const unreadCount = data?.myNotifications.unreadCount || 0;

  // Marcar una notificación como leída
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
  }

 
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  return context;
}


