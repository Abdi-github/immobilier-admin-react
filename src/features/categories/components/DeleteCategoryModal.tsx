/**
 * Delete Category Confirm Modal
 */

import { Modal, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDeleteCategoryMutation } from '../categoriesApi';
import { Category } from '../categories.types';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface DeleteCategoryModalProps {
  show: boolean;
  onHide: () => void;
  category: Category | null;
}

export function DeleteCategoryModal({ show, onHide, category }: DeleteCategoryModalProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation();

  const handleDelete = async () => {
    if (!category) return;

    try {
      await deleteCategory(category.id).unwrap();
      onHide();
    } catch {
      // Error handled by RTK Query
    }
  };

  if (!category) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {t('categories.deleteCategory')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{t('categories.deleteConfirmation')}</p>
        <div className="bg-light rounded p-3">
          <strong>{getLocalizedName(category.name, currentLanguage)}</strong>
          <br />
          <small className="text-muted">
            {t('categories.slug')}: <code>{category.slug}</code>
          </small>
        </div>
        <p className="text-danger mt-3 mb-0">
          <i className="bi bi-exclamation-circle me-1"></i>
          {t('categories.deleteWarning')}
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
