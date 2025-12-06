import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | undefined;
  variant?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ 
  size, 
  variant = 'primary', 
  fullPage = false 
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant={variant} />
      </div>
    );
  }

  return <Spinner animation="border" variant={variant} size={size} />;
}
