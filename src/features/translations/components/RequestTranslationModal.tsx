/**
 * Request Translation Modal Component
 * 
 * Modal for requesting auto-translations via LibreTranslate
 */

import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Translate, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { useRequestTranslationsMutation } from '../translationsApi';
import { LanguageCode } from '../translations.types';

interface RequestTranslationModalProps {
  show: boolean;
  onHide: () => void;
  propertyId: string;
  propertyExternalId?: string;
  sourceLanguage?: LanguageCode;
  existingLanguages?: LanguageCode[];
}

const ALL_LANGUAGES: LanguageCode[] = ['en', 'fr', 'de', 'it'];

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  it: 'Italian',
};

const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

export function RequestTranslationModal({
  show,
  onHide,
  propertyId,
  propertyExternalId,
  sourceLanguage = 'en',
  existingLanguages = [],
}: RequestTranslationModalProps) {
  const { t } = useTranslation();
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCode[]>([]);
  const [requestTranslations, { isLoading, isSuccess, isError, error, data, reset }] =
    useRequestTranslationsMutation();

  // Calculate missing languages (exclude source language and existing translations)
  const missingLanguages = ALL_LANGUAGES.filter(
    (lang) => lang !== sourceLanguage && !existingLanguages.includes(lang)
  );

  const handleToggleLanguage = (lang: LanguageCode) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSelectAll = () => {
    setSelectedLanguages(missingLanguages);
  };

  const handleDeselectAll = () => {
    setSelectedLanguages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await requestTranslations({
        propertyId,
        target_languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
      }).unwrap();
    } catch {
      // Error is handled by RTK Query
    }
  };

  const handleClose = () => {
    setSelectedLanguages([]);
    reset();
    onHide();
  };

  const translationsCreated = data?.data?.length || 0;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Translate className="text-primary" />
          {t('translations.requestTranslations', 'Request Translations')}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {isSuccess ? (
            <Alert variant="success" className="d-flex align-items-center gap-2">
              <CheckCircle size={20} />
              <div>
                <strong>
                  {translationsCreated > 0
                    ? t('translations.translationsRequested', 
                        '{{count}} translation(s) created successfully!',
                        { count: translationsCreated })
                    : t('translations.noTranslationsNeeded', 
                        'No translations needed - all languages are covered')}
                </strong>
                {translationsCreated > 0 && (
                  <div className="mt-1 small text-muted">
                    {t('translations.translationsRequestedNote',
                      'Translations are created with PENDING status and need admin approval.')}
                  </div>
                )}
              </div>
            </Alert>
          ) : isError ? (
            <Alert variant="danger" className="d-flex align-items-center gap-2">
              <XCircle size={20} />
              <div>
                <strong>{t('translations.requestError', 'Failed to request translations')}</strong>
                <div className="mt-1 small">
                  {(error as { data?: { message?: string } })?.data?.message || 
                    t('common.unknownError', 'An unknown error occurred')}
                </div>
              </div>
            </Alert>
          ) : (
            <>
              <div className="mb-3">
                <p className="text-muted">
                  {t('translations.requestDescription',
                    'Request automatic translations for property {{propertyId}} using LibreTranslate. The translations will be created with PENDING status and require admin approval.',
                    { propertyId: propertyExternalId || propertyId })}
                </p>
              </div>

              <div className="mb-3">
                <Form.Label className="fw-semibold">
                  {t('translations.sourceLanguage', 'Source Language')}
                </Form.Label>
                <div className="p-2 bg-light rounded">
                  <Badge bg="primary" className="fs-6">
                    {LANGUAGE_FLAGS[sourceLanguage]} {LANGUAGE_NAMES[sourceLanguage]}
                  </Badge>
                </div>
              </div>

              {existingLanguages.length > 0 && (
                <div className="mb-3">
                  <Form.Label className="fw-semibold">
                    {t('translations.existingTranslations', 'Existing Translations')}
                  </Form.Label>
                  <div className="d-flex gap-2 flex-wrap p-2 bg-light rounded">
                    {existingLanguages.map((lang) => (
                      <Badge key={lang} bg="success">
                        {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="fw-semibold mb-0">
                    {t('translations.targetLanguages', 'Target Languages')}
                  </Form.Label>
                  <div className="btn-group btn-group-sm">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={selectedLanguages.length === missingLanguages.length}
                    >
                      {t('common.selectAll', 'Select All')}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleDeselectAll}
                      disabled={selectedLanguages.length === 0}
                    >
                      {t('common.deselectAll', 'Deselect All')}
                    </Button>
                  </div>
                </div>

                {missingLanguages.length === 0 ? (
                  <Alert variant="info" className="mb-0">
                    <CheckCircle className="me-2" />
                    {t('translations.allLanguagesCovered', 
                      'All languages already have translations!')}
                  </Alert>
                ) : (
                  <div className="p-2 border rounded">
                    {missingLanguages.map((lang) => (
                      <Form.Check
                        key={lang}
                        type="checkbox"
                        id={`lang-${lang}`}
                        label={
                          <span>
                            {LANGUAGE_FLAGS[lang]} {LANGUAGE_NAMES[lang]}
                          </span>
                        }
                        checked={selectedLanguages.includes(lang)}
                        onChange={() => handleToggleLanguage(lang)}
                        className="py-1"
                      />
                    ))}
                  </div>
                )}
              </div>

              <Alert variant="warning" className="mb-0 small">
                <strong>{t('translations.note', 'Note')}:</strong>{' '}
                {t('translations.autoTranslationNote',
                  'Automatic translations are generated by LibreTranslate. Quality may vary - please review and edit if needed before approving.')}
              </Alert>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {isSuccess ? t('common.close', 'Close') : t('common.cancel', 'Cancel')}
          </Button>
          {!isSuccess && (
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || missingLanguages.length === 0}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('translations.requesting', 'Requesting...')}
                </>
              ) : (
                <>
                  <Translate className="me-2" />
                  {t('translations.requestTranslations', 'Request Translations')}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
