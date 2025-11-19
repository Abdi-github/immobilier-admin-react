import { Card, Row, Col, Table, Badge, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import type { Property, SupportedLanguage } from '../properties.types';
import { StatusBadge } from './StatusBadge';
import { ApprovalActions } from './ApprovalActions';
import { formatCurrency, formatDate, formatNumber } from '@/shared/utils/formatters';

interface PropertyDetailsProps {
  property: Property;
  onRefresh?: () => void;
}

// Helper to get localized name from string or multilingual object
function getLocalizedValue(
  value: string | Record<SupportedLanguage, string> | undefined,
  language: string
): string {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  return value[language as SupportedLanguage] || value.en || Object.values(value)[0] || '-';
}

export function PropertyDetails({ property, onRefresh }: PropertyDetailsProps) {
  const { t, i18n } = useTranslation();

  // Get the translation data from the new API structure or fallback to legacy
  const getTranslation = () => {
    // New structure: root-level title/description and translation object
    if (property.title && property.translation) {
      return {
        title: property.title,
        description: property.description || '',
        source: property.translation.source,
        quality_score: property.translation.quality_score,
        language: i18n.language as SupportedLanguage,
      };
    }
    // Fallback to legacy translations array
    return (
      property.translations?.find((t) => t.language === i18n.language) ||
      property.translations?.find((t) => t.language === property.source_language) ||
      property.translations?.[0]
    );
  };

  const translation = getTranslation();
  const categoryName =
    property.category?.name?.[i18n.language as keyof typeof property.category.name] ||
    property.category?.name?.en ||
    '-';

  return (
    <div className="property-details">
      {/* Header with status and actions */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-1">{translation?.title || property.address}</h4>
          <p className="text-muted mb-2">{property.external_id}</p>
          <StatusBadge status={property.status} />
        </div>
        <ApprovalActions property={property} onSuccess={onRefresh} />
      </div>

      {/* Rejection reason if applicable */}
      {property.status === 'REJECTED' && property.rejection_reason && (
        <div className="alert alert-danger d-flex align-items-start mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2 mt-1" />
          <div>
            <strong>{t('properties.rejectionReason')}:</strong>
            <p className="mb-0">{property.rejection_reason}</p>
          </div>
        </div>
      )}

      <Row className="g-4">
        {/* Main Info */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2" />
                {t('properties.details.basicInfo')}
              </h5>
            </Card.Header>
            <Card.Body>
              <Table borderless>
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: '200px' }}>
                      {t('properties.fields.transactionType')}
                    </td>
                    <td>
                      <Badge bg={property.transaction_type === 'rent' ? 'info' : 'primary'}>
                        {t(`properties.transactionType.${property.transaction_type}`)}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t('properties.fields.category')}</td>
                    <td>{categoryName}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t('properties.fields.price')}</td>
                    <td className="fw-bold">
                      {formatCurrency(property.price, property.currency)}
                      {property.additional_costs && (
                        <small className="text-muted ms-2">
                          + {formatCurrency(property.additional_costs, property.currency)}{' '}
                          {t('properties.additionalCosts')}
                        </small>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t('properties.fields.rooms')}</td>
                    <td>{property.rooms ? formatNumber(property.rooms) : '-'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">{t('properties.fields.surface')}</td>
                    <td>{property.surface ? `${formatNumber(property.surface)} m²` : '-'}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Description */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-text-paragraph me-2" />
                {t('properties.details.description')}
              </h5>
            </Card.Header>
            <Card.Body>
              {translation?.description ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{translation.description}</div>
              ) : (
                <p className="text-muted">{t('properties.noDescription')}</p>
              )}
            </Card.Body>
          </Card>

          {/* Translations */}
          {property.translations && property.translations.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-translate me-2" />
                  {t('properties.details.translations')}
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('properties.translations.language')}</th>
                      <th>{t('properties.translations.source')}</th>
                      <th>{t('properties.translations.status')}</th>
                      <th>{t('properties.translations.quality')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.translations.map((trans) => (
                      <tr key={trans._id}>
                        <td>
                          <Badge bg="secondary">{trans.language.toUpperCase()}</Badge>
                          {trans.language === property.source_language && (
                            <Badge bg="light" text="dark" className="ms-1">
                              {t('properties.translations.original')}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <Badge
                            bg={
                              trans.source === 'original'
                                ? 'success'
                                : trans.source === 'human'
                                  ? 'info'
                                  : 'warning'
                            }
                          >
                            {trans.source}
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={
                              trans.approval_status === 'APPROVED'
                                ? 'success'
                                : trans.approval_status === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {trans.approval_status}
                          </Badge>
                        </td>
                        <td>
                          {trans.quality_score ? (
                            <span>{trans.quality_score}%</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Images */}
          {property.images && property.images.length > 0 && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-images me-2" />
                  {t('properties.details.images')} ({property.images.length})
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-2">
                  {property.images.map((image) => (
                    <Col key={image.id} xs={6} md={4} lg={3}>
                      <div
                        className="position-relative rounded overflow-hidden"
                        style={{ paddingBottom: '75%' }}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || 'Property'}
                          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Available`;
                          }}
                        />
                        {image.is_primary && (
                          <Badge
                            bg="primary"
                            className="position-absolute top-0 start-0 m-1"
                          >
                            {t('properties.primaryImage')}
                          </Badge>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Location */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-geo-alt me-2" />
                {t('properties.details.location')}
              </h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">{t('properties.fields.address')}</span>
                <span>{property.address}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">{t('properties.fields.city')}</span>
                <span>{getLocalizedValue(property.city?.name, i18n.language)}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">{t('properties.fields.canton')}</span>
                <span>
                  {getLocalizedValue(property.canton?.name, i18n.language)} ({property.canton?.code || ''})
                </span>
              </ListGroup.Item>
              {property.postal_code && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">{t('properties.fields.postalCode')}</span>
                  <span>{property.postal_code}</span>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          {/* Proximity */}
          {property.proximity && Object.keys(property.proximity).length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-signpost-2 me-2" />
                  {t('properties.details.proximity', 'Nearby Places')}
                </h5>
              </Card.Header>
              <ListGroup variant="flush">
                {Object.entries(property.proximity).map(([place, distance]) => (
                  <ListGroup.Item key={place} className="d-flex justify-content-between">
                    <span className="text-muted">{place}</span>
                    <span>{distance}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}

          {/* Agency/Owner */}
          {property.agency && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-building me-2" />
                  {t('properties.details.agency')}
                </h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0 fw-medium">{property.agency.name}</p>
              </Card.Body>
            </Card>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-check2-square me-2" />
                  {t('properties.details.amenities')}
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <Badge key={amenity._id || amenity.id} bg="light" text="dark">
                      {amenity.name
                        ? amenity.name[i18n.language as keyof typeof amenity.name] ||
                          amenity.name.en ||
                          Object.values(amenity.name)[0] ||
                          '-'
                        : '-'}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2" />
                {t('properties.details.metadata')}
              </h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">{t('properties.fields.createdAt')}</span>
                <span>{formatDate(property.created_at)}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">{t('properties.fields.updatedAt')}</span>
                <span>{formatDate(property.updated_at)}</span>
              </ListGroup.Item>
              {property.published_at && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">{t('properties.fields.publishedAt')}</span>
                  <span>{formatDate(property.published_at)}</span>
                </ListGroup.Item>
              )}
              {property.reviewed_at && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span className="text-muted">{t('properties.fields.reviewedAt')}</span>
                  <span>{formatDate(property.reviewed_at)}</span>
                </ListGroup.Item>
              )}
              <ListGroup.Item className="d-flex justify-content-between">
                <span className="text-muted">{t('properties.fields.sourceLanguage')}</span>
                <Badge bg="secondary">{property.source_language.toUpperCase()}</Badge>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
