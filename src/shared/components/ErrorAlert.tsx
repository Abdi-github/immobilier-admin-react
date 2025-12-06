import { Alert, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ErrorAlertProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorAlert({ title, message, onRetry }: ErrorAlertProps) {
  const { t } = useTranslation();

  return (
    <Alert variant="danger">
      {title && <Alert.Heading>{title}</Alert.Heading>}
      <div className="d-flex justify-content-between align-items-center">
        <span>{message || t('common.errors.generic')}</span>
        {onRetry && (
          <Button variant="outline-danger" size="sm" onClick={onRetry}>
            {t('common.actions.retry')}
          </Button>
        )}
      </div>
    </Alert>
  );
}
