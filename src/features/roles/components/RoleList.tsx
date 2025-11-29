/**
 * Role List Component
 *
 * Displays a paginated, filterable list of roles.
 */

import { useState } from 'react';
import { Table, Card, Button, Form, InputGroup, Spinner, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGetRolesQuery, useDeleteRoleMutation } from '../rolesApi';
import { RoleStatusBadge } from './RoleStatusBadge';
import { RoleSystemBadge } from './RoleSystemBadge';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { Role, RoleFilters, MultilingualText } from '../roles.types';

interface RoleListProps {
  onEdit?: (role: Role) => void;
}

export function RoleList({ onEdit }: RoleListProps) {
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions();
  const currentLang = i18n.language as keyof MultilingualText;

  // Filters state
  const [filters, setFilters] = useState<RoleFilters>({
    search: '',
    is_system: '',
    is_active: '',
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build query params
  const queryParams = {
    page,
    limit,
    search: filters.search || undefined,
    is_system: filters.is_system !== '' ? filters.is_system : undefined,
    is_active: filters.is_active !== '' ? filters.is_active : undefined,
    include_permissions: true,
  };

  // API queries
  const { data, isLoading, isFetching } = useGetRolesQuery(queryParams);
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  // For nested response structure: data.data.data (array) and data.data.pagination
  const roles = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  // Get localized text
  const getLocalizedText = (text: MultilingualText | undefined): string => {
    if (!text) return '';
    return text[currentLang] || text.en || '';
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof RoleFilters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.id).unwrap();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  // Get permission count
  const getPermissionCount = (role: Role): number => {
    if (Array.isArray(role.permissions)) {
      return role.permissions.length;
    }
    return 0;
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t('roles.list')}</h5>
          {hasPermission('roles:create') && (
            <Button variant="primary" size="sm" onClick={() => onEdit?.({} as Role)}>
              <i className="bi bi-plus-circle me-2" />
              {t('roles.create')}
            </Button>
          )}
        </Card.Header>

        <Card.Body>
          {/* Filters */}
          <Row className="mb-3 g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search" />
                </InputGroup.Text>
                <Form.Control
                  placeholder={t('common.search')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={String(filters.is_system)}
                onChange={(e) =>
                  handleFilterChange(
                    'is_system',
                    e.target.value === '' ? '' : e.target.value === 'true'
                  )
                }
              >
                <option value="">{t('roles.allTypes')}</option>
                <option value="true">{t('roles.systemOnly')}</option>
                <option value="false">{t('roles.customOnly')}</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={String(filters.is_active)}
                onChange={(e) =>
                  handleFilterChange(
                    'is_active',
                    e.target.value === '' ? '' : e.target.value === 'true'
                  )
                }
              >
                <option value="">{t('common.allStatuses')}</option>
                <option value="true">{t('common.active')}</option>
                <option value="false">{t('common.inactive')}</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">{t('common.loading')}</span>
              </Spinner>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-5 text-muted">{t('roles.noRolesFound')}</div>
          ) : (
            <>
              <Table striped hover responsive className={isFetching ? 'opacity-50' : ''}>
                <thead>
                  <tr>
                    <th>{t('roles.name')}</th>
                    <th>{t('roles.displayName')}</th>
                    <th>{t('roles.permissions')}</th>
                    <th>{t('roles.type')}</th>
                    <th>{t('common.status')}</th>
                    <th className="text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        <code>{role.name}</code>
                      </td>
                      <td>{getLocalizedText(role.display_name)}</td>
                      <td>
                        <span className="badge bg-secondary">{getPermissionCount(role)}</span>
                      </td>
                      <td>
                        <RoleSystemBadge isSystem={role.is_system} />
                        {!role.is_system && (
                          <span className="text-muted">{t('roles.customRole')}</span>
                        )}
                      </td>
                      <td>
                        <RoleStatusBadge isActive={role.is_active} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/roles/${role.id}`}
                            className="btn btn-outline-primary"
                            title={t('common.view')}
                          >
                            <i className="bi bi-eye" />
                          </Link>
                          {hasPermission('roles:update') && (
                            <Button
                              variant="outline-secondary"
                              onClick={() => onEdit?.(role)}
                              title={t('common.edit')}
                            >
                              <i className="bi bi-pencil" />
                            </Button>
                          )}
                          {hasPermission('roles:delete') && !role.is_system && (
                            <Button
                              variant="outline-danger"
                              onClick={() => setDeleteTarget(role)}
                              title={t('common.delete')}
                            >
                              <i className="bi bi-trash" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    {t('common.showingOf', {
                      showing: roles.length,
                      total: pagination.total,
                    })}
                  </small>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => p - 1)}
                          disabled={!pagination.hasPrevPage}
                        >
                          {t('common.previous')}
                        </button>
                      </li>
                      {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={!pagination.hasNextPage}
                        >
                          {t('common.next')}
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={!!deleteTarget}
        title={t('roles.deleteRole')}
        message={t('roles.confirmDelete', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
