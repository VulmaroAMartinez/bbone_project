/**
 * Firebase configuration and FCM token management.
 * All config comes from VITE_FIREBASE_* environment variables.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, type Messaging } from 'firebase/messaging';

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
    console.warn('[Firebase] No configurado. Verifica las variables VITE_FIREBASE_* en .env');
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
    console.error('[Firebase] Error al inicializar messaging:', error);
    return null;
  }
}

/**
 * Registers the Firebase messaging service worker.
 * Firebase public config is passed via query params because files in /public
 * are served as-is and cannot read import.meta.env/process.env directly.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers no soportados');
    return null;
  }

  try {
    const swUrl = new URL('/firebase-messaging-sw.js', window.location.origin);
    swUrl.searchParams.set('apiKey', firebaseConfig.apiKey ?? '');
    swUrl.searchParams.set('authDomain', firebaseConfig.authDomain ?? '');
    swUrl.searchParams.set('projectId', firebaseConfig.projectId ?? '');
    swUrl.searchParams.set('storageBucket', firebaseConfig.storageBucket ?? '');
    swUrl.searchParams.set('messagingSenderId', firebaseConfig.messagingSenderId ?? '');
    swUrl.searchParams.set('appId', firebaseConfig.appId ?? '');

    const registration = await navigator.serviceWorker.register(swUrl.toString(), {
      scope: '/',
    });
    console.log('[SW] Service Worker registrado');
    return registration;
  } catch (error) {
    console.error('[SW] Error al registrar Service Worker:', error);
    return null;
  }
}

/**
 * Requests notification permission and gets FCM token.
 * Returns null if permission denied or Firebase not configured.
 */
export async function requestFcmToken(): Promise<string | null> {
  console.log('[Firebase Debug] 1. Iniciando requestFcmToken...');

  const fcmMessaging = getFirebaseMessaging();
  if (!fcmMessaging) {
    console.error('[Firebase Debug] 2. FALLÓ: getFirebaseMessaging() retornó null');
    console.log('[Firebase Debug] Config:', {
      apiKey: !!firebaseConfig.apiKey,
      projectId: firebaseConfig.projectId,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: !!firebaseConfig.appId,
    });
    return null;
  }
  console.log('[Firebase Debug] 2. OK: Messaging inicializado');

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error('[Firebase Debug] 3. FALLÓ: VITE_FIREBASE_VAPID_KEY no existe');
    return null;
  }
  console.log('[Firebase Debug] 3. OK: VAPID key existe (primeros 20 chars):', vapidKey.substring(0, 20));

  try {
    console.log('[Firebase Debug] 4. Pidiendo permiso de notificación...');
    const permission = await Notification.requestPermission();
    console.log('[Firebase Debug] 4. Permiso:', permission);
    if (permission !== 'granted') {
      return null;
    }

    console.log('[Firebase Debug] 5. Esperando Service Worker ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[Firebase Debug] 5. OK: SW ready. Scope:', registration.scope);
    console.log('[Firebase Debug] 5. SW state:', registration.active?.state);

    console.log('[Firebase Debug] 6. Solicitando FCM token con getToken()...');
    const token = await getToken(fcmMessaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('[Firebase Debug] 6. OK: Token obtenido (primeros 20 chars):', token.substring(0, 20));
    } else {
      console.error('[Firebase Debug] 6. FALLÓ: getToken() retornó null/empty');
    }
    return token;
  } catch (error) {
    console.error('[Firebase Debug] EXCEPCIÓN en paso actual:', error);
    if (error instanceof Error) {
      console.error('[Firebase Debug] Error name:', error.name);
      console.error('[Firebase Debug] Error message:', error.message);
      console.error('[Firebase Debug] Error stack:', error.stack);
    }
    return null;
  }
}

export { isFirebaseConfigured };
