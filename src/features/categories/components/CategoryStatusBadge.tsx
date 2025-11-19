/**
 * Category Status Badge Component
 */

import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface CategoryStatusBadgeProps {
  isActive: boolean;
}

export function CategoryStatusBadge({ isActive }: CategoryStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge bg={isActive ? 'success' : 'secondary'}>
      {isActive ? t('common.active') : t('common.inactive')}
    </Badge>
  );
}
