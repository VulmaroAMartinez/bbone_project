/**
 * BB Maintenance - Proveedores de la aplicación
 * Envuelve la aplicación con Apollo Client, Auth y Notifications
 */

'use client';

import { ApolloProvider } from '@apollo/client/react';
import { client } from '@/lib/graphql/client';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
