/**
 * City List Component
 */

import { useState } from 'react';
import { Table, Card, Button, Form, Row, Col, Spinner, InputGroup, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Search, PlusCircle, PencilSquare, Trash, Building } from 'react-bootstrap-icons';
import { useGetCitiesQuery, useGetCantonsQuery } from '../locationsApi';
import { City, Canton } from '../locations.types';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface CityListProps {
  cantonFilter?: Canton | null;
  onEdit: (city: City) => void;
  onDelete: (city: City) => void;
  onClearCantonFilter?: () => void;
}

export function CityList({ cantonFilter, onEdit, onDelete, onClearCantonFilter }: CityListProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [selectedCantonId, setSelectedCantonId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  // Get all cantons for filter dropdown
  const { data: cantonsData } = useGetCantonsQuery({ limit: 100 });
  const cantons = cantonsData?.data || [];

  // Determine the canton ID to filter by
  const filterCantonId = cantonFilter?.id || selectedCantonId || undefined;

  // Query cities
  const { data, isLoading, isFetching, error } = useGetCitiesQuery({
    page,
    limit,
    search: search || undefined,
    canton_id: filterCantonId,
    is_active: isActive,
    sort: 'name',
  });

  const cities = data?.data || [];
  const pagination = data?.meta;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCantonId('');
    setIsActive(undefined);
    setPage(1);
    if (onClearCantonFilter) {
      onClearCantonFilter();
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        {t('common.error')}: {t('locations.cities.fetchError')}
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white py-3">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">
              <Building className="me-2" />
              {cantonFilter ? (
                <>
                  {t('locations.cities.title')} - {getLocalizedName(cantonFilter.name, currentLanguage)} ({cantonFilter.code})
                </>
              ) : (
                t('locations.cities.title')
              )}
            </h5>
          </Col>
          <Col xs="auto">
            <Button variant="primary" size="sm" onClick={() => onEdit({} as City)}>
              <PlusCircle className="me-1" />
              {t('locations.cities.add')}
            </Button>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Filters */}
        <Form onSubmit={handleSearchSubmit} className="mb-4">
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={t('locations.cities.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            {!cantonFilter && (
              <Col md={3}>
                <Form.Select
                  value={selectedCantonId}
                  onChange={(e) => {
                    setSelectedCantonId(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">{t('locations.cities.allCantons')}</option>
                  {cantons.map((canton) => (
                    <option key={canton.id} value={canton.id}>
                      {canton.code} - {getLocalizedName(canton.name, currentLanguage)}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
            <Col md={2}>
              <Form.Select
                value={isActive === undefined ? '' : isActive.toString()}
                onChange={(e) =>
                  setIsActive(e.target.value === '' ? undefined : e.target.value === 'true')
                }
              >
                <option value="">{t('common.allStatuses')}</option>
                <option value="true">{t('common.active')}</option>
                <option value="false">{t('common.inactive')}</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button type="submit" variant="outline-primary">
                {t('common.search')}
              </Button>
              <Button variant="outline-secondary" onClick={handleClearFilters}>
                {t('common.clear')}
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Loading indicator */}
        {(isLoading || isFetching) && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>{t('locations.cities.postalCode')}</th>
                  <th>{t('locations.cities.name')}</th>
                  <th>{t('locations.cities.canton')}</th>
                  <th>{t('common.status')}</th>
                  <th className="text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {cities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      {t('locations.cities.noResults')}
                    </td>
                  </tr>
                ) : (
                  cities.map((city) => (
                    <tr key={city.id}>
                      <td>
                        <Badge bg="secondary">{city.postal_code}</Badge>
                      </td>
                      <td>{getLocalizedName(city.name, currentLanguage)}</td>
                      <td>
                        {city.canton ? (
                          <Badge bg="info">
                            {city.canton.code}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <Badge bg={city.is_active ? 'success' : 'secondary'}>
                          {city.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => onEdit(city)}
                          title={t('common.edit')}
                        >
                          <PencilSquare />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDelete(city)}
                          title={t('common.delete')}
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              {t('common.showingOf', {
                count: cities.length,
                total: pagination.total,
              })}
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    {t('common.previous')}
                  </button>
                </li>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    {t('common.next')}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
