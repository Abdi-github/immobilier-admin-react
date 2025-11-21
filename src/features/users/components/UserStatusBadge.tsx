import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import type { UserStatus } from '../users.types';
import { USER_STATUS_CONFIG } from '../users.types';

interface UserStatusBadgeProps {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const config = USER_STATUS_CONFIG[status];

  const sizeClasses = {
    sm: 'px-2 py-1 fs-7',
    md: 'px-2 py-1',
    lg: 'px-3 py-2',
  };

  return (
    <Badge
      bg={config.color}
      className={sizeClasses[size]}
    >
      {t(`users.status.${status}`)}
    </Badge>
  );
};

export default UserStatusBadge;
