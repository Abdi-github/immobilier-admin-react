import { Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetPropertiesQuery } from '../propertiesApi';
import { PropertyList } from '../components/PropertyList';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

export function PendingApprovalsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useGetPropertiesQuery({
    status: 'PENDING_APPROVAL',
    limit: 50,
  });

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

  const properties = data?.data || [];
  const pagination = data?.meta || { page: 1, limit: 50, total: 0, totalPages: 1 };

  return (
    <div className="pending-approvals-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">{t('properties.pendingApprovals.title')}</h1>
          <p className="text-muted mb-0">
            {t('properties.pendingApprovals.subtitle', { count: pagination.total })}
          </p>
        </div>
        <Button variant="outline-secondary" onClick={() => refetch()}>
          <i className="bi bi-arrow-clockwise me-2" />
          {t('common.refresh')}
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-check-circle text-success display-4 mb-3" />
            <h4>{t('properties.pendingApprovals.empty')}</h4>
            <p className="text-muted">{t('properties.pendingApprovals.emptyMessage')}</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <PropertyList
              properties={properties}
              pagination={pagination}
              isLoading={isLoading}
              onPageChange={() => {}}
              onStatusFilter={() => {}}
              onTransactionFilter={() => {}}
              selectedStatus="PENDING_APPROVAL"
              selectedTransaction=""
              onRefresh={refetch}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
