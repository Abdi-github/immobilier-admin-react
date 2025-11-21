import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/shared/components/PageHeader';

import { UserList, UserFormModal } from '../components';
import { useGetUserStatisticsQuery } from '../usersApi';

export const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch user statistics
  const { data: statsData, isLoading: isLoadingStats } = useGetUserStatisticsQuery();

  const statistics = statsData?.data;

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <PageHeader
        title={t('users.title')}
        subtitle={t('users.subtitle')}
        actions={
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {t('users.actions.create')}
          </Button>
        }
      />

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i className="bi bi-people text-primary fs-4"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">{t('users.statistics.totalUsers')}</h6>
                <h3 className="mb-0">
                  {isLoadingStats ? (
                    <span className="placeholder col-6"></span>
                  ) : (
                    statistics?.total || 0
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i className="bi bi-check-circle text-success fs-4"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">{t('users.statistics.activeUsers')}</h6>
                <h3 className="mb-0 text-success">
                  {isLoadingStats ? (
                    <span className="placeholder col-6"></span>
                  ) : (
                    statistics?.by_status?.active || 0
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i className="bi bi-hourglass-split text-warning fs-4"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">{t('users.statistics.pendingUsers')}</h6>
                <h3 className="mb-0 text-warning">
                  {isLoadingStats ? (
                    <span className="placeholder col-6"></span>
                  ) : (
                    statistics?.by_status?.pending || 0
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="rounded-circle bg-danger bg-opacity-10 p-3 me-3">
                <i className="bi bi-x-circle text-danger fs-4"></i>
              </div>
              <div>
                <h6 className="text-muted mb-1">{t('users.statistics.suspendedUsers')}</h6>
                <h3 className="mb-0 text-danger">
                  {isLoadingStats ? (
                    <span className="placeholder col-6"></span>
                  ) : (
                    statistics?.by_status?.suspended || 0
                  )}
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Type Distribution */}
      {statistics?.by_type && Object.keys(statistics.by_type).length > 0 && (
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-3">{t('users.statistics.byType')}</h6>
                <div className="d-flex flex-wrap gap-3">
                  {Object.entries(statistics.by_type).map(([type, count]) => (
                    <Badge
                      key={type}
                      bg="light"
                      text="dark"
                      className="d-flex align-items-center gap-2 p-2 px-3"
                    >
                      <span>{t(`users.types.${type}`)}</span>
                      <Badge bg="primary" pill>{count as number}</Badge>
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* User List */}
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <UserList />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create User Modal */}
      <UserFormModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />
    </Container>
  );
};

export default UsersPage;
