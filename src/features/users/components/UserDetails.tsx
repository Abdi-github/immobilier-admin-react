import React from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { User } from '../users.types';
import { LANGUAGE_CONFIG } from '../users.types';

import { UserStatusBadge } from './UserStatusBadge';
import { UserTypeBadge } from './UserTypeBadge';

interface UserDetailsProps {
  user: User;
}

export const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const languageConfig = LANGUAGE_CONFIG[user.preferred_language];

  return (
    <div className="user-details">
      {/* Basic Info Card */}
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">
                <i className="bi bi-person me-2"></i>
                {t('users.details.basicInfo')}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={3} className="text-center">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '100px', height: '100px', fontSize: '36px' }}
                  >
                    {user.first_name.charAt(0)}
                    {user.last_name.charAt(0)}
                  </div>
                  <h4 className="mb-1">
                    {user.first_name} {user.last_name}
                  </h4>
                  <UserTypeBadge userType={user.user_type} />
                </Col>
                <Col md={9}>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td className="text-muted" style={{ width: '150px' }}>
                          {t('users.fields.email')}
                        </td>
                        <td>
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                          {user.email_verified ? (
                            <Badge bg="success" className="ms-2">
                              <i className="bi bi-check-circle me-1"></i>
                              {t('users.verified')}
                            </Badge>
                          ) : (
                            <Badge bg="warning" className="ms-2">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              {t('users.unverified')}
                            </Badge>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">{t('users.fields.phone')}</td>
                        <td>
                          {user.phone ? (
                            <a href={`tel:${user.phone}`}>{user.phone}</a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">{t('users.fields.status')}</td>
                        <td>
                          <UserStatusBadge status={user.status} />
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">
                          {t('users.fields.preferredLanguage')}
                        </td>
                        <td>
                          <span className="me-1">{languageConfig.flag}</span>
                          {languageConfig.label}
                        </td>
                      </tr>
                      {user.agency && (
                        <tr>
                          <td className="text-muted">{t('users.fields.agency')}</td>
                          <td>
                            <Link to={`/agencies/${user.agency.id}`}>
                              {user.agency.name}
                            </Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Roles Card */}
          {user.roles && user.roles.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="bg-transparent">
                <h5 className="mb-0">
                  <i className="bi bi-shield me-2"></i>
                  {t('users.details.roles')}
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role} bg="secondary" className="px-3 py-2">
                      {role}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Activity Card */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                {t('users.details.activity')}
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <small className="text-muted d-block">
                  {t('users.fields.createdAt')}
                </small>
                <span>{formatDate(user.created_at)}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">
                  {t('users.fields.updatedAt')}
                </small>
                <span>{formatDate(user.updated_at)}</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">
                  {t('users.fields.lastLogin')}
                </small>
                <span>
                  {user.last_login_at ? formatDate(user.last_login_at) : t('users.neverLoggedIn')}
                </span>
              </div>
              {user.email_verified && user.email_verified_at && (
                <div className="mb-3">
                  <small className="text-muted d-block">
                    {t('users.fields.verifiedAt')}
                  </small>
                  <span>{formatDate(user.email_verified_at)}</span>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                {t('users.details.quickActions')}
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <a
                  href={`mailto:${user.email}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-envelope me-2"></i>
                  {t('users.actions.sendEmail')}
                </a>
                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="bi bi-telephone me-2"></i>
                    {t('users.actions.call')}
                  </a>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDetails;
