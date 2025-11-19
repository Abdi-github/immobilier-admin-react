import { useState } from 'react';
import { Table, Form, Button, Dropdown, Pagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Property, PropertyStatus, TransactionType } from '../properties.types';
import { StatusBadge } from './StatusBadge';
import { ApprovalActions } from './ApprovalActions';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDeletePropertyMutation } from '../propertiesApi';
import { useToast } from '@/shared/hooks/useToast';

interface PropertyListProps {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: PropertyStatus | '') => void;
  onTransactionFilter: (type: TransactionType | '') => void;
  selectedStatus: PropertyStatus | '';
  selectedTransaction: TransactionType | '';
  onRefresh: () => void;
}

export function PropertyList({
  properties,
  pagination,
  isLoading,
  onPageChange,
  onStatusFilter,
  onTransactionFilter,
  selectedStatus,
  selectedTransaction,
  onRefresh,
}: PropertyListProps) {
  const { t, i18n } = useTranslation();
  const { success: showSuccess, error: showError } = useToast();
  const [deleteProperty] = useDeletePropertyMutation();
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(properties.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProperty(deleteTarget.id).unwrap();
      showSuccess(t('properties.messages.deleted'));
      setDeleteTarget(null);
      onRefresh();
    } catch (error) {
      const apiError = error as { data?: { error?: { message?: string } } };
      showError(apiError.data?.error?.message || t('properties.errors.deleteFailed'));
    }
  };

  const getPropertyTitle = (property: Property): string => {
    // First, try root-level title (from current language translation)
    if (property.title) return property.title;
    // Fallback to translation object
    if (property.translation?.title) return property.translation.title;
    // Legacy fallback to translations array
    const translation = property.translations?.find((t) => t.language === i18n.language);
    return translation?.title || property.translations?.[0]?.title || property.address;
  };

  const getMultilingualName = (name: string | Record<string, string> | undefined): string => {
    if (!name) return '-';
    if (typeof name === 'string') return name;
    const lang = i18n.language as keyof typeof name;
    return name[lang] || name.en || name.fr || Object.values(name)[0] || '-';
  };

  const statusOptions: (PropertyStatus | '')[] = [
    '',
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'PUBLISHED',
    'ARCHIVED',
  ];

  const transactionOptions: (TransactionType | '')[] = ['', 'rent', 'buy'];

  const renderPagination = () => {
    const items = [];
    const maxVisible = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    items.push(
      <Pagination.First key="first" onClick={() => onPageChange(1)} disabled={pagination.page === 1} />
    );
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
      />
    );

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === pagination.page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => onPageChange(pagination.totalPages)}
        disabled={pagination.page === pagination.totalPages}
      />
    );

    return <Pagination className="mb-0">{items}</Pagination>;
  };

  return (
    <div className="property-list">
      {/* Filters */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Form.Select
          style={{ width: '200px' }}
          value={selectedStatus}
          onChange={(e) => onStatusFilter(e.target.value as PropertyStatus | '')}
        >
          <option value="">{t('properties.filters.allStatuses')}</option>
          {statusOptions.slice(1).map((status) => (
            <option key={status} value={status}>
              {t(`properties.status.${status.toLowerCase()}`)}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          style={{ width: '200px' }}
          value={selectedTransaction}
          onChange={(e) => onTransactionFilter(e.target.value as TransactionType | '')}
        >
          <option value="">{t('properties.filters.allTransactions')}</option>
          {transactionOptions.slice(1).map((type) => (
            <option key={type} value={type}>
              {t(`properties.transactionType.${type}`)}
            </option>
          ))}
        </Form.Select>

        <Button variant="outline-secondary" onClick={onRefresh}>
          <i className="bi bi-arrow-clockwise me-1" />
          {t('common.buttons.refresh')}
        </Button>

        {selectedIds.size > 0 && (
          <span className="text-muted align-self-center">
            {t('properties.selectedCount', { count: selectedIds.size })}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <Table hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: '40px' }}>
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.size === properties.length && properties.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>{t('properties.columns.title')}</th>
              <th>{t('properties.columns.type')}</th>
              <th>{t('properties.columns.price')}</th>
              <th>{t('properties.columns.location')}</th>
              <th>{t('properties.columns.status')}</th>
              <th>{t('properties.columns.date')}</th>
              <th style={{ width: '200px' }}>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t('common.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-muted">
                  {t('properties.noResults')}
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedIds.has(property.id)}
                      onChange={(e) => handleSelectOne(property.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <div>
                      <Link
                        to={`/properties/${property.id}`}
                        className="fw-medium text-decoration-none"
                      >
                        {getPropertyTitle(property)}
                      </Link>
                      <small className="d-block text-muted">
                        {property.external_id}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${property.transaction_type === 'rent' ? 'bg-info' : 'bg-primary'}`}
                    >
                      {t(`properties.transactionType.${property.transaction_type}`)}
                    </span>
                  </td>
                  <td>{formatCurrency(property.price, property.currency)}</td>
                  <td>
                    <div>
                      <span>{getMultilingualName(property.city?.name)}</span>
                      <small className="d-block text-muted">
                        {property.canton?.code || getMultilingualName(property.canton?.name)}
                      </small>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={property.status} size="sm" />
                  </td>
                  <td>
                    <small className="text-muted">
                      {formatDate(property.created_at)}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-1 align-items-center">
                      <ApprovalActions property={property} onSuccess={onRefresh} />
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="link"
                          size="sm"
                          className="text-muted p-1"
                        >
                          <i className="bi bi-three-dots-vertical" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item as={Link} to={`/properties/${property.id}`}>
                            <i className="bi bi-eye me-2" />
                            {t('common.view')}
                          </Dropdown.Item>
                          <Dropdown.Item as={Link} to={`/properties/${property.id}/edit`}>
                            <i className="bi bi-pencil me-2" />
                            {t('common.edit')}
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => setDeleteTarget(property)}
                          >
                            <i className="bi bi-trash me-2" />
                            {t('common.delete')}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            {t('common.pagination.showing', {
              from: (pagination.page - 1) * pagination.limit + 1,
              to: Math.min(pagination.page * pagination.limit, pagination.total),
              total: pagination.total,
            })}
          </small>
          {renderPagination()}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={!!deleteTarget}
        title={t('properties.deleteModal.title')}
        message={t('properties.deleteModal.message', {
          title: deleteTarget ? getPropertyTitle(deleteTarget) : '',
        })}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
