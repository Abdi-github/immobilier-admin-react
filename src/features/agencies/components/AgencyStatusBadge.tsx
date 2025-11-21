/**
 * Agency Status Badge Component
 *
 * Displays the agency status with appropriate color coding.
 */

import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { AgencyStatus } from '../agencies.types';

interface AgencyStatusBadgeProps {
  status: AgencyStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusVariantMap: Record<AgencyStatus, string> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
  inactive: 'secondary',
};

const statusIconMap: Record<AgencyStatus, string> = {
  active: 'bi-check-circle-fill',
  pending: 'bi-clock-fill',
  suspended: 'bi-slash-circle-fill',
  inactive: 'bi-x-circle-fill',
};

export const AgencyStatusBadge: React.FC<AgencyStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'px-2 py-1 fs-7',
    md: 'px-2 py-1',
    lg: 'px-3 py-2 fs-6',
  };

  return (
    <Badge
      bg={statusVariantMap[status]}
      className={`d-inline-flex align-items-center gap-1 ${sizeClasses[size]}`}
    >
      <i className={`bi ${statusIconMap[status]}`}></i>
      {t(`agencies.status.${status}`)}
    </Badge>
  );
};

export default AgencyStatusBadge;
