import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { isAdminUserType } from '@/shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

/**
 * Protected Route Component
 *
 * Protects admin panel routes by checking:
 * 1. User is authenticated (has valid JWT token)
 * 2. User is an admin (super_admin or platform_admin)
 * 3. Optional: User has required permissions
 *
 * Non-admin users (agents, owners, agency_admins, end_users) are redirected
 * to the login page with an "access denied" indication.
 */
export function ProtectedRoute({ children, requiredPermissions }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not an admin user type - redirect to login with access denied
  // This prevents agents, owners, and agency_admins from accessing the admin panel
  if (user && !isAdminUserType(user.user_type)) {
    return (
      <Navigate
        to="/login"
        state={{ from: location, accessDenied: true }}
        replace
      />
    );
  }

  // Check required permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPermissions = user?.permissions || [];
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
