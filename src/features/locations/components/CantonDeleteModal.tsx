/**
 * Canton Delete Confirm Modal Component
 */

import { Modal, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import { Canton } from '../locations.types';
import { useDeleteCantonMutation } from '../locationsApi';
import { useToast } from '@/shared/hooks/useToast';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface CantonDeleteModalProps {
  show: boolean;
  canton: Canton | null;
  onHide: () => void;
}

export function CantonDeleteModal({ show, canton, onHide }: CantonDeleteModalProps) {
  const { t, i18n } = useTranslation();
  const { success, error } = useToast();
  const currentLanguage = i18n.language;
  const [deleteCanton, { isLoading }] = useDeleteCantonMutation();

  const handleDelete = async () => {
    if (!canton) return;

    try {
      await deleteCanton(canton.id).unwrap();
      success(t('locations.cantons.deleteSuccess'));
      onHide();
    } catch (err) {
      error(t('locations.cantons.deleteError'));
      console.error('Error deleting canton:', err);
    }
  };

  if (!canton) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <ExclamationTriangle className="me-2" />
          {t('locations.cantons.deleteTitle')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t('locations.cantons.deleteConfirm', {
            name: getLocalizedName(canton.name, currentLanguage),
            code: canton.code,
          })}
        </p>
        <p className="text-muted small">
          {t('locations.cantons.deleteWarning')}
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
