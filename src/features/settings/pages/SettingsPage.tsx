/**
 * Settings Page Component
 * 
 * System configuration and preferences.
 * This is a placeholder page - settings functionality will be implemented later.
 */

import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Gear, Palette, Bell, ShieldLock, InfoCircle } from 'react-bootstrap-icons';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SettingsCard({ icon, title, description }: SettingsCardProps) {
  const { t } = useTranslation();
  
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="d-flex flex-column align-items-center text-center p-4">
        <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
          {icon}
        </div>
        <h5 className="mb-2">{title}</h5>
        <p className="text-muted small mb-3">{description}</p>
        <div className="alert alert-info py-2 px-3 mb-0 small">
          <InfoCircle className="me-2" />
          {t('settings.comingSoon')}
        </div>
      </Card.Body>
    </Card>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">
            <Gear className="me-2" />
            {t('settings.pageTitle')}
          </h2>
          <p className="text-muted mb-0">
            {t('settings.pageDescription')}
          </p>
        </Col>
      </Row>

      {/* Settings Tabs */}
      <Tab.Container defaultActiveKey="general">
        <Row>
          <Col md={3}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="general" className="d-flex align-items-center rounded-0 px-4 py-3">
                      <Gear className="me-2" />
                      {t('settings.general.title')}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="appearance" className="d-flex align-items-center rounded-0 px-4 py-3">
                      <Palette className="me-2" />
                      {t('settings.appearance.title')}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications" className="d-flex align-items-center rounded-0 px-4 py-3">
                      <Bell className="me-2" />
                      {t('settings.notifications.title')}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security" className="d-flex align-items-center rounded-0 px-4 py-3">
                      <ShieldLock className="me-2" />
                      {t('settings.security.title')}
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="general">
                <SettingsCard
                  icon={<Gear size={32} className="text-primary" />}
                  title={t('settings.general.title')}
                  description={t('settings.general.description')}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="appearance">
                <SettingsCard
                  icon={<Palette size={32} className="text-primary" />}
                  title={t('settings.appearance.title')}
                  description={t('settings.appearance.description')}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="notifications">
                <SettingsCard
                  icon={<Bell size={32} className="text-primary" />}
                  title={t('settings.notifications.title')}
                  description={t('settings.notifications.description')}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="security">
                <SettingsCard
                  icon={<ShieldLock size={32} className="text-primary" />}
                  title={t('settings.security.title')}
                  description={t('settings.security.description')}
                />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Quick Settings Overview */}
      <Row className="mt-4">
        <Col>
          <h5 className="mb-3">Quick Settings Overview</h5>
        </Col>
      </Row>
      <Row className="g-4">
        <Col md={6} lg={3}>
          <SettingsCard
            icon={<Gear size={28} className="text-primary" />}
            title={t('settings.general.title')}
            description={t('settings.general.description')}
          />
        </Col>
        <Col md={6} lg={3}>
          <SettingsCard
            icon={<Palette size={28} className="text-primary" />}
            title={t('settings.appearance.title')}
            description={t('settings.appearance.description')}
          />
        </Col>
        <Col md={6} lg={3}>
          <SettingsCard
            icon={<Bell size={28} className="text-primary" />}
            title={t('settings.notifications.title')}
            description={t('settings.notifications.description')}
          />
        </Col>
        <Col md={6} lg={3}>
          <SettingsCard
            icon={<ShieldLock size={28} className="text-primary" />}
            title={t('settings.security.title')}
            description={t('settings.security.description')}
          />
        </Col>
      </Row>
    </Container>
  );
}
