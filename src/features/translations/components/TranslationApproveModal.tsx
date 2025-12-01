/**
 * Translation Approve Modal Component
 */

import { Modal, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'react-bootstrap-icons';
import { PropertyTranslation, LanguageCode } from '../translations.types';
import { useApproveTranslationMutation } from '../translationsApi';
import { useToast } from '@/shared/hooks/useToast';

interface TranslationApproveModalProps {
  show: boolean;
  translation: PropertyTranslation | null;
  onHide: () => void;
}

const languageFlags: Record<LanguageCode, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

export function TranslationApproveModal({ show, translation, onHide }: TranslationApproveModalProps) {
  const { t } = useTranslation();
  const { success, error } = useToast();
  const [approveTranslation, { isLoading }] = useApproveTranslationMutation();

  const handleApprove = async () => {
    if (!translation) return;

    try {
      await approveTranslation({ id: translation.id }).unwrap();
      success(t('translations.approveSuccess'));
      onHide();
    } catch (err) {
      error(t('translations.approveError'));
      console.error('Error approving translation:', err);
    }
  };

  if (!translation) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-success">
          <CheckCircle className="me-2" />
          {t('translations.approveTitle')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('translations.approveConfirm')}</p>
        
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button variant="success" onClick={handleApprove} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t('common.loading')}
            </>
          ) : (
            <>
              <CheckCircle className="me-1" />
              {t('common.approve')}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
