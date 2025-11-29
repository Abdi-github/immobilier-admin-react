/**
 * Permissions Page
 *
 * Main page for managing permissions.
 */

import { useState } from 'react';
import { Container, Row, Col, Breadcrumb, Tab, Nav, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PermissionList, PermissionFormModal } from '../components';
import { PermissionsByResourceView } from '../components/PermissionsByResourceView';
import type { Permission } from '../roles.types';

export function PermissionsPage() {
  const { t } = useTranslation();
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission.id ? permission : null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPermission(null);
  };

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          {t('nav.dashboard')}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{t('nav.permissions')}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0">{t('permissions.management')}</h1>
        </Col>
      </Row>

      {/* Tab Navigation */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'list')}>
        <Card className="mb-3">
          <Card.Header>
            <Nav variant="tabs" className="card-header-tabs">
              <Nav.Item>
                <Nav.Link eventKey="list" className="d-flex align-items-center gap-2">
                  <i className="bi bi-list" />
                  {t('permissions.listView')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="grouped" className="d-flex align-items-center gap-2">
                  <i className="bi bi-grid-3x3" />
                  {t('permissions.groupedView')}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
        </Card>

        <Tab.Content>
          <Tab.Pane eventKey="list">
            <PermissionList onEdit={handleEdit} />
          </Tab.Pane>
          <Tab.Pane eventKey="grouped">
            <PermissionsByResourceView onEdit={handleEdit} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      <PermissionFormModal
        show={showModal}
        permission={editingPermission}
        onClose={handleCloseModal}
      />
    </Container>
  );
}
