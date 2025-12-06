import { useEffect } from 'react';
import { Toast as BsToast, ToastContainer as BsToastContainer } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeToast, type Toast } from '@/shared/slices/uiSlice';

const ToastItem = ({ toast }: { toast: Toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  const bgVariant = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'info',
  }[toast.type];

  return (
    <BsToast
      bg={bgVariant}
      onClose={() => dispatch(removeToast(toast.id))}
      className="text-white"
    >
      <BsToast.Header closeButton>
        <strong className="me-auto text-capitalize">{toast.type}</strong>
      </BsToast.Header>
      <BsToast.Body>{toast.message}</BsToast.Body>
    </BsToast>
  );
};

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts);

  return (
    <BsToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </BsToastContainer>
  );
}
