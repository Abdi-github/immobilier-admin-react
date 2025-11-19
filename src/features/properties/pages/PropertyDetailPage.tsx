import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetPropertyQuery } from '../propertiesApi';
import { PropertyDetails } from '../components/PropertyDetails';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

export function PropertyDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useGetPropertyQuery(id!, {
    skip: !id,
  });

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (error || !data?.data) {
    return (
      <ErrorAlert
        title={t('properties.errors.notFound')}
        message={t('properties.errors.notFoundMessage')}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="property-detail-page">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard">{t('nav.dashboard')}</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/properties">{t('nav.properties')}</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {data.data.external_id}
          </li>
        </ol>
      </nav>

      {/* Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/properties" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-2" />
          {t('common.back')}
        </Link>
        <Link to={`/properties/${id}/edit`} className="btn btn-outline-primary btn-sm">
          <i className="bi bi-pencil me-2" />
          {t('common.edit')}
        </Link>
      </div>

      <PropertyDetails property={data.data} onRefresh={refetch} />
    </div>
  );
}
