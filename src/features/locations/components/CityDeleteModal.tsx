/**
 * City Delete Confirm Modal Component
 */

import { Modal, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import { City } from '../locations.types';
import { useDeleteCityMutation } from '../locationsApi';
import { useToast } from '@/shared/hooks/useToast';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface CityDeleteModalProps {
  show: boolean;
  city: City | null;
  onHide: () => void;
}

export function CityDeleteModal({ show, city, onHide }: CityDeleteModalProps) {
  const { t, i18n } = useTranslation();
  const { success, error } = useToast();
  const currentLanguage = i18n.language;
  const [deleteCity, { isLoading }] = useDeleteCityMutation();

  const handleDelete = async () => {
    if (!city) return;

    try {
      await deleteCity(city.id).unwrap();
      success(t('locations.cities.deleteSuccess'));
      onHide();
    } catch (err) {
      error(t('locations.cities.deleteError'));
      console.error('Error deleting city:', err);
    }
  };

  if (!city) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <ExclamationTriangle className="me-2" />
          {t('locations.cities.deleteTitle')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t('locations.cities.deleteConfirm', {
            name: getLocalizedName(city.name, currentLanguage),
            postalCode: city.postal_code,
          })}
        </p>
        <p className="text-muted small">
          {t('locations.cities.deleteWarning')}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t('common.deleting')}
            </>
          ) : (
            t('common.delete')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
