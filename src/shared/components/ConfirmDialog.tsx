import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'success';
  confirmVariant?: 'primary' | 'danger' | 'warning' | 'success';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant,
  confirmVariant = 'primary',
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const buttonVariant = variant || confirmVariant;

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          {cancelLabel || t('common.actions.cancel')}
        </Button>
        <Button variant={buttonVariant} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? t('common.loading') : confirmLabel || t('common.actions.confirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
