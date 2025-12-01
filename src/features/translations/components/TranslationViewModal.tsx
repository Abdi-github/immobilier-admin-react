/**
 * Translation View Modal Component
 */

import { Modal, Badge, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Translate } from 'react-bootstrap-icons';
import { PropertyTranslation, TranslationApprovalStatus, TranslationSource, LanguageCode } from '../translations.types';

interface TranslationViewModalProps {
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

const languageNames: Record<LanguageCode, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  it: 'Italian',
};

const statusVariants: Record<TranslationApprovalStatus, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const sourceVariants: Record<TranslationSource, string> = {
  original: 'primary',
  human: 'info',
  deepl: 'secondary',
  machine: 'dark',
};

export function TranslationViewModal({ show, translation, onHide }: TranslationViewModalProps) {
  const { t } = useTranslation();

  if (!translation) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Translate className="me-2" />
          {t('translations.viewTranslation')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={6}>
            <div className="mb-3">
              <small className="text-muted d-block">{t('translations.property')}</small>
              <strong>{translation.property?.external_id || translation.property_id}</strong>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <small className="text-muted d-block">{t('translations.language')}</small>
              <span className="fs-5 me-2">{languageFlags[translation.language]}</span>
              <strong>{languageNames[translation.language]}</strong>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <div className="mb-3">
              <small className="text-muted d-block">{t('translations.source')}</small>
              <Badge bg={sourceVariants[translation.source]} className="text-capitalize">
                {t(`translations.sources.${translation.source}`)}
              </Badge>
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-3">
              <small className="text-muted d-block">{t('translations.qualityScore')}</small>
              {translation.quality_score !== undefined && translation.quality_score !== null ? (
                <Badge bg={translation.quality_score >= 80 ? 'success' : translation.quality_score >= 50 ? 'warning' : 'danger'}>
                  {translation.quality_score}%
                </Badge>
              ) : (
                <span className="text-muted">N/A</span>
              )}
            </div>
          </Col>
          <Col md={4}>
            <div className="mb-3">
              <small className="text-muted d-block">{t('translations.status')}</small>
              <Badge bg={statusVariants[translation.approval_status]}>
                {t(`translations.statuses.${translation.approval_status}`)}
              </Badge>
            </div>
          </Col>
        </Row>

        <div className="mb-4">
          <h6 className="text-muted mb-2">Title</h6>
          <div className="p-3 bg-light rounded">
            {translation.title || <span className="text-muted">{t('common.noDescription')}</span>}
          </div>
        </div>

        <div className="mb-4">
          <h6 className="text-muted mb-2">Description</h6>
          <div className="p-3 bg-light rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {translation.description ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>{translation.description}</div>
            ) : (
              <span className="text-muted">{t('common.noDescription')}</span>
            )}
          </div>
        </div>

        {translation.approval_status === 'REJECTED' && translation.rejection_reason && (
          <div className="mb-3">
            <h6 className="text-danger mb-2">Rejection Reason</h6>
            <div className="p-3 bg-danger bg-opacity-10 rounded border border-danger">
              {translation.rejection_reason}
            </div>
          </div>
        )}

        {translation.approved_at && (
          <Row>
            <Col md={6}>
              <small className="text-muted d-block">{t('translations.approvedAt')}</small>
              <span>{new Date(translation.approved_at).toLocaleString()}</span>
            </Col>
            {translation.approved_by && (
              <Col md={6}>
                <small className="text-muted d-block">{t('translations.approvedBy')}</small>
                <span>{translation.approved_by}</span>
              </Col>
            )}
          </Row>
        )}
      </Modal.Body>
    </Modal>
  );
}
