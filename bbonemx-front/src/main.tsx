/**
 * BB Maintenance - Entry point para Vite
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';
import { registerServiceWorker } from './lib/firebase';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA + FCM background notifications
registerServiceWorker();
