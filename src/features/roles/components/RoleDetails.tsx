/**
 * Role Details Component
 *
 * Displays detailed information about a role, including its permissions.
 */

import { Card, Row, Col, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetRoleQuery, useGetRolePermissionsQuery } from '../rolesApi';
import { RoleStatusBadge } from './RoleStatusBadge';
import { RoleSystemBadge } from './RoleSystemBadge';
import type { MultilingualText, Permission } from '../roles.types';

interface RoleDetailsProps {
  roleId: string;
}

export function RoleDetails({ roleId }: RoleDetailsProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as keyof MultilingualText;

  const { data: roleData, isLoading, error } = useGetRoleQuery(roleId);
  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useGetRolePermissionsQuery(roleId);

  const role = roleData?.data;
  const permissions = permissionsData?.data || [];

  // Get localized text helper
  const getLocalizedText = (text: MultilingualText | undefined): string => {
    if (!text) return '';
    return text[currentLang] || text.en || '';
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>(
    (acc, perm) => {
      const resource = perm.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource]!.push(perm);
      return acc;
    },
    {}
  );

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </div>
    );
  }

  if (error || !role) {
    return <Alert variant="danger">{t('roles.roleNotFound')}</Alert>;
  }

  return (
    <Row className="g-4">
      {/* Role Information Card */}
      <Col lg={4}>
        <Card>
          <Card.Header>
            <i className="bi bi-shield-check me-2" />
            {t('roles.roleInfo')}
          </Card.Header>
          <Card.Body>
            <dl className="mb-0">
              <dt>{t('roles.name')}</dt>
              <dd>
                <code>{role.name}</code>
              </dd>

              <dt>{t('roles.displayName')}</dt>
              <dd>{getLocalizedText(role.display_name)}</dd>

              <dt>{t('common.description')}</dt>
              <dd className="text-muted">
                {getLocalizedText(role.description) || t('common.noDescription')}
              </dd>

              <dt>{t('roles.type')}</dt>
              <dd>
                <RoleSystemBadge isSystem={role.is_system} />
                {!role.is_system && <span className="text-muted">{t('roles.customRole')}</span>}
              </dd>

              <dt>{t('common.status')}</dt>
              <dd>
                <RoleStatusBadge isActive={role.is_active} />
              </dd>

              <dt>
                <i className="bi bi-clock me-1" />
                {t('common.createdAt')}
              </dt>
              <dd>{new Date(role.created_at).toLocaleString(i18n.language)}</dd>

              <dt>
                <i className="bi bi-clock me-1" />
                {t('common.updatedAt')}
              </dt>
              <dd>{new Date(role.updated_at).toLocaleString(i18n.language)}</dd>
            </dl>
          </Card.Body>
        </Card>

        {/* Multilingual Display Names */}
        <Card className="mt-3">
          <Card.Header>{t('roles.multilingualNames')}</Card.Header>
          <ListGroup variant="flush">
            {(['en', 'fr', 'de', 'it'] as const).map((lang) => (
              <ListGroup.Item key={lang} className="d-flex justify-content-between">
                <span className="text-uppercase fw-semibold">{lang}</span>
                <span>{role.display_name?.[lang] || '-'}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      </Col>

      {/* Permissions Card */}
      <Col lg={8}>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>
              <i className="bi bi-shield-check me-2" />
              {t('roles.permissions')}
            </span>
            <Badge bg="primary">{permissions.length}</Badge>
          </Card.Header>
          <Card.Body>
            {isLoadingPermissions ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            ) : permissions.length === 0 ? (
              <Alert variant="info">{t('roles.noPermissionsAssigned')}</Alert>
            ) : (
              Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="mb-4">
                  <h6 className="text-capitalize border-bottom pb-2 mb-3">
                    {resource}
                    <Badge bg="secondary" className="ms-2">
                      {perms.length}
                    </Badge>
                  </h6>
                  <Row>
                    {perms.map((perm) => (
                      <Col md={6} lg={4} key={perm.id} className="mb-2">
                        <div className="d-flex align-items-start gap-2 p-2 bg-light rounded">
                          {perm.is_active ? (
                            <i className="bi bi-check-circle text-success mt-1" />
                          ) : (
                            <i className="bi bi-x-circle text-muted mt-1" />
                          )}
                          <div>
                            <code className="small">{perm.action}</code>
                            <br />
                            <small className="text-muted">
                              {getLocalizedText(perm.display_name)}
                            </small>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
