/**
 * Amenity List Component
 */

import { useState } from 'react';
import { Table, Card, Button, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetAmenitiesQuery } from '../amenitiesApi';
import { Amenity, AmenityGroup, AMENITY_GROUPS } from '../amenities.types';
import { AmenityStatusBadge } from './AmenityStatusBadge';
import { AmenityGroupBadge } from './AmenityGroupBadge';
import { Pagination } from '@/shared/components/Pagination';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface AmenityListProps {
  onEdit: (amenity: Amenity) => void;
  onDelete: (amenity: Amenity) => void;
}

export function AmenityList({ onEdit, onDelete }: AmenityListProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<AmenityGroup | ''>('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  // Query
  const { data, isLoading, isFetching, error } = useGetAmenitiesQuery({
    page,
    limit,
    search: search || undefined,
    group: group || undefined,
    is_active: isActive,
    sort: 'sort_order',
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setGroup('');
    setIsActive(undefined);
    setPage(1);
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        {t('common.error')}: {t('amenities.fetchError')}
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white py-3">
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Label className="small text-muted mb-1">{t('common.search')}</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder={t('amenities.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="outline-secondary" type="submit">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="small text-muted mb-1">{t('amenities.group')}</Form.Label>
              <Form.Select
                value={group}
                onChange={(e) => {
                  setGroup(e.target.value as AmenityGroup | '');
                  setPage(1);
                }}
              >
                <option value="">{t('common.all')}</option>
                {AMENITY_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {t(`amenities.groups.${g}`)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small text-muted mb-1">{t('common.status')}</Form.Label>
              <Form.Select
                value={isActive === undefined ? '' : isActive.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setIsActive(value === '' ? undefined : value === 'true');
                  setPage(1);
                }}
              >
                <option value="">{t('common.all')}</option>
                <option value="true">{t('common.active')}</option>
                <option value="false">{t('common.inactive')}</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleClearFilters} className="flex-grow-1">
                <i className="bi bi-x-circle me-1"></i>
                {t('common.clear')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Header>

      <Card.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>{t('amenities.name')}</th>
                  <th>{t('amenities.group')}</th>
                  <th>{t('amenities.icon')}</th>
                  <th className="text-center">{t('amenities.sortOrder')}</th>
                  <th className="text-center">{t('common.status')}</th>
                  <th className="text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      {t('amenities.noResults')}
                    </td>
                  </tr>
                ) : (
                  data?.data.map((amenity: Amenity) => (
                    <tr key={amenity.id} className={isFetching ? 'opacity-50' : ''}>
                      <td>
                        <div className="fw-semibold">
                          {getLocalizedName(amenity.name, currentLanguage)}
                        </div>
                      </td>
                      <td>
                        <AmenityGroupBadge group={amenity.group} />
                      </td>
                      <td>
                        {amenity.icon && (
                          <span className="text-muted">
                            <i className={`bi bi-${amenity.icon}`}></i> {amenity.icon}
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark">{amenity.sort_order}</span>
                      </td>
                      <td className="text-center">
                        <AmenityStatusBadge isActive={amenity.is_active} />
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => onEdit(amenity)}
                          title={t('common.edit')}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDelete(amenity)}
                          title={t('common.delete')}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {data?.meta && data.meta.totalPages > 1 && (
        <Card.Footer className="bg-white">
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </Card.Footer>
      )}
    </Card>
  );
}
