/**
 * usePermissions Hook
 *
 * Provides permission checking utilities for RBAC.
 * Uses the user's permissions from the auth state.
 */

import { useAppSelector } from '@/app/hooks';
import { isAdminUserType } from '@/shared/types';

export interface UsePermissionsReturn {
  /** Array of user permissions */
  permissions: string[];
  /** Check if user has a specific permission */
  hasPermission: (permission: string) => boolean;
  /** Check if user has any of the specified permissions */
  hasAnyPermission: (permissions: string[]) => boolean;
  /** Check if user has all of the specified permissions */
  hasAllPermissions: (permissions: string[]) => boolean;
  /** Check if user has a specific role */
  hasRole: (role: string) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: string[]) => boolean;
  /** Array of user roles */
  roles: string[];
  /** Check if user is an admin (super_admin or platform_admin) */
  isAdmin: boolean;
  /** User type */
  userType: string | undefined;
}

/**
 * Hook for checking user permissions and roles
 *
 * @example
 * ```tsx
 * const { hasPermission, hasAnyPermission } = usePermissions();
 *
 * // Check single permission
 * if (hasPermission('agencies:create')) {
 *   // Show create button
 * }
 *
 * // Check multiple permissions
 * if (hasAnyPermission(['agencies:update', 'agencies:manage'])) {
 *   // Show edit button
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.permissions || [];
  const roles = user?.roles || [];

  /**
   * Check if user has a specific permission
   * Also grants access if user has wildcard (*) permission
   */
  const hasPermission = (permission: string): boolean => {
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;

    // Check for resource-level wildcard (e.g., 'agencies:*' grants 'agencies:create')
    const [resource] = permission.split(':');
    if (permissions.includes(`${resource}:*`)) return true;
    if (permissions.includes(`${resource}:manage`)) return true;

    return false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((p) => hasPermission(p));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((p) => hasPermission(p));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some((r) => hasRole(r));
  };

  /**
   * Check if user is an admin (super_admin or platform_admin)
   */
  const isAdmin = user?.user_type ? isAdminUserType(user.user_type) : false;

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    roles,
    isAdmin,
    userType: user?.user_type,
  };
}
