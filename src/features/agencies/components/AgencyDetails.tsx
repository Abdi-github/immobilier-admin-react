/**
 * Agency Details Component
 *
 * Displays detailed information about a single agency.
 */

import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { AgencyStatusBadge } from './AgencyStatusBadge';
import { AgencyVerifiedBadge } from './AgencyVerifiedBadge';
import type { Agency } from '../agencies.types';

interface AgencyDetailsProps {
  agency: Agency;
}

export const AgencyDetails: React.FC<AgencyDetailsProps> = ({ agency }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Helper to get localized name
  const getLocalizedName = (
    name: string | { en?: string; fr?: string; de?: string; it?: string } | undefined
  ): string => {
    if (!name) return '-';
    if (typeof name === 'string') return name;
    return name[currentLanguage as keyof typeof name] || name.en || '-';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="agency-details">
      {/* Header with logo and basic info */}
      <Row className="mb-4">
        <Col xs="auto">
          {agency.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency.name}
              className="rounded"
              style={{ width: 100, height: 100, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded bg-light d-flex align-items-center justify-content-center"
              style={{ width: 100, height: 100 }}
            >
              <i className="bi bi-building fs-1 text-muted"></i>
            </div>
          )}
        </Col>
        <Col>
          <h4 className="mb-2">{agency.name}</h4>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <AgencyStatusBadge status={agency.status} />
            <AgencyVerifiedBadge
              isVerified={agency.is_verified}
              verificationDate={agency.verification_date}
            />
            <Badge bg="primary">
              {agency.total_properties} {t('agencies.properties')}
            </Badge>
          </div>
          {agency.website && (
            <a
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              <i className="bi bi-globe me-1"></i>
              {agency.website}
            </a>
          )}
        </Col>
      </Row>

      <hr />

      {/* Contact Information */}
      <h5 className="mb-3">
        <i className="bi bi-person-lines-fill me-2"></i>
        {t('agencies.sections.contact')}
      </h5>
      <Row className="mb-4">
        <Col md={6}>
          <dl className="row mb-0">
            <dt className="col-sm-4 text-muted">{t('agencies.fields.contactPerson')}</dt>
            <dd className="col-sm-8">{agency.contact_person || '-'}</dd>

            <dt className="col-sm-4 text-muted">{t('agencies.fields.email')}</dt>
            <dd className="col-sm-8">
              {agency.email ? (
                <a href={`mailto:${agency.email}`}>{agency.email}</a>
              ) : (
                '-'
              )}
            </dd>

            <dt className="col-sm-4 text-muted">{t('agencies.fields.phone')}</dt>
            <dd className="col-sm-8">
              {agency.phone ? (
                <a href={`tel:${agency.phone}`}>{agency.phone}</a>
              ) : (
                '-'
              )}
            </dd>
          </dl>
        </Col>
      </Row>

      {/* Location Information */}
      <h5 className="mb-3">
        <i className="bi bi-geo-alt-fill me-2"></i>
        {t('agencies.sections.location')}
      </h5>
      <Row className="mb-4">
        <Col md={6}>
          <dl className="row mb-0">
            <dt className="col-sm-4 text-muted">{t('agencies.fields.address')}</dt>
            <dd className="col-sm-8">{agency.address}</dd>

            <dt className="col-sm-4 text-muted">{t('agencies.fields.postalCode')}</dt>
            <dd className="col-sm-8">{agency.postal_code || '-'}</dd>

            <dt className="col-sm-4 text-muted">{t('agencies.fields.city')}</dt>
            <dd className="col-sm-8">
              {agency.city ? getLocalizedName(agency.city.name) : '-'}
            </dd>

            <dt className="col-sm-4 text-muted">{t('agencies.fields.canton')}</dt>
            <dd className="col-sm-8">
              {agency.canton
                ? `${getLocalizedName(agency.canton.name)} (${agency.canton.code})`
                : '-'}
            </dd>
          </dl>
        </Col>
      </Row>

      {/* Description */}
      {agency.description && (
        <>
          <h5 className="mb-3">
            <i className="bi bi-card-text me-2"></i>
            {t('agencies.fields.description')}
          </h5>
          <p className="text-muted mb-4">
            {getLocalizedName(agency.description)}
          </p>
        </>
      )}

      {/* Meta Information */}
      <h5 className="mb-3">
        <i className="bi bi-info-circle me-2"></i>
        {t('agencies.sections.meta')}
      </h5>
      <Row>
        <Col md={6}>
          <dl className="row mb-0">
            <dt className="col-sm-4 text-muted">{t('agencies.fields.slug')}</dt>
            <dd className="col-sm-8">
              <code>{agency.slug}</code>
            </dd>

            <dt className="col-sm-4 text-muted">{t('common.fields.createdAt')}</dt>
            <dd className="col-sm-8">{formatDate(agency.created_at)}</dd>

            <dt className="col-sm-4 text-muted">{t('common.fields.updatedAt')}</dt>
            <dd className="col-sm-8">{formatDate(agency.updated_at)}</dd>

            {agency.is_verified && agency.verification_date && (
              <>
                <dt className="col-sm-4 text-muted">{t('agencies.fields.verifiedAt')}</dt>
                <dd className="col-sm-8">{formatDate(agency.verification_date)}</dd>
              </>
            )}
          </dl>
        </Col>
      </Row>
    </div>
  );
};

export default AgencyDetails;
