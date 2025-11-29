import { Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { StatsCard } from '../components/StatsCard';
import { formatNumber } from '@/shared/utils/formatters';

// Mock data for now - will be replaced with API call
const mockStats = {
  totalProperties: 1234,
  pendingApproval: 45,
  activeAgencies: 89,
  totalUsers: 5678,
};

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);

  // TODO: Replace with useGetDashboardStatsQuery when API is ready
  const stats = mockStats;

  return (
    <div className="dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">{t('dashboard.title')}</h1>
          <p className="text-muted mb-0">
            {t('dashboard.welcome')}, {user?.first_name}!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <StatsCard
            title={t('dashboard.stats.totalProperties')}
            value={formatNumber(stats.totalProperties)}
            icon="bi-building"
            variant="primary"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatsCard
            title={t('dashboard.stats.pendingApproval')}
            value={formatNumber(stats.pendingApproval)}
            icon="bi-clock-history"
            variant="warning"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatsCard
            title={t('dashboard.stats.activeAgencies')}
            value={formatNumber(stats.activeAgencies)}
            icon="bi-buildings"
            variant="success"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatsCard
            title={t('dashboard.stats.totalUsers')}
            value={formatNumber(stats.totalUsers)}
            icon="bi-people"
            variant="info"
          />
        </Col>
      </Row>

      {/* Quick Actions & Recent Activity */}
      <Row className="g-4">
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <a href="/properties" className="btn btn-outline-primary">
                  <i className="bi bi-building me-2" />
                  View Properties
                </a>
                <a href="/properties?status=PENDING_APPROVAL" className="btn btn-outline-warning">
                  <i className="bi bi-clock-history me-2" />
                  Review Pending ({stats.pendingApproval})
                </a>
                <a href="/translations" className="btn btn-outline-info">
                  <i className="bi bi-translate me-2" />
                  Manage Translations
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted text-center py-4">
                Activity feed will be displayed here
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
