/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications when the app is closed or in background.
 *
 * These are PUBLIC client-side credentials (same as what the browser receives).
 * Server-side secrets (FIREBASE_PRIVATE_KEY) are only in the backend .env.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA6qxmXSDQTR2Qu4ZHBY7xiBUTLImHmc5E',
  authDomain: 'bbone-653af.firebaseapp.com',
  projectId: 'bbone-653af',
  storageBucket: 'bbone-653af.firebasestorage.app',
  messagingSenderId: '901493337912',
  appId: '1:901493337912:web:4cc8f07213c03561335bcd',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'BB Maintenance';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const link = event.notification.data?.link || '/';
  const urlToOpen = new URL(link, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return self.clients.openWindow(urlToOpen);
      })
  );
});

// Activate immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
