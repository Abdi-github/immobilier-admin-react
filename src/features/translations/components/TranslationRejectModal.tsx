/**
 * Translation Reject Modal Component
 */

import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import { PropertyTranslation, LanguageCode } from '../translations.types';
import { useRejectTranslationMutation } from '../translationsApi';
import { useToast } from '@/shared/hooks/useToast';

interface TranslationRejectModalProps {
  show: boolean;
  translation: PropertyTranslation | null;
  onHide: () => void;
}

interface FormData {
  rejection_reason: string;
}

const languageFlags: Record<LanguageCode, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

export function TranslationRejectModal({ show, translation, onHide }: TranslationRejectModalProps) {
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [rejectTranslation, { isLoading }] = useRejectTranslationMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      rejection_reason: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!translation) return;

    try {
      await rejectTranslation({
        id: translation.id,
        rejection_reason: data.rejection_reason,
      }).unwrap();
      success(t('translations.rejectSuccess'));
      reset();
      onHide();
    } catch (err) {
      error(t('translations.rejectError'));
      console.error('Error rejecting translation:', err);
    }
  };

  const handleClose = () => {
    reset();
    onHide();
  };

  if (!translation) return null;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <XCircle className="me-2" />
          {t('translations.rejectTitle')}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div className="p-3 bg-light rounded mb-3">
            <div className="mb-2">
              <strong>{t('translations.language')}:</strong>{' '}
              <span className="fs-5 me-1">{languageFlags[translation.language]}</span>
              <span className="text-uppercase">{translation.language}</span>
            </div>
            <div className="mb-2">
              <strong>Title:</strong>{' '}
              <span className="text-truncate d-inline-block" style={{ maxWidth: '300px', verticalAlign: 'bottom' }}>
                {translation.title}
              </span>
            </div>
            <div>
              <strong>{t('translations.property')}:</strong>{' '}
              {translation.property?.external_id || translation.property_id}
            </div>
          </div>

          <Form.Group>
            <Form.Label>{t('translations.rejectReason')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              {...register('rejection_reason', {
                required: t('translations.rejectReasonRequired'),
                minLength: {
                  value: 10,
                  message: t('validation.minLength', { count: 10 }),
                },
              })}
              isInvalid={!!errors.rejection_reason}
              placeholder={t('translations.rejectReasonPlaceholder')}
            />
            <Form.Control.Feedback type="invalid">
              {errors.rejection_reason?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <XCircle className="me-1" />
                {t('common.reject')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
