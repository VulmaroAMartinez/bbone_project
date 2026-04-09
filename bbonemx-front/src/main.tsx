/**
 * BB Maintenance - Entry point para Vite
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';

/** Evita conflicto con un SW legacy en `/firebase-messaging-sw.js` (unificado en `sw.ts`). */
function unregisterLegacyFirebaseMessagingSw(): void {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      const url = reg.active?.scriptURL ?? reg.waiting?.scriptURL ?? '';
      if (url.includes('firebase-messaging-sw.js')) {
        void reg.unregister();
      }
    }
  });
}

unregisterLegacyFirebaseMessagingSw();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
