/**
 * Agency List Component
 *
 * Displays a filterable, sortable, paginated list of agencies.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Form,
  InputGroup,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Pagination } from '@/shared/components/Pagination';

import { AgencyStatusBadge } from './AgencyStatusBadge';
import { AgencyVerifiedBadge } from './AgencyVerifiedBadge';
import { AgencyActions } from './AgencyActions';
import { useGetAgenciesQuery, useGetAgencyStatisticsQuery } from '../agenciesApi';
import type { Agency, AgencyStatus, AgencyFilters } from '../agencies.types';

interface AgencyListProps {
  onEdit?: (agency: Agency) => void;
}

const ITEMS_PER_PAGE = 10;

export const AgencyList: React.FC<AgencyListProps> = ({ onEdit }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Local state for filters and pagination
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AgencyFilters>({
    search: '',
    status: '',
    canton_id: '',
    city_id: '',
    is_verified: '',
  });

  // Build query params
  const queryParams = useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.canton_id && { canton_id: filters.canton_id }),
      ...(filters.is_verified !== '' && { is_verified: filters.is_verified }),
      include_inactive: true,
    }),
    [page, filters]
  );

  // Fetch data
  const {
    data: agenciesData,
    isLoading,
    isError,
    refetch,
  } = useGetAgenciesQuery(queryParams);

  const { data: statsData } = useGetAgencyStatisticsQuery();

  // API returns data as array directly and meta for pagination
  const agencies = agenciesData?.data || [];
  const pagination = agenciesData?.meta ? {
    page: agenciesData.meta.page,
    limit: agenciesData.meta.limit,
    total: agenciesData.meta.total,
    totalPages: agenciesData.meta.totalPages,
  } : undefined;
  const stats = statsData?.data;

  // Handlers
  const handleFilterChange = useCallback(
    (key: keyof AgencyFilters, value: string | boolean) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilterChange('search', e.target.value);
    },
    [handleFilterChange]
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      handleFilterChange('status', e.target.value as AgencyStatus | '');
    },
    [handleFilterChange]
  );

  const handleVerifiedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      handleFilterChange(
        'is_verified',
        value === '' ? '' : value === 'true'
      );
    },
    [handleFilterChange]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      canton_id: '',
      city_id: '',
      is_verified: '',
    });
    setPage(1);
  }, []);

  // Helper to get localized name
  const getLocalizedName = (
    name: string | { en?: string; fr?: string; de?: string; it?: string } | undefined
  ): string => {
    if (!name) return '-';
    if (typeof name === 'string') return name;
    return name[currentLanguage as keyof typeof name] || name.en || '-';
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Alert variant="danger">
        <Alert.Heading>{t('common.error')}</Alert.Heading>
        <p>{t('agencies.errors.loadFailed')}</p>
        <Button variant="outline-danger" onClick={() => refetch()}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          {t('common.actions.retry')}
        </Button>
      </Alert>
    );
  }

  return (
    <div className="agency-list">
      {/* Statistics Cards */}
      {stats && (
        <Row className="mb-4 g-3">
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">{t('agencies.stats.total')}</div>
                <div className="fs-3 fw-bold text-primary">{stats.total}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">{t('agencies.stats.active')}</div>
                <div className="fs-3 fw-bold text-success">{stats.by_status.active}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">{t('agencies.stats.verified')}</div>
                <div className="fs-3 fw-bold text-info">{stats.verified}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">{t('agencies.stats.totalProperties')}</div>
                <div className="fs-3 fw-bold text-secondary">{stats.total_properties}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={t('agencies.searchPlaceholder')}
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </Col>
            <Col xs={6} md={2}>
              <Form.Select value={filters.status} onChange={handleStatusChange}>
                <option value="">{t('agencies.allStatuses')}</option>
                <option value="active">{t('agencies.status.active')}</option>
                <option value="pending">{t('agencies.status.pending')}</option>
                <option value="suspended">{t('agencies.status.suspended')}</option>
                <option value="inactive">{t('agencies.status.inactive')}</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={2}>
              <Form.Select
                value={filters.is_verified === '' ? '' : String(filters.is_verified)}
                onChange={handleVerifiedChange}
              >
                <option value="">{t('agencies.allVerification')}</option>
                <option value="true">{t('agencies.verified')}</option>
                <option value="false">{t('agencies.unverified')}</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={2}>
              <Button
                variant="outline-secondary"
                onClick={handleClearFilters}
                className="w-100"
              >
                <i className="bi bi-x-lg me-2"></i>
                {t('common.actions.clearFilters')}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Agencies Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {agencies.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-building fs-1 text-muted"></i>
              <p className="text-muted mt-3">{t('agencies.noResults')}</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>{t('agencies.fields.name')}</th>
                  <th>{t('agencies.fields.location')}</th>
                  <th>{t('agencies.fields.contact')}</th>
                  <th className="text-center">{t('agencies.fields.properties')}</th>
                  <th className="text-center">{t('agencies.fields.status')}</th>
                  <th className="text-center">{t('agencies.fields.verified')}</th>
                  <th className="text-end">{t('common.actions.title')}</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => (
                  <tr key={agency.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {agency.logo_url ? (
                          <img
                            src={agency.logo_url}
                            alt={agency.name}
                            className="rounded me-3"
                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded me-3 bg-light d-flex align-items-center justify-content-center"
                            style={{ width: 40, height: 40 }}
                          >
                            <i className="bi bi-building text-muted"></i>
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/agencies/${agency.id}`}
                            className="fw-semibold text-decoration-none"
                          >
                            {agency.name}
                          </Link>
                          {agency.website && (
                            <div className="small text-muted text-truncate" style={{ maxWidth: 200 }}>
                              {agency.website}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        <div>{agency.address}</div>
                        <div className="text-muted">
                          {agency.postal_code} {agency.city ? getLocalizedName(agency.city.name) : ''}
                          {agency.canton && ` (${agency.canton.code})`}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {agency.contact_person && <div>{agency.contact_person}</div>}
                        {agency.phone && (
                          <div className="text-muted">
                            <i className="bi bi-telephone me-1"></i>
                            {agency.phone}
                          </div>
                        )}
                        {agency.email && (
                          <div className="text-muted">
                            <i className="bi bi-envelope me-1"></i>
                            {agency.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-primary">{agency.total_properties}</span>
                    </td>
                    <td className="text-center">
                      <AgencyStatusBadge status={agency.status} size="sm" />
                    </td>
                    <td className="text-center">
                      <AgencyVerifiedBadge
                        isVerified={agency.is_verified}
                        verificationDate={agency.verification_date}
                      />
                    </td>
                    <td className="text-end">
                      <AgencyActions
                        agency={agency}
                        onEdit={onEdit ? () => onEdit(agency) : undefined}
                        variant="dropdown"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card.Footer className="bg-white border-top">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {t('common.pagination.showing', {
                  start: (page - 1) * ITEMS_PER_PAGE + 1,
                  end: Math.min(page * ITEMS_PER_PAGE, pagination.total),
                  total: pagination.total,
                })}
              </small>
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default AgencyList;
