'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { LoginDocument, MeDocument, UserBasicFragmentDoc } from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

/** Fully-resolved user type (no fragment masking) */
export interface AuthUser {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (employeeNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isTechnician: boolean;
  isRequester: boolean;
}

// Crear contexto con valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [loginMutation] = useMutation(LoginDocument);
  const client = useApolloClient();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await client.query({
          query: MeDocument,
          fetchPolicy: 'network-only',
        });

        if (data?.me) {
          setUser(unmaskFragment(UserBasicFragmentDoc, data.me) as unknown as AuthUser);
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Error auth:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [client]);

  // Función de login
  const login = useCallback(
    async (employeeNumber: string, password: string): Promise<boolean> => {
      try {
        const { data } = await loginMutation({
          variables: { employeeNumber, password },
        });

        if (data?.login) {
          const { accessToken, user: loggedUser } = data.login;
          localStorage.setItem('auth_token', accessToken);
          setUser(unmaskFragment(UserBasicFragmentDoc, loggedUser) as unknown as AuthUser);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    [loginMutation]
  );

  // Función de logout
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const isAdmin = user?.role?.name === 'ADMIN';
  const isTechnician = user?.role?.name === 'TECHNICIAN';
  const isRequester = user?.role?.name === 'REQUESTER';

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
    isTechnician,
    isRequester,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}