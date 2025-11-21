import React, { useState, useCallback } from 'react';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { useToast } from '@/shared/hooks/useToast';
import type { ApiError } from '@/shared/types';

import type { User } from '../users.types';
import {
  useDeleteUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
} from '../usersApi';

interface UserActionsProps {
  user: User;
  onEdit?: () => void;
  onDeleted?: () => void;
  variant?: 'buttons' | 'dropdown';
}

export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onEdit,
  onDeleted,
  variant = 'buttons',
}) => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();

  const handleDelete = useCallback(async () => {
    try {
      await deleteUser(user.id).unwrap();
      showSuccess(t('users.messages.deleted'));
      setShowDeleteModal(false);
      onDeleted?.();
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('users.errors.deleteFailed'));
    }
  }, [deleteUser, user.id, showSuccess, showError, t, onDeleted]);

  const handleSuspend = useCallback(async () => {
    try {
      await suspendUser(user.id).unwrap();
      showSuccess(t('users.messages.suspended'));
      setShowSuspendModal(false);
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('users.errors.suspendFailed'));
    }
  }, [suspendUser, user.id, showSuccess, showError, t]);

  const handleActivate = useCallback(async () => {
    try {
      await activateUser(user.id).unwrap();
      showSuccess(t('users.messages.activated'));
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('users.errors.activateFailed'));
    }
  }, [activateUser, user.id, showSuccess, showError, t]);

  if (variant === 'dropdown') {
    return (
      <>
        <Dropdown align="end">
          <Dropdown.Toggle variant="secondary" id="user-actions-dropdown">
            <i className="bi bi-three-dots-vertical me-1"></i>
            {t('users.actions.more')}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {onEdit && (
              <Dropdown.Item onClick={onEdit}>
                <i className="bi bi-pencil me-2"></i>
                {t('common.actions.edit')}
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            {user.status === 'active' && (
              <Dropdown.Item
                onClick={() => setShowSuspendModal(true)}
                className="text-warning"
              >
                <i className="bi bi-pause-circle me-2"></i>
                {t('users.actions.suspend')}
              </Dropdown.Item>
            )}
            {user.status === 'suspended' && (
              <Dropdown.Item
                onClick={handleActivate}
                disabled={isActivating}
                className="text-success"
              >
                <i className="bi bi-play-circle me-2"></i>
                {t('users.actions.activate')}
                {isActivating && (
                  <Spinner animation="border" size="sm" className="ms-2" />
                )}
              </Dropdown.Item>
            )}
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
          title={t('users.deleteModal.title')}
          message={t('users.deleteModal.message', {
            name: `${user.first_name} ${user.last_name}`,
          })}
          confirmLabel={t('common.actions.delete')}
          confirmVariant="danger"
          isLoading={isDeleting}
        />

        {/* Suspend Confirmation Modal */}
        <ConfirmModal
          show={showSuspendModal}
          onHide={() => setShowSuspendModal(false)}
          onConfirm={handleSuspend}
          title={t('users.suspendModal.title')}
          message={t('users.suspendModal.message', {
            name: `${user.first_name} ${user.last_name}`,
          })}
          confirmLabel={t('users.actions.suspend')}
          confirmVariant="warning"
          isLoading={isSuspending}
        />
      </>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        {onEdit && (
          <Button variant="outline-primary" size="sm" onClick={onEdit}>
            <i className="bi bi-pencil me-1"></i>
            {t('common.actions.edit')}
          </Button>
        )}

        {user.status === 'active' && (
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => setShowSuspendModal(true)}
            disabled={isSuspending}
          >
            <i className="bi bi-pause-circle me-1"></i>
            {t('users.actions.suspend')}
          </Button>
        )}

        {user.status === 'suspended' && (
          <Button
            variant="outline-success"
            size="sm"
            onClick={handleActivate}
            disabled={isActivating}
          >
            {isActivating ? (
              <Spinner animation="border" size="sm" className="me-1" />
            ) : (
              <i className="bi bi-play-circle me-1"></i>
            )}
            {t('users.actions.activate')}
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
      </div>

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

      {/* Suspend Confirmation Modal */}
      <ConfirmModal
        show={showSuspendModal}
        onHide={() => setShowSuspendModal(false)}
        onConfirm={handleSuspend}
        title={t('users.suspendModal.title')}
        message={t('users.suspendModal.message', {
          name: `${user.first_name} ${user.last_name}`,
        })}
        confirmLabel={t('users.actions.suspend')}
        confirmVariant="warning"
        isLoading={isSuspending}
      />
    </>
  );
};

export default UserActions;
