/**
 * Delete Amenity Confirm Modal
 */

import { Modal, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDeleteAmenityMutation } from '../amenitiesApi';
import { Amenity } from '../amenities.types';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface DeleteAmenityModalProps {
  show: boolean;
  onHide: () => void;
  amenity: Amenity | null;
}

export function DeleteAmenityModal({ show, onHide, amenity }: DeleteAmenityModalProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [deleteAmenity, { isLoading }] = useDeleteAmenityMutation();

  const handleDelete = async () => {
    if (!amenity) return;

    try {
      await deleteAmenity(amenity.id).unwrap();
      onHide();
    } catch {
      // Error handled by RTK Query
    }
  };

  if (!amenity) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {t('amenities.deleteAmenity')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{t('amenities.deleteConfirmation')}</p>
        <div className="bg-light rounded p-3">
          <strong>{getLocalizedName(amenity.name, currentLanguage)}</strong>
          <br />
          <small className="text-muted">
            {t('amenities.group')}: {t(`amenities.groups.${amenity.group}`)}
          </small>
        </div>
        <p className="text-danger mt-3 mb-0">
          <i className="bi bi-exclamation-circle me-1"></i>
          {t('amenities.deleteWarning')}
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              {t('common.deleting')}
            </>
          ) : (
            <>
              <i className="bi bi-trash me-1"></i>
              {t('common.delete')}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
