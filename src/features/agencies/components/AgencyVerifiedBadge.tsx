/**
 * Agency Verified Badge Component
 *
 * Displays the verification status of an agency.
 */

import React from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface AgencyVerifiedBadgeProps {
  isVerified: boolean;
  verificationDate?: string;
  showTooltip?: boolean;
}

export const AgencyVerifiedBadge: React.FC<AgencyVerifiedBadgeProps> = ({
  isVerified,
  verificationDate,
  showTooltip = true,
}) => {
  const { t } = useTranslation();

  const badge = (
    <Badge
      bg={isVerified ? 'info' : 'light'}
      text={isVerified ? 'white' : 'dark'}
      className="d-inline-flex align-items-center gap-1"
    >
      <i className={`bi ${isVerified ? 'bi-patch-check-fill' : 'bi-patch-question'}`}></i>
      {isVerified ? t('agencies.verified') : t('agencies.unverified')}
    </Badge>
  );

  if (showTooltip && isVerified && verificationDate) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="verification-tooltip">
            {t('agencies.verifiedOn', {
              date: new Date(verificationDate).toLocaleDateString(),
            })}
          </Tooltip>
        }
      >
        {badge}
      </OverlayTrigger>
    );
  }

  return badge;
};

export default AgencyVerifiedBadge;
