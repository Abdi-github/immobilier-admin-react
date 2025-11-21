/**
 * Canton List Component
 */

import { useState } from 'react';
import { Table, Card, Button, Form, Row, Col, Spinner, InputGroup, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Search, PlusCircle, PencilSquare, Trash, GeoAlt } from 'react-bootstrap-icons';
import { useGetCantonsQuery } from '../locationsApi';
import { Canton } from '../locations.types';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface CantonListProps {
  onEdit: (canton: Canton) => void;
  onDelete: (canton: Canton) => void;
  onViewCities: (canton: Canton) => void;
}

export function CantonList({ onEdit, onDelete, onViewCities }: CantonListProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  // Query
  const { data, isLoading, isFetching, error } = useGetCantonsQuery({
    page,
    limit,
    search: search || undefined,
    is_active: isActive,
    sort: 'code',
  });

  const cantons = data?.data || [];
  const pagination = data?.meta;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setIsActive(undefined);
    setPage(1);
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        {t('common.error')}: {t('locations.cantons.fetchError')}
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white py-3">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">
              <GeoAlt className="me-2" />
              {t('locations.cantons.title')}
            </h5>
          </Col>
          <Col xs="auto">
            <Button variant="primary" size="sm" onClick={() => onEdit({} as Canton)}>
              <PlusCircle className="me-1" />
              {t('locations.cantons.add')}
            </Button>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Filters */}
        <Form onSubmit={handleSearchSubmit} className="mb-4">
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={t('locations.cantons.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
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
            <Col md={4} className="d-flex gap-2">
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
                  <th>{t('locations.cantons.code')}</th>
                  <th>{t('locations.cantons.name')}</th>
                  <th>{t('common.status')}</th>
                  <th className="text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {cantons.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      {t('locations.cantons.noResults')}
                    </td>
                  </tr>
                ) : (
                  cantons.map((canton) => (
                    <tr key={canton.id}>
                      <td>
                        <Badge bg="secondary" className="fw-bold">
                          {canton.code}
                        </Badge>
                      </td>
                      <td>{getLocalizedName(canton.name, currentLanguage)}</td>
                      <td>
                        <Badge bg={canton.is_active ? 'success' : 'secondary'}>
                          {canton.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => onViewCities(canton)}
                          title={t('locations.cantons.viewCities')}
                        >
                          <GeoAlt />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => onEdit(canton)}
                          title={t('common.edit')}
                        >
                          <PencilSquare />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDelete(canton)}
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
                count: cantons.length,
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
