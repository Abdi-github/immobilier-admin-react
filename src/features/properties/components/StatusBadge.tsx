import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { PropertyStatus } from '../properties.types';

interface StatusBadgeProps {
  status: PropertyStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<PropertyStatus, { variant: string; icon: string }> = {
  DRAFT: { variant: 'secondary', icon: 'bi-pencil' },
  PENDING_APPROVAL: { variant: 'warning', icon: 'bi-clock-history' },
  APPROVED: { variant: 'info', icon: 'bi-check-circle' },
  REJECTED: { variant: 'danger', icon: 'bi-x-circle' },
  PUBLISHED: { variant: 'success', icon: 'bi-globe' },
  ARCHIVED: { variant: 'dark', icon: 'bi-archive' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status];

  return (
    <Badge
      bg={config.variant}
      className={`d-inline-flex align-items-center gap-1 ${size === 'sm' ? 'px-2 py-1' : ''}`}
    >
      <i className={config.icon} />
      {t(`properties.status.${status.toLowerCase()}`)}
    </Badge>
  );
}
