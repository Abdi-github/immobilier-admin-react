/**
 * Permissions By Resource View Component
 *
 * Displays permissions grouped by resource for a visual overview.
 */

import { Card, Row, Col, Badge, Spinner, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetPermissionsGroupedQuery } from '../rolesApi';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { Permission, PermissionAction, MultilingualText, PermissionsByResource } from '../roles.types';

interface PermissionsByResourceViewProps {
  onEdit?: (permission: Permission) => void;
}

export function PermissionsByResourceView({ onEdit }: PermissionsByResourceViewProps) {
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions();
  const currentLang = i18n.language as keyof MultilingualText;

  const { data, isLoading } = useGetPermissionsGroupedQuery();
  const groupedPermissions = data?.data || [];

  // Get localized text helper
  const getLocalizedText = (text: MultilingualText | undefined): string => {
    if (!text) return '';
    return text[currentLang] || text.en || '';
  };

  // Action badge color mapping
  const getActionColor = (action: PermissionAction): string => {
    const colors: Record<PermissionAction, string> = {
      create: 'success',
      read: 'info',
      update: 'warning',
      delete: 'danger',
      manage: 'primary',
      approve: 'info',
      reject: 'danger',
      publish: 'success',
      archive: 'secondary',
    };
    return colors[action] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </Spinner>
      </div>
    );
  }

  if (groupedPermissions.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5 text-muted">
          {t('permissions.noPermissionsFound')}
        </Card.Body>
      </Card>
    );
  }

  return (
    <Row className="g-4">
      {groupedPermissions.map((group: PermissionsByResource) => (
        <Col md={6} lg={4} key={group.resource}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 text-capitalize">{group.resource}</h6>
              <Badge bg="secondary">{group.permissions.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <ul className="list-group list-group-flush">
                {group.permissions.map((permission: Permission) => (
                  <li
                    key={permission.id}
                    className="list-group-item d-flex justify-content-between align-items-start"
                  >
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Badge bg={getActionColor(permission.action)} className="text-uppercase">
                          {permission.action}
                        </Badge>
                        {permission.is_active ? (
                          <i className="bi bi-check-circle text-success" />
                        ) : (
                          <i className="bi bi-x-circle text-muted" />
                        )}
                      </div>
                      <small className="text-muted d-block">
                        {getLocalizedText(permission.display_name)}
                      </small>
                    </div>
                    {hasPermission('permissions:update') && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-muted"
                        onClick={() => onEdit?.(permission)}
                        title={t('common.edit')}
                      >
                        <i className="bi bi-pencil" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </Card.Body>
            {hasPermission('permissions:create') && (
              <Card.Footer className="bg-light">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-primary"
                  onClick={() =>
                    onEdit?.({
                      id: '',
                      name: '',
                      resource: group.resource,
                      action: 'read',
                      display_name: {},
                      description: {},
                      is_active: true,
                      created_at: '',
                      updated_at: '',
                    })
                  }
                >
                  <i className="bi bi-plus-circle me-1" />
                  {t('permissions.addToResource', { resource: group.resource })}
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
