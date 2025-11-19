import { useState } from 'react';
import { Button, ButtonGroup, Modal, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Property, PropertyStatus } from '../properties.types';
import {
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  usePublishPropertyMutation,
  useArchivePropertyMutation,
  useSubmitPropertyMutation,
} from '../propertiesApi';
import { useToast } from '@/shared/hooks/useToast';

interface ApprovalActionsProps {
  property: Property;
  onSuccess?: () => void;
}

const rejectSchema = z.object({
  rejection_reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

type RejectFormData = z.infer<typeof rejectSchema>;

export function ApprovalActions({ property, onSuccess }: ApprovalActionsProps) {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToast();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [submitProperty, { isLoading: isSubmitting }] = useSubmitPropertyMutation();
  const [approveProperty, { isLoading: isApproving }] = useApprovePropertyMutation();
  const [rejectProperty, { isLoading: isRejecting }] = useRejectPropertyMutation();
  const [publishProperty, { isLoading: isPublishing }] = usePublishPropertyMutation();
  const [archiveProperty, { isLoading: isArchiving }] = useArchivePropertyMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
  });

  const isLoading = isSubmitting || isApproving || isRejecting || isPublishing || isArchiving;

  const handleAction = async (
    action: () => Promise<unknown>,
    successKey: string,
    errorKey: string
  ) => {
    try {
      await action();
      showSuccess(t(successKey));
      onSuccess?.();
    } catch (error) {
      const apiError = error as { data?: { error?: { message?: string } } };
      showError(apiError.data?.error?.message || t(errorKey));
    }
  };

  const handleSubmitForApproval = () =>
    handleAction(
      () => submitProperty(property.id).unwrap(),
      'properties.messages.submittedForApproval',
      'properties.errors.submitFailed'
    );

  const handleApprove = () =>
    handleAction(
      () => approveProperty(property.id).unwrap(),
      'properties.messages.approved',
      'properties.errors.approveFailed'
    );

  const handleReject = async (data: RejectFormData) => {
    try {
      await rejectProperty({
        id: property.id,
        data: { rejection_reason: data.rejection_reason },
      }).unwrap();
      showSuccess(t('properties.messages.rejected'));
      setShowRejectModal(false);
      reset();
      onSuccess?.();
    } catch (error) {
      const apiError = error as { data?: { error?: { message?: string } } };
      showError(apiError.data?.error?.message || t('properties.errors.rejectFailed'));
    }
  };

  const handlePublish = () =>
    handleAction(
      () => publishProperty(property.id).unwrap(),
      'properties.messages.published',
      'properties.errors.publishFailed'
    );

  const handleArchive = () =>
    handleAction(
      () => archiveProperty(property.id).unwrap(),
      'properties.messages.archived',
      'properties.errors.archiveFailed'
    );

  // Determine available actions based on status
  const getAvailableActions = (status: PropertyStatus) => {
    const actions: JSX.Element[] = [];

    switch (status) {
      case 'DRAFT':
        actions.push(
          <Button
            key="submit"
            variant="primary"
            size="sm"
            onClick={handleSubmitForApproval}
            disabled={isLoading}
          >
            <i className="bi bi-send me-1" />
            {t('properties.actions.submitForApproval')}
          </Button>
        );
        break;

      case 'PENDING_APPROVAL':
        actions.push(
          <Button
            key="approve"
            variant="success"
            size="sm"
            onClick={handleApprove}
            disabled={isLoading}
          >
            <i className="bi bi-check-circle me-1" />
            {t('properties.actions.approve')}
          </Button>,
          <Button
            key="reject"
            variant="danger"
            size="sm"
            onClick={() => setShowRejectModal(true)}
            disabled={isLoading}
          >
            <i className="bi bi-x-circle me-1" />
            {t('properties.actions.reject')}
          </Button>
        );
        break;

      case 'APPROVED':
        actions.push(
          <Button
            key="publish"
            variant="success"
            size="sm"
            onClick={handlePublish}
            disabled={isLoading}
          >
            <i className="bi bi-globe me-1" />
            {t('properties.actions.publish')}
          </Button>
        );
        break;

      case 'PUBLISHED':
        actions.push(
          <Button
            key="archive"
            variant="secondary"
            size="sm"
            onClick={handleArchive}
            disabled={isLoading}
          >
            <i className="bi bi-archive me-1" />
            {t('properties.actions.archive')}
          </Button>
        );
        break;

      case 'REJECTED':
        actions.push(
          <Button
            key="resubmit"
            variant="primary"
            size="sm"
            onClick={handleSubmitForApproval}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            {t('properties.actions.resubmit')}
          </Button>
        );
        break;

      case 'ARCHIVED':
        actions.push(
          <Button
            key="republish"
            variant="primary"
            size="sm"
            onClick={handlePublish}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-up-circle me-1" />
            {t('properties.actions.republish')}
          </Button>
        );
        break;
    }

    return actions;
  };

  return (
    <>
      <ButtonGroup>{getAvailableActions(property.status)}</ButtonGroup>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('properties.rejectModal.title')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleReject)}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>{t('properties.rejectModal.reasonLabel')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder={t('properties.rejectModal.reasonPlaceholder')}
                {...register('rejection_reason')}
                isInvalid={!!errors.rejection_reason}
              />
              <Form.Control.Feedback type="invalid">
                {errors.rejection_reason?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" type="submit" disabled={isRejecting}>
              {isRejecting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" />
                  {t('common.processing')}
                </>
              ) : (
                t('properties.actions.reject')
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
