// User Types for Admin Panel

export type UserType =
  | 'end_user'
  | 'owner'
  | 'agent'
  | 'agency_admin'
  | 'platform_admin'
  | 'super_admin';

export type UserStatus = 'active' | 'pending' | 'suspended' | 'inactive';

export type SupportedLanguage = 'en' | 'fr' | 'de' | 'it';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  user_type: UserType;
  agency_id?: string;
  preferred_language: SupportedLanguage;
  status: UserStatus;
  email_verified: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  agency?: {
    id: string;
    name: string;
    slug: string;
  };
  roles?: string[];
}

// Query Parameters
export interface UserQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  user_type?: UserType;
  status?: UserStatus;
  agency_id?: string;
  email_verified?: boolean;
}

// Request DTOs
export interface UserCreateDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  user_type?: UserType;
  agency_id?: string;
  preferred_language?: SupportedLanguage;
  status?: UserStatus;
}

export interface UserUpdateDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  user_type?: UserType;
  agency_id?: string;
  preferred_language?: SupportedLanguage;
  status?: UserStatus;
  email_verified?: boolean;
}

export interface UserStatusUpdateDto {
  status: UserStatus;
}

// Response DTOs - UserListResponse removed, using PaginatedResponse from shared types

export interface UserStatistics {
  total: number;
  by_type: Record<UserType, number>;
  by_status: Record<UserStatus, number>;
  active: number;
  pending: number;
  suspended: number;
  verified: number;
  unverified: number;
}

// Form data for create/edit
export interface UserFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  user_type: UserType;
  agency_id?: string;
  preferred_language: SupportedLanguage;
  status?: UserStatus;
}

// User type display configuration
export const USER_TYPE_CONFIG: Record<
  UserType,
  { label: string; color: string; icon: string }
> = {
  end_user: { label: 'End User', color: 'secondary', icon: 'person' },
  owner: { label: 'Property Owner', color: 'info', icon: 'house' },
  agent: { label: 'Agent', color: 'primary', icon: 'person-badge' },
  agency_admin: { label: 'Agency Admin', color: 'warning', icon: 'building' },
  platform_admin: { label: 'Platform Admin', color: 'danger', icon: 'shield' },
  super_admin: { label: 'Super Admin', color: 'dark', icon: 'shield-fill' },
};

// User status display configuration
export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { label: string; color: string }
> = {
  active: { label: 'Active', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  suspended: { label: 'Suspended', color: 'danger' },
  inactive: { label: 'Inactive', color: 'secondary' },
};

// Language display configuration
export const LANGUAGE_CONFIG: Record<
  SupportedLanguage,
  { label: string; flag: string }
> = {
  en: { label: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
};
