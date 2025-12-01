/**
 * Translation Statistics Cards Component
 */

import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Translate,
  Robot,
  Person
} from 'react-bootstrap-icons';
import { useGetTranslationStatisticsQuery } from '../translationsApi';

export function TranslationStatistics() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetTranslationStatisticsQuery();

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !data?.data) {
    return null;
  }

  const { byStatus, bySource } = data.data;

  const statusCards = [
    {
      label: t('translations.statuses.PENDING', 'Pending'),
      value: byStatus.PENDING || 0,
      icon: Clock,
      color: 'warning',
      bgClass: 'bg-warning bg-opacity-10',
    },
    {
      label: t('translations.statuses.APPROVED', 'Approved'),
      value: byStatus.APPROVED || 0,
      icon: CheckCircle,
      color: 'success',
      bgClass: 'bg-success bg-opacity-10',
    },
    {
      label: t('translations.statuses.REJECTED', 'Rejected'),
      value: byStatus.REJECTED || 0,
      icon: XCircle,
      color: 'danger',
      bgClass: 'bg-danger bg-opacity-10',
    },
  ];

  const sourceCards = [
    {
      label: t('translations.sources.original', 'Original'),
      value: bySource.original || 0,
      icon: Translate,
      color: 'primary',
    },
    {
      label: t('translations.sources.machine', 'Machine (LibreTranslate)'),
      value: bySource.machine || 0,
      icon: Robot,
      color: 'info',
    },
    {
      label: t('translations.sources.human', 'Human'),
      value: bySource.human || 0,
      icon: Person,
      color: 'secondary',
    },
  ];

  const totalTranslations = Object.values(byStatus).reduce(
    (acc, count) => acc + (count || 0),
    0
  );

  return (
    <div className="mb-4">
      {/* Status Statistics */}
      <Row className="g-3 mb-3">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Col key={card.label} xs={12} sm={6} md={4}>
              <Card className={`h-100 border-0 shadow-sm ${card.bgClass}`}>
                <Card.Body className="d-flex align-items-center">
                  <div className={`rounded-circle p-3 bg-${card.color} bg-opacity-25 me-3`}>
                    <Icon size={24} className={`text-${card.color}`} />
                  </div>
                  <div>
                    <h3 className="mb-0 fw-bold">{card.value.toLocaleString()}</h3>
                    <p className="mb-0 text-muted small">{card.label}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Source Statistics */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-semibold">
              {t('translations.bySource', 'By Source')}
            </h6>
            <span className="text-muted small">
              {t('translations.totalTranslations', 'Total: {{count}}', {
                count: totalTranslations,
              })}
            </span>
          </div>
          <Row className="g-2">
            {sourceCards.map((card) => {
              const Icon = card.icon;
              const percentage = totalTranslations > 0
                ? ((card.value / totalTranslations) * 100).toFixed(1)
                : 0;
              
              return (
                <Col key={card.label} xs={12} md={4}>
                  <div className="d-flex align-items-center p-2 rounded bg-light">
                    <Icon size={18} className={`text-${card.color} me-2`} />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small">{card.label}</span>
                        <span className="fw-semibold">{card.value}</span>
                      </div>
                      <div 
                        className="progress mt-1" 
                        style={{ height: '4px' }}
                      >
                        <div
                          className={`progress-bar bg-${card.color}`}
                          style={{ width: `${percentage}%` }}
                          role="progressbar"
                          aria-valuenow={Number(percentage)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}
