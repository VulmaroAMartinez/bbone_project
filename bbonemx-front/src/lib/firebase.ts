/**
 * Firebase configuration and FCM token management.
 * All config comes from VITE_FIREBASE_* environment variables.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, type Messaging } from 'firebase/messaging';

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
    return messaging;
  } catch (error) {
    reportError('Firebase', 'No se pudo inicializar Firebase Messaging.', error);
    return null;
  }
}

/**
 * Registers the Firebase messaging service worker.
 * Config is hardcoded in the SW file (public client credentials).
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    logDevWarning('SW', 'Service workers no soportados por este navegador.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    logDevDebug('SW', 'Service Worker registrado correctamente.');
    return registration;
  } catch (error) {
    reportError('SW', 'No se pudo registrar el Service Worker de mensajería.', error);
    return null;
  }
}

/**
 * Requests notification permission and gets FCM token.
 * Returns null if permission denied or Firebase not configured.
 */
export async function requestFcmToken(): Promise<string | null> {
  logDevDebug('Firebase', 'Iniciando solicitud de token FCM.');

  const fcmMessaging = getFirebaseMessaging();
  if (!fcmMessaging) {
    logDevWarning('Firebase', 'Firebase Messaging no está disponible.', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
      hasAppId: !!firebaseConfig.appId,
    });
    return null;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    logDevWarning('Firebase', 'Falta la VAPID key para solicitar el token FCM.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    logDevDebug('Firebase', 'Resultado del permiso de notificaciones.', { permission });
    if (permission !== 'granted') {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    logDevDebug('Firebase', 'Service Worker listo para solicitar el token FCM.', {
      hasActiveWorker: !!registration.active,
    });

    const token = await getToken(fcmMessaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      logDevWarning('Firebase', 'Firebase no devolvió un token FCM.');
      return null;
    }

    logDevDebug('Firebase', 'Token FCM obtenido correctamente.');
    return token;
  } catch (error) {
    reportError('Firebase', 'Ocurrió un error al solicitar el token FCM.', error);
    return null;
  }
}

export { isFirebaseConfigured };
