/**
 * Amenities by Group View Component
 */

import { Card, Row, Col, Spinner, Badge, ListGroup, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetAmenitiesByGroupQuery } from '../amenitiesApi';
import { Amenity, AmenityGroup, AMENITY_GROUPS } from '../amenities.types';
import { AmenityStatusBadge } from './AmenityStatusBadge';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface AmenitiesByGroupProps {
  onEdit: (amenity: Amenity) => void;
  onDelete: (amenity: Amenity) => void;
}

const groupColors: Record<AmenityGroup, string> = {
  general: 'primary',
  kitchen: 'warning',
  bathroom: 'info',
  outdoor: 'success',
  security: 'danger',
  parking: 'secondary',
  accessibility: 'dark',
  energy: 'success',
  other: 'light',
};

const groupIcons: Record<AmenityGroup, string> = {
  general: 'bi-house',
  kitchen: 'bi-cup-hot',
  bathroom: 'bi-droplet',
  outdoor: 'bi-tree',
  security: 'bi-shield-check',
  parking: 'bi-p-square',
  accessibility: 'bi-universal-access',
  energy: 'bi-lightning',
  other: 'bi-three-dots',
};

function GroupCard({
  group,
  onEdit,
  onDelete,
}: {
  group: AmenityGroup;
  onEdit: (amenity: Amenity) => void;
  onDelete: (amenity: Amenity) => void;
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { data, isLoading, error } = useGetAmenitiesByGroupQuery(group);

  if (isLoading) {
    return (
      <Card className="h-100 border-0 shadow-sm">
        <Card.Header className={`bg-${groupColors[group]} ${group === 'other' ? 'text-dark' : 'text-white'}`}>
          <i className={`${groupIcons[group]} me-2`}></i>
          {t(`amenities.groups.${group}`)}
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant={groupColors[group]} />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100 border-0 shadow-sm">
        <Card.Header className={`bg-${groupColors[group]} ${group === 'other' ? 'text-dark' : 'text-white'}`}>
          <i className={`${groupIcons[group]} me-2`}></i>
          {t(`amenities.groups.${group}`)}
        </Card.Header>
        <Card.Body className="text-center py-4 text-muted">
          {t('common.error')}
        </Card.Body>
      </Card>
    );
  }

  const amenities = data?.data || [];

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Header className={`bg-${groupColors[group]} ${group === 'other' ? 'text-dark' : 'text-white'} d-flex justify-content-between align-items-center`}>
        <span>
          <i className={`${groupIcons[group]} me-2`}></i>
          {t(`amenities.groups.${group}`)}
        </span>
        <Badge bg="light" text="dark">{amenities.length}</Badge>
      </Card.Header>
      <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {amenities.length === 0 ? (
          <ListGroup.Item className="text-center text-muted py-4">
            {t('amenities.noAmenities')}
          </ListGroup.Item>
        ) : (
          amenities.map((amenity: Amenity) => (
            <ListGroup.Item
              key={amenity.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-semibold">
                  {amenity.icon && (
                    <i className={`bi bi-${amenity.icon} me-2 text-muted`}></i>
                  )}
                  {getLocalizedName(amenity.name, currentLanguage)}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <AmenityStatusBadge isActive={amenity.is_active} />
                <div className="btn-group btn-group-sm">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(amenity)}
                    title={t('common.edit')}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(amenity)}
                    title={t('common.delete')}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
}

export function AmenitiesByGroup({ onEdit, onDelete }: AmenitiesByGroupProps) {
  return (
    <Row className="g-4">
      {AMENITY_GROUPS.map((group) => (
        <Col key={group} md={6} lg={4}>
          <GroupCard group={group} onEdit={onEdit} onDelete={onDelete} />
        </Col>
      ))}
    </Row>
  );
}
