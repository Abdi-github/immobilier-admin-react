/**
 * Role System Badge Component
 *
 * Displays whether a role is a system role (cannot be deleted).
 */

import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface RoleSystemBadgeProps {
  isSystem: boolean;
}

export function RoleSystemBadge({ isSystem }: RoleSystemBadgeProps) {
  const { t } = useTranslation();

  if (!isSystem) {
    return null;
  }

  return (
    <Badge bg="info" className="d-flex align-items-center gap-1">
      <i className="bi bi-shield-lock" />
      {t('roles.systemRole')}
    </Badge>
  );
}
