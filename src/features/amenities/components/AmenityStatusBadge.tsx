/**
 * Amenity Status Badge Component
 */

import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface AmenityStatusBadgeProps {
  isActive: boolean;
}

export function AmenityStatusBadge({ isActive }: AmenityStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge bg={isActive ? 'success' : 'secondary'}>
      {isActive ? t('common.active') : t('common.inactive')}
    </Badge>
  );
}
