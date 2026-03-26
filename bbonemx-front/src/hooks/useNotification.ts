import { useContext } from 'react'
import { NotificationContext } from '@/contexts/notification-context'
import type { NotificationContextType } from '@/contexts/notification-context'

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider')
  }
  return context
}

