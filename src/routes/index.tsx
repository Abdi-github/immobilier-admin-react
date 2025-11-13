import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Dashboard
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

// Properties
import { PropertiesPage, PropertyDetailPage, PendingApprovalsPage, PropertyFormPage } from '@/features/properties';

// Agencies
import { AgenciesPage, AgencyDetailPage } from '@/features/agencies';

// Users
import { UsersPage, UserDetailPage } from '@/features/users';

// Roles & Permissions
import { RolesPage, RoleDetailPage, PermissionsPage } from '@/features/roles';

// Categories
import { CategoriesPage } from '@/features/categories';

// Amenities
import { AmenitiesPage } from '@/features/amenities';

// Locations
import { LocationsPage } from '@/features/locations';

// Translations
import { TranslationsPage } from '@/features/translations';

// Settings
import { SettingsPage } from '@/features/settings';

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected admin routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Properties */}
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/pending" element={<PendingApprovalsPage />} />
        <Route path="/properties/create" element={<PropertyFormPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
        
        {/* Agencies */}
        <Route path="/agencies" element={<AgenciesPage />} />
        <Route path="/agencies/:id" element={<AgencyDetailPage />} />
        
        {/* Users */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        
        {/* Categories */}
        <Route path="/categories" element={<CategoriesPage />} />
        
        {/* Amenities */}
        <Route path="/amenities" element={<AmenitiesPage />} />
        
        {/* Locations */}
        <Route path="/locations" element={<LocationsPage />} />
        
        {/* Translations */}
        <Route path="/translations" element={<TranslationsPage />} />
        
        {/* Roles & Permissions */}
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/roles/:id" element={<RoleDetailPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        
        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
