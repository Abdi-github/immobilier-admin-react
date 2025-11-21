import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import type { UserType } from '../users.types';
import { USER_TYPE_CONFIG } from '../users.types';

interface UserTypeBadgeProps {
  userType: UserType;
  size?: 'sm' | 'md' | 'lg';
}

export const UserTypeBadge: React.FC<UserTypeBadgeProps> = ({
  userType,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const config = USER_TYPE_CONFIG[userType];

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
      <i className={`bi bi-${config.icon} me-1`}></i>
      {t(`users.types.${userType}`)}
    </Badge>
  );
};

export default UserTypeBadge;
