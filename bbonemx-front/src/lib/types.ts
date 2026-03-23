import type { ResultOf } from '@graphql-typed-document-node/core';
import { RoleBasicFragmentDoc, UserBasicFragmentDoc } from '@/lib/graphql/generated/graphql';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  REQUESTER: 'REQUESTER',
  BOSS: 'BOSS',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type AuthRole = ResultOf<typeof RoleBasicFragmentDoc>;
export type AuthUser = Omit<ResultOf<typeof UserBasicFragmentDoc>, 'role' | 'roles'> & {
  role?: AuthRole | null;
  roles?: AuthRole[];
};

export const DEFAULT_SWITCHABLE_ROLES = [USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN] as const;
