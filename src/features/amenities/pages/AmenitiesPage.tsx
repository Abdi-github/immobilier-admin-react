/**
 * Amenities Page
 */

import { useState } from 'react';
import { Container, Button, Card, Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/shared/hooks/usePermissions';
import {
  AmenityList,
  AmenityFormModal,
  DeleteAmenityModal,
  AmenitiesByGroup,
} from '../components';
import { Amenity } from '../amenities.types';

export function AmenitiesPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  // View state
  const [activeTab, setActiveTab] = useState<'list' | 'groups'>('list');

  const canCreate = hasPermission('amenities:create');
  const canDelete = hasPermission('amenities:delete');

  const handleCreate = () => {
    setSelectedAmenity(null);
    setShowFormModal(true);
  };

  const handleEdit = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setShowFormModal(true);
  };

  const handleDelete = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setShowDeleteModal(true);
  };

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-check2-square me-2"></i>
            {t('amenities.title')}
          </h1>
          <p className="text-muted mb-0">{t('amenities.description')}</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={handleCreate}>
            <i className="bi bi-plus-circle me-2"></i>
            {t('amenities.createAmenity')}
          </Button>
        )}
      </div>

      {/* View Toggle */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="py-2">
          <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'list' | 'groups')}>
            <Nav.Item>
              <Nav.Link eventKey="list">
                <i className="bi bi-list-ul me-1"></i>
                {t('amenities.listView')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="groups">
                <i className="bi bi-grid me-1"></i>
                {t('amenities.groupView')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* Content */}
      {activeTab === 'list' ? (
        <AmenityList onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <AmenitiesByGroup onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Modals */}
      <AmenityFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        amenity={selectedAmenity}
      />

      {canDelete && (
        <DeleteAmenityModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          amenity={selectedAmenity}
        />
      )}
    </Container>
  );
}
