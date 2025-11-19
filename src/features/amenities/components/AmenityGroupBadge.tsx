/**
 * Amenity Group Badge Component
 */

import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AmenityGroup } from '../amenities.types';

interface AmenityGroupBadgeProps {
  group: AmenityGroup;
}

const groupColors: Record<AmenityGroup, string> = {
  general: 'primary',
  kitchen: 'warning',
  bathroom: 'info',
  outdoor: 'success',
  security: 'danger',
  parking: 'secondary',
  accessibility: 'dark',
  energy: 'success',
  other: 'light',
};

const groupIcons: Record<AmenityGroup, string> = {
  general: 'bi-house',
  kitchen: 'bi-cup-hot',
  bathroom: 'bi-droplet',
  outdoor: 'bi-tree',
  security: 'bi-shield-check',
  parking: 'bi-p-square',
  accessibility: 'bi-universal-access',
  energy: 'bi-lightning',
  other: 'bi-three-dots',
};

export function AmenityGroupBadge({ group }: AmenityGroupBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge bg={groupColors[group]} text={group === 'other' ? 'dark' : undefined}>
      <i className={`${groupIcons[group]} me-1`}></i>
      {t(`amenities.groups.${group}`)}
    </Badge>
  );
}
