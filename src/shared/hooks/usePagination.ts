import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  limit: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 20 } = options;

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
  });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination({ page: 1, limit });
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const reset = useCallback(() => {
    setPagination({ page: initialPage, limit: initialLimit });
  }, [initialPage, initialLimit]);

  return {
    page: pagination.page,
    limit: pagination.limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    reset,
  };
}
