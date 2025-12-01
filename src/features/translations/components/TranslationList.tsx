/**
 * Translation List Component
 */

import { useState } from 'react';
import { Table, Card, Button, Form, Row, Col, Spinner, InputGroup, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Search, CheckCircle, XCircle, Eye, Translate, Robot } from 'react-bootstrap-icons';
import { useGetTranslationsQuery } from '../translationsApi';
import { PropertyTranslation, TranslationApprovalStatus, TranslationSource, LanguageCode } from '../translations.types';

interface TranslationListProps {
  onApprove: (translation: PropertyTranslation) => void;
  onReject: (translation: PropertyTranslation) => void;
  onView: (translation: PropertyTranslation) => void;
  onRequestTranslation?: (translation: PropertyTranslation) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const languageFlags: Record<LanguageCode, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
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

export function TranslationList({ 
  onApprove, 
  onReject, 
  onView,
  onRequestTranslation,
  selectedIds = [],
  onSelectionChange,
}: TranslationListProps) {
  const { t } = useTranslation();


  // Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState<LanguageCode | ''>('');
  const [status, setStatus] = useState<TranslationApprovalStatus | ''>('');
  const [source, setSource] = useState<TranslationSource | ''>('');

  // Query
  const { data, isLoading, isFetching, error } = useGetTranslationsQuery({
    page,
    limit,
    search: search || undefined,
    language: language || undefined,
    approval_status: status || undefined,
    source: source || undefined,
    sort: '-created_at',
  });

  const translations = data?.data || [];
  const pagination = data?.meta;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setLanguage('');
    setStatus('');
    setSource('');
    setPage(1);
  };

  const truncateText = (text: string, maxLength: number = 60): string => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleToggleSelection = (id: string) => {
    if (!onSelectionChange) return;
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleToggleAll = () => {
    if (!onSelectionChange) return;
    const pendingTranslations = translations.filter(t => t.approval_status === 'PENDING');
    if (pendingTranslations.length === 0) return;
    
    const pendingIds = pendingTranslations.map(t => t.id);
    const allSelected = pendingIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      onSelectionChange(selectedIds.filter(id => !pendingIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedIds, ...pendingIds])]);
    }
  };

  const pendingTranslations = translations.filter(t => t.approval_status === 'PENDING');
  const allPendingSelected = pendingTranslations.length > 0 && 
    pendingTranslations.every(t => selectedIds.includes(t.id));

  if (error) {
    return (
      <div className="alert alert-danger">
        {t('common.error')}: {t('translations.fetchError')}
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white py-3">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">
              <Translate className="me-2" />
              {t('translations.title')}
            </h5>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* Filters */}
        <Form onSubmit={handleSearchSubmit} className="mb-4">
          <Row className="g-3">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={t('translations.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as LanguageCode | '');
                  setPage(1);
                }}
              >
                <option value="">{t('translations.allLanguages')}</option>
                <option value="en">{languageFlags.en} English</option>
                <option value="fr">{languageFlags.fr} French</option>
                <option value="de">{languageFlags.de} German</option>
                <option value="it">{languageFlags.it} Italian</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as TranslationApprovalStatus | '');
                  setPage(1);
                }}
              >
                <option value="">{t('translations.allStatuses')}</option>
                <option value="PENDING">{t('translations.statuses.PENDING')}</option>
                <option value="APPROVED">{t('translations.statuses.APPROVED')}</option>
                <option value="REJECTED">{t('translations.statuses.REJECTED')}</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value as TranslationSource | '');
                  setPage(1);
                }}
              >
                <option value="">{t('translations.allSources')}</option>
                <option value="original">{t('translations.sources.original')}</option>
                <option value="human">{t('translations.sources.human')}</option>
                <option value="deepl">{t('translations.sources.deepl')}</option>
                <option value="machine">{t('translations.sources.machine')}</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button type="submit" variant="outline-primary">
                {t('common.search')}
              </Button>
              <Button variant="outline-secondary" onClick={handleClearFilters}>
                {t('common.clear')}
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Loading indicator */}
        {(isLoading || isFetching) && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  {onSelectionChange && (
                    <th style={{ width: '40px' }}>
                      <Form.Check
                        type="checkbox"
                        checked={allPendingSelected}
                        onChange={handleToggleAll}
                        disabled={pendingTranslations.length === 0}
                        title={t('common.selectAll', 'Select All Pending')}
                      />
                    </th>
                  )}
                  <th>{t('translations.property')}</th>
                  <th>{t('translations.language')}</th>
                  <th style={{ minWidth: '200px' }}>Title</th>
                  <th>{t('translations.source')}</th>
                  <th>{t('translations.qualityScore')}</th>
                  <th>{t('translations.status')}</th>
                  <th className="text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {translations.length === 0 ? (
                  <tr>
                    <td colSpan={onSelectionChange ? 8 : 7} className="text-center py-4 text-muted">
                      {t('translations.noResults')}
                    </td>
                  </tr>
                ) : (
                  translations.map((translation) => (
                    <tr key={translation.id}>
                      {onSelectionChange && (
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedIds.includes(translation.id)}
                            onChange={() => handleToggleSelection(translation.id)}
                            disabled={translation.approval_status !== 'PENDING'}
                          />
                        </td>
                      )}
                      <td>
                        <span className="text-muted small">
                          {translation.property?.external_id || translation.property_id.substring(0, 8)}
                        </span>
                      </td>
                      <td>
                        <span className="fs-5">{languageFlags[translation.language]}</span>
                        <span className="ms-1 text-uppercase small">{translation.language}</span>
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{translation.title}</Tooltip>}
                        >
                          <span className="d-block text-truncate" style={{ maxWidth: '200px' }}>
                            {truncateText(translation.title, 40)}
                          </span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        <Badge bg={sourceVariants[translation.source]} className="text-capitalize">
                          {t(`translations.sources.${translation.source}`)}
                        </Badge>
                      </td>
                      <td>
                        {translation.quality_score !== undefined && translation.quality_score !== null ? (
                          <Badge bg={translation.quality_score >= 80 ? 'success' : translation.quality_score >= 50 ? 'warning' : 'danger'}>
                            {translation.quality_score}%
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={statusVariants[translation.approval_status]}>
                          {t(`translations.statuses.${translation.approval_status}`)}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => onView(translation)}
                          title={t('translations.viewTranslation')}
                        >
                          <Eye />
                        </Button>
                        {translation.approval_status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-1"
                              onClick={() => onApprove(translation)}
                              title={t('common.approve')}
                            >
                              <CheckCircle />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-1"
                              onClick={() => onReject(translation)}
                              title={t('common.reject')}
                            >
                              <XCircle />
                            </Button>
                          </>
                        )}
                        {onRequestTranslation && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onRequestTranslation(translation)}
                            title={t('translations.requestTranslations', 'Request Translations')}
                          >
                            <Robot />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              {t('common.showingOf', {
                showing: translations.length,
                total: pagination.total,
              })}
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    {t('common.previous')}
                  </button>
                </li>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    {t('common.next')}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
