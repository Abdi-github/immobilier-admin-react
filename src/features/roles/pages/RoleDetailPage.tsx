/**
 * Role Detail Page
 *
 * Displays detailed information about a specific role.
 */

import { Container, Row, Col, Breadcrumb, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { RoleDetails, RoleFormModal } from '../components';
import { useGetRoleQuery } from '../rolesApi';
import { usePermissions } from '@/shared/hooks/usePermissions';

export function RoleDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: roleData } = useGetRoleQuery(id!, { skip: !id });
  const [showModal, setShowModal] = useState(false);

  const role = roleData?.data;

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          {t('nav.dashboard')}
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/roles' }}>
          {t('nav.roles')}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{role?.name || id}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <Button variant="outline-secondary" size="sm" onClick={() => navigate('/roles')}>
              <i className="bi bi-arrow-left me-1" />
              {t('common.back')}
            </Button>
            <h1 className="h3 mb-0">{t('roles.roleDetails')}</h1>
          </div>
        </Col>
        {hasPermission('roles:update') && role && (
          <Col xs="auto">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="bi bi-pencil me-2" />
              {t('common.edit')}
            </Button>
          </Col>
        )}
      </Row>

      {id && <RoleDetails roleId={id} />}

      {role && (
        <RoleFormModal show={showModal} role={role} onClose={() => setShowModal(false)} />
      )}
    </Container>
  );
}
