/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

/**
 * Unified Service Worker — BB Maintenance
 *
 * Combines:
 *   - Workbox precaching + navigation routing (vite-plugin-pwa injectManifest)
 *   - Firebase Cloud Messaging background notifications
 *
 * Replaces the old firebase-messaging-sw.js (separate scope conflict) with a
 * single SW controlling scope "/".
 */

declare let self: ServiceWorkerGlobalScope;

import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// ---- Workbox precaching -------------------------------------------------- //
// vite-plugin-pwa (injectManifest) replaces self.__WB_MANIFEST at build time
// with the list of assets to precache.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Single-page app navigation: serve index.html for all navigation requests
// that are not already precached.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// ---- Prompt-based update support ----------------------------------------- //
// vite-plugin-pwa with registerType:'prompt' sends this message when the user
// accepts the update prompt. We must not call skipWaiting() on our own.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ---- Firebase Cloud Messaging -------------------------------------------- //
// Config values are replaced by Vite at build time (import.meta.env.VITE_*).
const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

// getMessaging() from firebase/messaging/sw registers the push subscription
// handler that FCM requires. This is what makes getToken() work in the main
// thread when it receives this SW registration via navigator.serviceWorker.ready.
const messaging = getMessaging(firebaseApp);

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.notification?.title ?? 'BB Maintenance';
  const notificationOptions: NotificationOptions = {
    body: payload.notification?.body ?? '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: (payload.data?.['type'] as string | undefined) ?? 'default',
    data: payload.data ?? {},
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ---- Notification click handler ------------------------------------------ //
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const link = (event.notification.data as { link?: string })?.link ?? '/';
  const urlToOpen = new URL(link, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing window for this origin if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            const windowClient = client as WindowClient;
            return windowClient.navigate(urlToOpen).then((navigated) => {
              const toFocus = navigated ?? windowClient;
              return toFocus.focus();
            });
          }
        }
        return self.clients.openWindow(urlToOpen);
      }),
  );
});
