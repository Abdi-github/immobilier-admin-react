/**
 * Category List Component
 */

import { useState } from 'react';
import { Table, Card, Button, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesQuery } from '../categoriesApi';
import { Category, CategorySection, CATEGORY_SECTIONS } from '../categories.types';
import { CategoryStatusBadge } from './CategoryStatusBadge';
import { CategorySectionBadge } from './CategorySectionBadge';
import { Pagination } from '@/shared/components/Pagination';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface CategoryListProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ onEdit, onDelete }: CategoryListProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState<CategorySection | ''>('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  // Query
  const { data, isLoading, isFetching, error } = useGetCategoriesQuery({
    page,
    limit,
    search: search || undefined,
    section: section || undefined,
    is_active: isActive,
    sort: 'sort_order',
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSection('');
    setIsActive(undefined);
    setPage(1);
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        {t('common.error')}: {t('categories.fetchError')}
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
                  placeholder={t('categories.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="outline-secondary" type="submit">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="small text-muted mb-1">{t('categories.section')}</Form.Label>
              <Form.Select
                value={section}
                onChange={(e) => {
                  setSection(e.target.value as CategorySection | '');
                  setPage(1);
                }}
              >
                <option value="">{t('common.all')}</option>
                {CATEGORY_SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {t(`categories.sections.${s}`)}
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
                  <th>{t('categories.name')}</th>
                  <th>{t('categories.slug')}</th>
                  <th>{t('categories.section')}</th>
                  <th>{t('categories.icon')}</th>
                  <th className="text-center">{t('categories.sortOrder')}</th>
                  <th className="text-center">{t('common.status')}</th>
                  <th className="text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      {t('categories.noResults')}
                    </td>
                  </tr>
                ) : (
                  data?.data.map((category: Category) => (
                    <tr key={category.id} className={isFetching ? 'opacity-50' : ''}>
                      <td>
                        <div className="fw-semibold">
                          {getLocalizedName(category.name, currentLanguage)}
                        </div>
                      </td>
                      <td>
                        <code className="text-muted">{category.slug}</code>
                      </td>
                      <td>
                        <CategorySectionBadge section={category.section} />
                      </td>
                      <td>
                        {category.icon && (
                          <span className="text-muted">
                            <i className={`bi bi-${category.icon}`}></i> {category.icon}
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark">{category.sort_order}</span>
                      </td>
                      <td className="text-center">
                        <CategoryStatusBadge isActive={category.is_active} />
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          onClick={() => onEdit(category)}
                          title={t('common.edit')}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDelete(category)}
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
