/**
 * Role Status Badge Component
 *
 * Displays the active/inactive status of a role with appropriate styling.
 */

import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface RoleStatusBadgeProps {
  isActive: boolean;
}

export function RoleStatusBadge({ isActive }: RoleStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge bg={isActive ? 'success' : 'secondary'}>
      {isActive ? t('common.active') : t('common.inactive')}
    </Badge>
  );
}
