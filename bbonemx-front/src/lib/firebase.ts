/**
 * Firebase configuration and FCM token management.
 * All config comes from VITE_FIREBASE_* environment variables.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging';

import { logDevDebug, logDevWarning, reportError } from './logging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let foregroundMessagingAttached = false;

function showForegroundFcmNotification(payload: MessagePayload): void {
  if (Notification.permission !== 'granted') return;

  const title = payload.notification?.title ?? 'BB Maintenance';
  const body = payload.notification?.body ?? '';
  const icon =
    (typeof payload.notification?.image === 'string' && payload.notification.image) ||
    '/icons/icon-192x192.png';
  const data = payload.data ?? {};
  const tag = typeof data['type'] === 'string' ? data['type'] : 'default';
  const link = typeof data['link'] === 'string' ? data['link'] : undefined;

  new Notification(title, {
    body,
    icon,
    badge: '/icons/icon-192x192.png',
    tag,
    data: link ? { link } : {},
    requireInteraction: true,
  });
}

function attachForegroundMessagingOnce(instance: Messaging): void {
  if (foregroundMessagingAttached) return;
  foregroundMessagingAttached = true;
  onMessage(instance, (payload) => {
    logDevDebug('Firebase', 'Mensaje FCM en primer plano.', { messageId: payload.messageId });
    showForegroundFcmNotification(payload);
  });
}

function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId);
}

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    logDevWarning('Firebase', 'Configuración incompleta. Verifica VITE_FIREBASE_*');
    return null;
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseMessaging(): Messaging | null {
  if (messaging) return messaging;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  try {
    messaging = getMessaging(firebaseApp);
    attachForegroundMessagingOnce(messaging);
    return messaging;
  } catch (error) {
    reportError('Firebase', 'No se pudo inicializar Firebase Messaging.', error);
    return null;
  }
}
/**
 * Requests notification permission and gets FCM token.
 * Returns null if permission was denied by the user.
 * Throws if Firebase is misconfigured or getToken fails — caller must handle.
 */
export async function requestFcmToken(): Promise<string | null> {
  logDevDebug('Firebase', 'Iniciando solicitud de token FCM.');

  const fcmMessaging = getFirebaseMessaging();
  if (!fcmMessaging) {
    throw new Error(
      'Firebase Messaging no disponible. Verifica las variables VITE_FIREBASE_* del build.',
    );
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error('Falta VITE_FIREBASE_VAPID_KEY en el build de producción.');
  }

  const permission = await Notification.requestPermission();
  logDevDebug('Firebase', 'Resultado del permiso de notificaciones.', { permission });
  if (permission !== 'granted') {
    return null;
  }

  const SW_TIMEOUT_MS = 10_000;
  const swTimeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Service Worker no activado después de 10s')), SW_TIMEOUT_MS),
  );
  const registration = await Promise.race([navigator.serviceWorker.ready, swTimeout]);
  logDevDebug('Firebase', 'Service Worker listo para solicitar el token FCM.', {
    hasActiveWorker: !!registration.active,
  });

  const FCM_TIMEOUT_MS = 15_000;
  const fcmTimeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('Tiempo de espera agotado al obtener token FCM')),
      FCM_TIMEOUT_MS,
    ),
  );
  const token = await Promise.race([
    getToken(fcmMessaging, { vapidKey, serviceWorkerRegistration: registration }),
    fcmTimeout,
  ]);

  if (!token) {
    throw new Error('Firebase no devolvió un token FCM. Verifica la configuración del proyecto.');
  }

  logDevDebug('Firebase', 'Token FCM obtenido correctamente.');
  return token;
}

export { isFirebaseConfigured };
