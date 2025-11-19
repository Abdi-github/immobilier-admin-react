/**
 * Category Section Badge Component
 */

import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CategorySection } from '../categories.types';

interface CategorySectionBadgeProps {
  section: CategorySection;
}

const sectionVariants: Record<CategorySection, string> = {
  residential: 'primary',
  commercial: 'info',
  land: 'warning',
  parking: 'secondary',
  special: 'dark',
};

const sectionIcons: Record<CategorySection, string> = {
  residential: 'bi-house',
  commercial: 'bi-building',
  land: 'bi-geo-alt',
  parking: 'bi-p-square',
  special: 'bi-star',
};

export function CategorySectionBadge({ section }: CategorySectionBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge bg={sectionVariants[section]} className="d-inline-flex align-items-center gap-1">
      <i className={sectionIcons[section]}></i>
      {t(`categories.sections.${section}`)}
    </Badge>
  );
}
