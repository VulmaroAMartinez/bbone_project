/**
 * BB Maintenance - Proveedores de la aplicación
 * Envuelve la aplicación con Apollo Client, Auth y Notifications
 */

'use client';

import { ApolloProvider } from '@apollo/client/react';
import { client, initApolloCache } from '@/lib/graphql/client';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { GlobalSyncManager } from '@/components/GlobalSyncManager';
import { useState, useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    initApolloCache()
      .catch(() => undefined)
      .finally(() => setCacheReady(true));
  }, []);

  if (!cacheReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="bbmaintenance-theme">
      <ApolloProvider client={client}>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <GlobalSyncManager />
          </NotificationProvider>
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  );
}
