import { Table, Pagination as BsPagination } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (item: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  keyExtractor,
  onSort,
  sortKey,
  sortDirection,
  pagination,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-muted p-4">
        {emptyMessage || t('common.noData')}
      </div>
    );
  }

  return (
    <>
      <Table responsive hover>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.header}
                {col.sortable && renderSortIcon(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center">
          <BsPagination>
            <BsPagination.First
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
            />
            <BsPagination.Prev
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            />
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              return (
                <BsPagination.Item
                  key={pageNum}
                  active={pageNum === pagination.page}
                  onClick={() => pagination.onPageChange(pageNum)}
                >
                  {pageNum}
                </BsPagination.Item>
              );
            })}
            <BsPagination.Next
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            />
            <BsPagination.Last
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            />
          </BsPagination>
        </div>
      )}
    </>
  );
}
