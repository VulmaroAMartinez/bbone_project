/**
 * Hook for managing FCM push notification registration.
 * Handles requesting permissions, getting tokens, and syncing with backend.
 */

import { useCallback, useEffect, useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { requestFcmToken, isFirebaseConfigured } from '@/lib/firebase';
import { reportError } from '@/lib/logging';

const REGISTER_DEVICE_TOKEN = gql`
  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {
    registerDeviceToken(input: $input) {
      id
      fcmToken
    }
  }
`;

const UNREGISTER_DEVICE_TOKEN = gql`
  mutation UnregisterDeviceToken($input: UnregisterDeviceTokenInput!) {
    unregisterDeviceToken(input: $input)
  }
`;

const FCM_TOKEN_KEY = 'fcm_device_token';

interface UsePushNotificationsOptions {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}

export function usePushNotifications({ isAuthenticated }: UsePushNotificationsOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isRegistering, setIsRegistering] = useState(false);

  const [registerTokenMutation] = useMutation(REGISTER_DEVICE_TOKEN);
  const [unregisterTokenMutation] = useMutation(UNREGISTER_DEVICE_TOKEN);

  // Check support on mount
  useEffect(() => {
    const supported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      isFirebaseConfigured();
    setIsSupported(supported);

    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  /**
   * Request push permission, get FCM token, register with backend.
   * Returns true on success, false if permission was denied, throws on error.
   */
  const registerPush = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !isAuthenticated) return false;

    setIsRegistering(true);
    localStorage.removeItem(FCM_TOKEN_KEY);
    try {
      const token = await requestFcmToken();
      if (!token) {
        // Permission denied by user — not an error
        setPermissionStatus(Notification.permission);
        return false;
      }

      await registerTokenMutation({
        variables: {
          input: {
            fcmToken: token,
            platform: 'WEB',
            deviceName: navigator.userAgent.substring(0, 100),
          },
        },
      });

      localStorage.setItem(FCM_TOKEN_KEY, token);
      setPermissionStatus('granted');
      return true;
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported, isAuthenticated, registerTokenMutation]);

  /**
   * Unregister push token from backend and clear local storage.
   */
  const unregisterPush = useCallback(async (): Promise<void> => {
    const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (!storedToken) return;

    try {
      await unregisterTokenMutation({
        variables: { input: { fcmToken: storedToken } },
      });
    } catch (error) {
      reportError('Push', 'Error al desregistrar token FCM.', error);
    } finally {
      localStorage.removeItem(FCM_TOKEN_KEY);
    }
  }, [unregisterTokenMutation]);

  return {
    isSupported,
    permissionStatus,
    isRegistering,
    isPushEnabled: permissionStatus === 'granted' && !!localStorage.getItem(FCM_TOKEN_KEY),
    registerPush,
    unregisterPush,
  };
}
