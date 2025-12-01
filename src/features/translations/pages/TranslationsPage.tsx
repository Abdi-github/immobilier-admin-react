/**
 * Translations Page Component
 * 
 * Manages property translations and approvals.
 */

import { useState } from 'react';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Translate, CheckAll, ArrowClockwise } from 'react-bootstrap-icons';
import {
  TranslationList,
  TranslationViewModal,
  TranslationApproveModal,
  TranslationRejectModal,
  TranslationStatistics,
  RequestTranslationModal,
} from '../components';
import { PropertyTranslation } from '../translations.types';
import { useBulkApproveTranslationsMutation, useGetTranslationStatisticsQuery } from '../translationsApi';

export function TranslationsPage() {
  const { t } = useTranslation();
  
  // Statistics query
  const { refetch: refetchStats } = useGetTranslationStatisticsQuery();

  // Modal state
  const [showView, setShowView] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<PropertyTranslation | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk approve mutation
  const [bulkApprove, { isLoading: isBulkApproving }] = useBulkApproveTranslationsMutation();

  // Handlers
  const handleView = (translation: PropertyTranslation) => {
    setSelectedTranslation(translation);
    setShowView(true);
  };

  const handleApprove = (translation: PropertyTranslation) => {
    setSelectedTranslation(translation);
    setShowApprove(true);
  };

  const handleReject = (translation: PropertyTranslation) => {
    setSelectedTranslation(translation);
    setShowReject(true);
  };

  const handleCloseView = () => {
    setShowView(false);
    setSelectedTranslation(null);
  };

  const handleCloseApprove = () => {
    setShowApprove(false);
    setSelectedTranslation(null);
  };

  const handleCloseReject = () => {
    setShowReject(false);
    setSelectedTranslation(null);
  };

  const handleCloseRequest = () => {
    setShowRequest(false);
    setSelectedTranslation(null);
  };

  const handleRequestTranslation = (translation: PropertyTranslation) => {
    setSelectedTranslation(translation);
    setShowRequest(true);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await bulkApprove({ ids: selectedIds }).unwrap();
      setSelectedIds([]);
    } catch {
      // Error handled by RTK Query
    }
  };

  const handleRefresh = () => {
    refetchStats();
  };

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1">
                <Translate className="me-2" />
                {t('translations.pageTitle')}
              </h2>
              <p className="text-muted mb-0">
                {t('translations.pageDescription')}
              </p>
            </div>
            <ButtonGroup>
              <Button
                variant="outline-secondary"
                onClick={handleRefresh}
                title={t('common.refresh', 'Refresh')}
              >
                <ArrowClockwise className="me-1" />
                {t('common.refresh', 'Refresh')}
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  variant="success"
                  onClick={handleBulkApprove}
                  disabled={isBulkApproving}
                >
                  <CheckAll className="me-1" />
                  {t('translations.bulkApprove', 'Approve Selected')} ({selectedIds.length})
                </Button>
              )}
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      <Row className="mb-4">
        <Col>
          <TranslationStatistics />
        </Col>
      </Row>

      {/* Translation List */}
      <Row>
        <Col>
          <TranslationList
            onView={handleView}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestTranslation={handleRequestTranslation}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </Col>
      </Row>

      {/* Modals */}
      <TranslationViewModal
        show={showView}
        translation={selectedTranslation}
        onHide={handleCloseView}
      />
      <TranslationApproveModal
        show={showApprove}
        translation={selectedTranslation}
        onHide={handleCloseApprove}
      />
      <TranslationRejectModal
        show={showReject}
        translation={selectedTranslation}
        onHide={handleCloseReject}
      />
      {selectedTranslation && (
        <RequestTranslationModal
          show={showRequest}
          onHide={handleCloseRequest}
          propertyId={selectedTranslation.property_id}
          propertyExternalId={selectedTranslation.property?.external_id}
          sourceLanguage={selectedTranslation.property?.source_language}
          existingLanguages={[selectedTranslation.language]}
        />
      )}
    </Container>
  );
}
