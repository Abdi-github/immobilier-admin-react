/**
 * Roles & Permissions Feature Types
 *
 * TypeScript type definitions for the Roles & Permissions admin feature.
 * Maps to the backend admin module API responses.
 */

// =============================================================================
// Enums & Constants
// =============================================================================

export const PERMISSION_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'manage',
  'approve',
  'reject',
  'publish',
  'archive',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

// =============================================================================
// Multilingual Text
// =============================================================================

export interface MultilingualText {
  en?: string;
  fr?: string;
  de?: string;
  it?: string;
}

// =============================================================================
// Permission Types
// =============================================================================

/**
 * Permission entity as returned by the API
 */
export interface Permission {
  id: string;
  name: string;
  display_name: MultilingualText;
  description: MultilingualText;
  resource: string;
  action: PermissionAction;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Query parameters for listing permissions
 */
export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  resource?: string;
  action?: PermissionAction;
  is_active?: boolean;
}

/**
 * Payload for creating a new permission
 */
export interface PermissionCreatePayload {
  name: string;
  display_name: MultilingualText;
  description: MultilingualText;
  resource: string;
  action: PermissionAction;
  is_active?: boolean;
}

/**
 * Payload for updating a permission
 */
export interface PermissionUpdatePayload {
  name?: string;
  display_name?: Partial<MultilingualText>;
  description?: Partial<MultilingualText>;
  resource?: string;
  action?: PermissionAction;
  is_active?: boolean;
}

/**
 * Paginated list of permissions response
 */
export interface PermissionListResponse {
  permissions: Permission[];
  pagination: PaginationMeta;
}

/**
 * Permissions grouped by resource
 */
export interface PermissionsByResource {
  resource: string;
  permissions: Permission[];
}

// =============================================================================
// Role Types
// =============================================================================

/**
 * Role entity as returned by the API
 */
export interface Role {
  id: string;
  name: string;
  display_name: MultilingualText;
  description: MultilingualText;
  permissions: string[] | Permission[];
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Query parameters for listing roles
 */
export interface RoleQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  is_system?: boolean;
  is_active?: boolean;
  include_permissions?: boolean;
}

/**
 * Payload for creating a new role
 */
export interface RoleCreatePayload {
  name: string;
  display_name: MultilingualText;
  description: MultilingualText;
  permissions?: string[]; // Permission IDs
  is_system?: boolean;
  is_active?: boolean;
}

/**
 * Payload for updating a role
 */
export interface RoleUpdatePayload {
  name?: string;
  display_name?: Partial<MultilingualText>;
  description?: Partial<MultilingualText>;
  permissions?: string[]; // Permission IDs (replaces all)
  is_system?: boolean;
  is_active?: boolean;
}

/**
 * Payload for assigning/revoking permissions
 */
export interface PermissionAssignPayload {
  id: string;
  permissions: string[]; // Permission IDs
}

/**
 * Paginated list of roles response
 */
export interface RoleListResponse {
  roles: Role[];
  pagination: PaginationMeta;
}

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// =============================================================================
// UI State Types
// =============================================================================

/**
 * Filter state for role list
 */
export interface RoleFilters {
  search: string;
  is_system: boolean | '';
  is_active: boolean | '';
}

/**
 * Filter state for permission list
 */
export interface PermissionFilters {
  search: string;
  resource: string;
  action: PermissionAction | '';
  is_active: boolean | '';
}

/**
 * Permission selection state for role editing
 */
export interface PermissionSelection {
  [permissionId: string]: boolean;
}
