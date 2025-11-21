/**
 * Agency Actions Component
 *
 * Provides action buttons for agency operations (edit, delete, verify, status change).
 */

import React, { useState, useCallback } from 'react';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { useToast } from '@/shared/hooks/useToast';
import type { ApiError } from '@/shared/types';

import type { Agency, AgencyStatus } from '../agencies.types';
import {
  useDeleteAgencyMutation,
  useVerifyAgencyMutation,
  useUnverifyAgencyMutation,
  useUpdateAgencyStatusMutation,
} from '../agenciesApi';

interface AgencyActionsProps {
  agency: Agency;
  onEdit?: () => void;
  onDeleted?: () => void;
  variant?: 'buttons' | 'dropdown';
}

export const AgencyActions: React.FC<AgencyActionsProps> = ({
  agency,
  onEdit,
  onDeleted,
  variant = 'dropdown',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AgencyStatus | null>(null);

  const [deleteAgency, { isLoading: isDeleting }] = useDeleteAgencyMutation();
  const [verifyAgency, { isLoading: isVerifying }] = useVerifyAgencyMutation();
  const [unverifyAgency, { isLoading: isUnverifying }] = useUnverifyAgencyMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateAgencyStatusMutation();

  const isLoading = isDeleting || isVerifying || isUnverifying || isUpdatingStatus;

  // Delete handler
  const handleDelete = useCallback(async () => {
    try {
      await deleteAgency(agency.id).unwrap();
      showSuccess(t('agencies.messages.deleted'));
      setShowDeleteModal(false);
      onDeleted?.();
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('agencies.errors.deleteFailed'));
    }
  }, [deleteAgency, agency.id, showSuccess, showError, t, onDeleted]);

  // Verify/Unverify handlers
  const handleVerify = useCallback(async () => {
    try {
      await verifyAgency(agency.id).unwrap();
      showSuccess(t('agencies.messages.verified'));
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('agencies.errors.verifyFailed'));
    }
  }, [verifyAgency, agency.id, showSuccess, showError, t]);

  const handleUnverify = useCallback(async () => {
    try {
      await unverifyAgency(agency.id).unwrap();
      showSuccess(t('agencies.messages.unverified'));
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('agencies.errors.unverifyFailed'));
    }
  }, [unverifyAgency, agency.id, showSuccess, showError, t]);

  // Status change handler
  const handleStatusChange = useCallback(
    async (status: AgencyStatus) => {
      setPendingStatus(status);
      setShowStatusModal(true);
    },
    []
  );

  const confirmStatusChange = useCallback(async () => {
    if (!pendingStatus) return;

    try {
      await updateStatus({ id: agency.id, status: pendingStatus }).unwrap();
      showSuccess(t('agencies.messages.statusUpdated'));
      setShowStatusModal(false);
      setPendingStatus(null);
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('agencies.errors.statusUpdateFailed'));
    }
  }, [updateStatus, agency.id, pendingStatus, showSuccess, showError, t]);

  // View details handler
  const handleView = useCallback(() => {
    navigate(`/agencies/${agency.id}`);
  }, [navigate, agency.id]);

  if (variant === 'buttons') {
    return (
      <div className="d-flex gap-2">
        <Button variant="outline-secondary" size="sm" onClick={handleView}>
          <i className="bi bi-eye me-1"></i>
          {t('common.actions.view')}
        </Button>
        {onEdit && (
          <Button variant="outline-primary" size="sm" onClick={onEdit}>
            <i className="bi bi-pencil me-1"></i>
            {t('common.actions.edit')}
          </Button>
        )}
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
        >
          <i className="bi bi-trash me-1"></i>
          {t('common.actions.delete')}
        </Button>

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
      </div>
    );
  }

  // Dropdown variant
  return (
    <>
      <Dropdown align="end">
        <Dropdown.Toggle
          variant="link"
          className="text-muted p-0 border-0"
          id={`agency-actions-${agency.id}`}
        >
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {/* View */}
          <Dropdown.Item onClick={handleView}>
            <i className="bi bi-eye me-2"></i>
            {t('common.actions.view')}
          </Dropdown.Item>

          {/* Edit */}
          {onEdit && (
            <Dropdown.Item onClick={onEdit}>
              <i className="bi bi-pencil me-2"></i>
              {t('common.actions.edit')}
            </Dropdown.Item>
          )}

          <Dropdown.Divider />

          {/* Verify/Unverify */}
          {agency.is_verified ? (
            <Dropdown.Item onClick={handleUnverify} disabled={isUnverifying}>
              <i className="bi bi-patch-minus me-2"></i>
              {t('agencies.actions.unverify')}
            </Dropdown.Item>
          ) : (
            <Dropdown.Item onClick={handleVerify} disabled={isVerifying}>
              <i className="bi bi-patch-check me-2"></i>
              {t('agencies.actions.verify')}
            </Dropdown.Item>
          )}

          <Dropdown.Divider />

          {/* Status Changes */}
          <Dropdown.Header>{t('agencies.changeStatus')}</Dropdown.Header>
          {agency.status !== 'active' && (
            <Dropdown.Item onClick={() => handleStatusChange('active')}>
              <i className="bi bi-check-circle text-success me-2"></i>
              {t('agencies.status.active')}
            </Dropdown.Item>
          )}
          {agency.status !== 'pending' && (
            <Dropdown.Item onClick={() => handleStatusChange('pending')}>
              <i className="bi bi-clock text-warning me-2"></i>
              {t('agencies.status.pending')}
            </Dropdown.Item>
          )}
          {agency.status !== 'suspended' && (
            <Dropdown.Item onClick={() => handleStatusChange('suspended')}>
              <i className="bi bi-slash-circle text-danger me-2"></i>
              {t('agencies.status.suspended')}
            </Dropdown.Item>
          )}
          {agency.status !== 'inactive' && (
            <Dropdown.Item onClick={() => handleStatusChange('inactive')}>
              <i className="bi bi-x-circle text-secondary me-2"></i>
              {t('agencies.status.inactive')}
            </Dropdown.Item>
          )}

          <Dropdown.Divider />

          {/* Delete */}
          <Dropdown.Item
            onClick={() => setShowDeleteModal(true)}
            className="text-danger"
          >
            <i className="bi bi-trash me-2"></i>
            {t('common.actions.delete')}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

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

      {/* Status Change Confirmation Modal */}
      <ConfirmModal
        show={showStatusModal}
        onHide={() => {
          setShowStatusModal(false);
          setPendingStatus(null);
        }}
        onConfirm={confirmStatusChange}
        title={t('agencies.confirmStatusChange.title')}
        message={t('agencies.confirmStatusChange.message', {
          name: agency.name,
          status: pendingStatus ? t(`agencies.status.${pendingStatus}`) : '',
        })}
        confirmLabel={t('common.actions.confirm')}
        confirmVariant="primary"
        isLoading={isUpdatingStatus}
      />
    </>
  );
};

export default AgencyActions;
