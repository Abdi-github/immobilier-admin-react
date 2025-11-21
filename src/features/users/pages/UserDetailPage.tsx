import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { PageHeader } from '@/shared/components/PageHeader';
import { Breadcrumb } from '@/shared/components/Breadcrumb';

import { UserDetails, UserFormModal } from '../components';
import { useGetUserQuery, useDeleteUserMutation } from '../usersApi';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { useToast } from '@/shared/hooks/useToast';
import type { ApiError } from '@/shared/types';

export const UserDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    data: userData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserQuery(id!, { skip: !id });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const user = userData?.data;

  const handleEdit = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!id) return;

    try {
      await deleteUser(id).unwrap();
      showSuccess(t('users.messages.deleted'));
      navigate('/users');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('users.errors.deleteFailed'));
    }
  }, [deleteUser, id, showSuccess, showError, t, navigate]);

  const breadcrumbItems = [
    { label: t('common.navigation.dashboard'), path: '/' },
    { label: t('users.title'), path: '/users' },
    { label: user ? `${user.first_name} ${user.last_name}` : t('common.loading') },
  ];

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (isError) {
    const apiError = error as ApiError;
    return (
      <Container fluid className="py-4">
        <Breadcrumb items={breadcrumbItems} />
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>{t('common.error')}</Alert.Heading>
          <p>{apiError?.data?.error?.message || t('users.errors.loadFailed')}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={() => refetch()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              {t('common.actions.retry')}
            </Button>
            <Link to="/users" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              {t('common.actions.back')}
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container fluid className="py-4">
        <Breadcrumb items={breadcrumbItems} />
        <Alert variant="warning" className="mt-4">
          <Alert.Heading>{t('common.notFound')}</Alert.Heading>
          <p>{t('users.errors.notFound')}</p>
          <Link to="/users" className="btn btn-outline-warning">
            <i className="bi bi-arrow-left me-2"></i>
            {t('common.actions.back')}
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        subtitle={user.email}
        actions={
          <div className="d-flex gap-2">
            <Link to="/users" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              {t('common.actions.back')}
            </Link>
            <Button variant="outline-primary" onClick={handleEdit}>
              <i className="bi bi-pencil me-2"></i>
              {t('common.actions.edit')}
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash me-2"></i>
              {t('common.actions.delete')}
            </Button>
          </div>
        }
      />

      {/* User Details */}
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <UserDetails user={user} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit User Modal */}
      <UserFormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={user}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('users.deleteModal.title')}
        message={t('users.deleteModal.message', {
          name: `${user.first_name} ${user.last_name}`,
        })}
        confirmLabel={t('common.actions.delete')}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </Container>
  );
};

export default UserDetailPage;
