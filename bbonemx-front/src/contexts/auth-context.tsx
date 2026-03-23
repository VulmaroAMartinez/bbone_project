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
import { gql } from '@apollo/client';
import {
  LoginDocument,
  LogoutDocument,
  MeDocument,
  UserBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import type { AuthUser, UserRole } from '@/lib/types';
import { DEFAULT_SWITCHABLE_ROLES, USER_ROLES } from '@/lib/types';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

const UnregisterDeviceTokenDocument = gql`
  mutation UnregisterDeviceTokenOnLogout($input: UnregisterDeviceTokenInput!) {
    unregisterDeviceToken(input: $input)
  }
`;

const ACTIVE_ROLE_KEY = 'auth_active_role';

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
  activeRole: UserRole | null;
  canSwitchRoles: boolean;
  selectRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function getRoleNames(user: AuthUser | null): UserRole[] {
  if (!user) return [];
  return (user.roles?.map((r) => r.name) ?? (user.role?.name ? [user.role.name] : [])) as UserRole[];
}

function resolveActiveRole(user: AuthUser): UserRole | null {
  const roleNames = getRoleNames(user);
  const hasAdmin = roleNames.includes(USER_ROLES.ADMIN);
  const hasTechnician = roleNames.includes(USER_ROLES.TECHNICIAN);
  const hasRequester = roleNames.includes(USER_ROLES.REQUESTER);

  if (hasAdmin && hasTechnician) {
    const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
    return DEFAULT_SWITCHABLE_ROLES.includes(stored as (typeof DEFAULT_SWITCHABLE_ROLES)[number]) ? (stored as (typeof DEFAULT_SWITCHABLE_ROLES)[number]) : null;
  }
  if (hasAdmin) return USER_ROLES.ADMIN;
  if (hasTechnician) return USER_ROLES.TECHNICIAN;
  if (hasRequester) return USER_ROLES.REQUESTER;
  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);

  const [loginMutation] = useMutation(LoginDocument);
  const [logoutMutation] = useMutation(LogoutDocument);
  const client = useApolloClient();

  useEffect(() => {
    const checkAuth = async () => {
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
          localStorage.removeItem(ACTIVE_ROLE_KEY);
        }
      } catch (error) {
        console.error('Error auth:', error);
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
          const { user: loggedUser } = data.login;
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

  const logout = useCallback(async () => {
    // Unregister FCM token before clearing auth
    const fcmToken = localStorage.getItem('fcm_device_token');
    if (fcmToken && user) {
      try {
        await client.mutate({
          mutation: UnregisterDeviceTokenDocument,
          variables: { input: { fcmToken } },
        });
      } catch {
        // Silently fail — token will expire server-side
      }
    }

    try {
      await logoutMutation();
    } catch {
      // Ignore network/auth errors in logout cleanup.
    }

    localStorage.removeItem(ACTIVE_ROLE_KEY);
    localStorage.removeItem('fcm_device_token');
    setUser(null);
    setActiveRoleState(null);
    await client.clearStore();
  }, [client, logoutMutation, user]);

  const selectRole = useCallback((role: UserRole) => {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
    setActiveRoleState(role);
  }, []);

  const roleNames = getRoleNames(user);
  const hasAdmin = roleNames.includes(USER_ROLES.ADMIN);
  const hasTechnician = roleNames.includes(USER_ROLES.TECHNICIAN);
  const isBoss = roleNames.includes(USER_ROLES.BOSS);
  const canSwitchRoles = hasAdmin && hasTechnician;

  const isAdmin = activeRole === USER_ROLES.ADMIN;
  const isTechnician = activeRole === USER_ROLES.TECHNICIAN;
  const isRequester = activeRole === USER_ROLES.REQUESTER;

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
