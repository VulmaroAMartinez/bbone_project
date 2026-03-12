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

const ACTIVE_ROLE_KEY = 'auth_active_role';

/** Fully-resolved user type (no fragment masking) */
export interface AuthUser {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  isActive: boolean;
  roleIds?: string[];
  role?: {
    id: string;
    name: string;
  };
  roles?: Array<{
    id: string;
    name: string;
  }>;
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
  isBoss: boolean;
  activeRole: string | null;
  canSwitchRoles: boolean;
  selectRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function getRoleNames(user: AuthUser | null): string[] {
  if (!user) return [];
  return user.roles?.map((r) => r.name) ?? (user.role?.name ? [user.role.name] : []);
}

function resolveActiveRole(user: AuthUser): string | null {
  const roleNames = getRoleNames(user);
  const hasAdmin = roleNames.includes('ADMIN');
  const hasTechnician = roleNames.includes('TECHNICIAN');
  const hasRequester = roleNames.includes('REQUESTER');

  if (hasAdmin && hasTechnician) {
    const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
    return stored === 'ADMIN' || stored === 'TECHNICIAN' ? stored : null;
  }
  if (hasAdmin) return 'ADMIN';
  if (hasTechnician) return 'TECHNICIAN';
  if (hasRequester) return 'REQUESTER';
  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<string | null>(null);

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
          const unmasked = unmaskFragment(UserBasicFragmentDoc, data.me) as unknown as AuthUser;
          setUser(unmasked);
          setActiveRoleState(resolveActiveRole(unmasked));
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem(ACTIVE_ROLE_KEY);
        }
      } catch (error) {
        console.error('Error auth:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem(ACTIVE_ROLE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [client]);

  const login = useCallback(
    async (employeeNumber: string, password: string): Promise<boolean> => {
      try {
        const { data } = await loginMutation({
          variables: { employeeNumber, password },
        });

        if (data?.login) {
          const { accessToken, user: loggedUser } = data.login;
          localStorage.setItem('auth_token', accessToken);
          const unmasked = unmaskFragment(UserBasicFragmentDoc, loggedUser) as unknown as AuthUser;
          setUser(unmasked);
          setActiveRoleState(resolveActiveRole(unmasked));
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

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem(ACTIVE_ROLE_KEY);
    setUser(null);
    setActiveRoleState(null);
  }, []);

  const selectRole = useCallback((role: string) => {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
    setActiveRoleState(role);
  }, []);

  const roleNames = getRoleNames(user);
  const hasAdmin = roleNames.includes('ADMIN');
  const hasTechnician = roleNames.includes('TECHNICIAN');
  const isBoss = roleNames.includes('BOSS');
  const canSwitchRoles = hasAdmin && hasTechnician;

  const isAdmin = activeRole === 'ADMIN';
  const isTechnician = activeRole === 'TECHNICIAN';
  const isRequester = activeRole === 'REQUESTER';

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
    isTechnician,
    isRequester,
    isBoss,
    activeRole,
    canSwitchRoles,
    selectRole,
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
