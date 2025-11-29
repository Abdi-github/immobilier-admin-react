/**
 * Roles Page
 *
 * Main page for managing roles.
 */

import { useState } from 'react';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RoleList, RoleFormModal } from '../components';
import type { Role } from '../roles.types';

export function RolesPage() {
  const { t } = useTranslation();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleEdit = (role: Role) => {
    setEditingRole(role.id ? role : null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          {t('nav.dashboard')}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{t('nav.roles')}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col>
          <h1 className="h3 mb-4">{t('roles.management')}</h1>
        </Col>
      </Row>

      <RoleList onEdit={handleEdit} />

      <RoleFormModal show={showModal} role={editingRole} onClose={handleCloseModal} />
    </Container>
  );
}
