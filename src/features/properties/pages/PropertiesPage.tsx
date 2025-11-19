import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetPropertiesQuery } from '../propertiesApi';
import { PropertyList } from '../components/PropertyList';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import type { PropertyStatus, TransactionType } from '../properties.types';

export function PropertiesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | ''>('');
  const [transactionFilter, setTransactionFilter] = useState<TransactionType | ''>('');

  const { data, isLoading, error, refetch } = useGetPropertiesQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
    transaction_type: transactionFilter || undefined,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusFilter = (status: PropertyStatus | '') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleTransactionFilter = (type: TransactionType | '') => {
    setTransactionFilter(type);
    setPage(1);
  };

  if (isLoading && !data) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <ErrorAlert
        title={t('properties.errors.loadFailed')}
        message={t('common.errors.tryAgain')}
        onRetry={refetch}
      />
    );
  }

  // Transform meta to pagination format expected by PropertyList
  const pagination = data?.meta ? {
    page: data.meta.page,
    limit: data.meta.limit,
    total: data.meta.total,
    totalPages: data.meta.totalPages,
  } : { page: 1, limit: 20, total: 0, totalPages: 1 };

  return (
    <div className="properties-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">{t('properties.title')}</h1>
          <p className="text-muted mb-0">
            {t('properties.subtitle', { total: data?.meta?.total || 0 })}
          </p>
        </div>
        <Link to="/properties/create" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2" />
          {t('properties.actions.create')}
        </Link>
      </div>

      <Card>
        <Card.Body>
          {data?.data && (
            <PropertyList
              properties={data.data}
              pagination={pagination}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              onStatusFilter={handleStatusFilter}
              onTransactionFilter={handleTransactionFilter}
              selectedStatus={statusFilter}
              selectedTransaction={transactionFilter}
              onRefresh={refetch}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
