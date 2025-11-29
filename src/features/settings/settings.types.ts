/**
 * Settings Feature Types
 */

/**
 * General settings
 */
export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  defaultLanguage: 'en' | 'fr' | 'de' | 'it';
  timezone: string;
}

/**
 * Appearance settings
 */
export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  emailNotifications: boolean;
  newPropertyAlert: boolean;
  approvalReminders: boolean;
  weeklyDigest: boolean;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
}

/**
 * Settings group for tabs
 */
export type SettingsGroup = 'general' | 'appearance' | 'notifications' | 'security';
