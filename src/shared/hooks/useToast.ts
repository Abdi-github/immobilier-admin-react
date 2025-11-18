import { useCallback } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { addToast, type Toast } from '@/shared/slices/uiSlice';

type ToastType = Toast['type'];

export function useToast() {
  const dispatch = useAppDispatch();

  const showToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      dispatch(addToast({ type, message, duration }));
    },
    [dispatch]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast('success', message, duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast('error', message, duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast('warning', message, duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast('info', message, duration),
    [showToast]
  );

  return { success, error, warning, info };
}
