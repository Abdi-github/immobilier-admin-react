/**
 * Permission List Component
 *
 * Displays a paginated, filterable list of permissions.
 */

import { useState } from 'react';
import { Table, Card, Button, Form, InputGroup, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetPermissionsQuery, useDeletePermissionMutation, useGetPermissionResourcesQuery } from '../rolesApi';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PERMISSION_ACTIONS } from '../roles.types';
import type { Permission, PermissionFilters, PermissionAction, MultilingualText } from '../roles.types';

interface PermissionListProps {
  onEdit?: (permission: Permission) => void;
}

export function PermissionList({ onEdit }: PermissionListProps) {
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions();
  const currentLang = i18n.language as keyof MultilingualText;

  // Filters state
  const [filters, setFilters] = useState<PermissionFilters>({
    search: '',
    resource: '',
    action: '',
    is_active: '',
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 15;

  // Build query params
  const queryParams = {
    page,
    limit,
    search: filters.search || undefined,
    resource: filters.resource || undefined,
    action: filters.action || undefined,
    is_active: filters.is_active !== '' ? filters.is_active : undefined,
  };

  // API queries
  const { data, isLoading, isFetching } = useGetPermissionsQuery(queryParams);
  const { data: resourcesData } = useGetPermissionResourcesQuery();
  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation();

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);

  // For nested response structure: data.data.data (array) and data.data.pagination
  const permissions = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const resources = resourcesData?.data || [];

  // Get localized text
  const getLocalizedText = (text: MultilingualText | undefined): string => {
    if (!text) return '';
    return text[currentLang] || text.en || '';
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof PermissionFilters, value: string | boolean | PermissionAction) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePermission(deleteTarget.id).unwrap();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete permission:', error);
    }
  };

  // Action badge color mapping
  const getActionColor = (action: PermissionAction): string => {
    const colors: Record<PermissionAction, string> = {
      create: 'success',
      read: 'info',
      update: 'warning',
      delete: 'danger',
      manage: 'primary',
      approve: 'info',
      reject: 'danger',
      publish: 'success',
      archive: 'secondary',
    };
    return colors[action] || 'secondary';
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{t('permissions.list')}</h5>
          {hasPermission('permissions:create') && (
            <Button variant="primary" size="sm" onClick={() => onEdit?.({} as Permission)}>
              <i className="bi bi-plus-circle me-2" />
              {t('permissions.create')}
            </Button>
          )}
        </Card.Header>

        <Card.Body>
          {/* Filters */}
          <Row className="mb-3 g-3">
            <Col md={3}>
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
                value={filters.resource}
                onChange={(e) => handleFilterChange('resource', e.target.value)}
              >
                <option value="">{t('permissions.allResources')}</option>
                {resources.map((resource: string) => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value as PermissionAction | '')}
              >
                <option value="">{t('permissions.allActions')}</option>
                {PERMISSION_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
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
          ) : permissions.length === 0 ? (
            <div className="text-center py-5 text-muted">{t('permissions.noPermissionsFound')}</div>
          ) : (
            <>
              <Table striped hover responsive className={isFetching ? 'opacity-50' : ''}>
                <thead>
                  <tr>
                    <th>{t('permissions.name')}</th>
                    <th>{t('permissions.resource')}</th>
                    <th>{t('permissions.action')}</th>
                    <th>{t('permissions.displayName')}</th>
                    <th>{t('common.status')}</th>
                    <th className="text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td>
                        <code className="small">{permission.name}</code>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="text-capitalize">
                          {permission.resource}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getActionColor(permission.action)}>{permission.action}</Badge>
                      </td>
                      <td>{getLocalizedText(permission.display_name)}</td>
                      <td>
                        {permission.is_active ? (
                          <span className="text-success">
                            <i className="bi bi-check-circle me-1" />
                            {t('common.active')}
                          </span>
                        ) : (
                          <span className="text-muted">
                            <i className="bi bi-x-circle me-1" />
                            {t('common.inactive')}
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          {hasPermission('permissions:update') && (
                            <Button
                              variant="outline-secondary"
                              onClick={() => onEdit?.(permission)}
                              title={t('common.edit')}
                            >
                              <i className="bi bi-pencil" />
                            </Button>
                          )}
                          {hasPermission('permissions:delete') && (
                            <Button
                              variant="outline-danger"
                              onClick={() => setDeleteTarget(permission)}
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
                      showing: permissions.length,
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
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <li
                            key={pageNum}
                            className={`page-item ${page === pageNum ? 'active' : ''}`}
                          >
                            <button className="page-link" onClick={() => setPage(pageNum)}>
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
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
        title={t('permissions.deletePermission')}
        message={t('permissions.confirmDelete', { name: deleteTarget?.name })}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
