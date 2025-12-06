import { Modal, Button, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'warning' | 'success' | 'secondary' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onHide: () => void;
}

export function ConfirmModal({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  isLoading = false,
  onConfirm,
  onHide,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide} centered backdrop={isLoading ? 'static' : true}>
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          {cancelLabel || t('common.actions.cancel')}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              {t('common.loading')}
            </>
          ) : (
            confirmLabel || t('common.actions.confirm')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
