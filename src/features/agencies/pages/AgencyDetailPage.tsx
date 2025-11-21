/**
 * Agency Detail Page
 *
 * Displays detailed information about a single agency.
 */

import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { PageHeader } from '@/shared/components/PageHeader';
import { Breadcrumb } from '@/shared/components/Breadcrumb';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { useToast } from '@/shared/hooks/useToast';
import { usePermissions } from '@/shared/hooks/usePermissions';
import type { ApiError } from '@/shared/types';

import { AgencyDetails, AgencyFormModal } from '../components';
import { useGetAgencyQuery, useDeleteAgencyMutation } from '../agenciesApi';

export const AgencyDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const { hasPermission } = usePermissions();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canManage = hasPermission('agencies:manage');
  const canDelete = hasPermission('agencies:delete');

  const {
    data: agencyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAgencyQuery(id!, { skip: !id });

  const [deleteAgency, { isLoading: isDeleting }] = useDeleteAgencyMutation();

  const agency = agencyData?.data;

  const handleEdit = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!id) return;

    try {
      await deleteAgency(id).unwrap();
      showSuccess(t('agencies.messages.deleted'));
      navigate('/agencies');
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('agencies.errors.deleteFailed'));
    }
  }, [deleteAgency, id, showSuccess, showError, t, navigate]);

  const breadcrumbItems = [
    { label: t('common.navigation.dashboard'), path: '/' },
    { label: t('agencies.title'), path: '/agencies' },
    { label: agency ? agency.name : t('common.loading') },
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
          <p>{apiError?.data?.error?.message || t('agencies.errors.loadFailed')}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={() => refetch()}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              {t('common.actions.retry')}
            </Button>
            <Link to="/agencies" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              {t('common.actions.back')}
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!agency) {
    return (
      <Container fluid className="py-4">
        <Breadcrumb items={breadcrumbItems} />
        <Alert variant="warning" className="mt-4">
          <Alert.Heading>{t('common.notFound')}</Alert.Heading>
          <p>{t('agencies.errors.notFound')}</p>
          <Link to="/agencies" className="btn btn-outline-warning">
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
        title={agency.name}
        subtitle={agency.slug}
        actions={
          <div className="d-flex gap-2">
            <Link to="/agencies" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              {t('common.actions.back')}
            </Link>
            {canManage && (
              <Button variant="outline-primary" onClick={handleEdit}>
                <i className="bi bi-pencil me-2"></i>
                {t('common.actions.edit')}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <i className="bi bi-trash me-2"></i>
                {t('common.actions.delete')}
              </Button>
            )}
          </div>
        }
      />

      {/* Agency Details */}
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <AgencyDetails agency={agency} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Agency Modal */}
      <AgencyFormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        agency={agency}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('agencies.confirmDelete.title')}
        message={t('agencies.confirmDelete.message', { name: agency.name })}
        confirmLabel={t('common.actions.delete')}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </Container>
  );
};

export default AgencyDetailPage;
