import React, { useState, useCallback } from 'react';
import {
  Table,
  Form,
  Button,
  Dropdown,
  InputGroup,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { Pagination } from '@/shared/components/Pagination';
import { useToast } from '@/shared/hooks/useToast';
import type { ApiError } from '@/shared/types';

import type { User, UserType, UserStatus, UserQueryParams } from '../users.types';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useSuspendUserMutation,
  useActivateUserMutation,
} from '../usersApi';

import { UserStatusBadge } from './UserStatusBadge';
import { UserTypeBadge } from './UserTypeBadge';

interface UserListProps {
  onEditUser?: (user: User) => void;
}

const USER_TYPES: UserType[] = [
  'end_user',
  'owner',
  'agent',
  'agency_admin',
  'platform_admin',
  'super_admin',
];

const USER_STATUSES: UserStatus[] = ['active', 'pending', 'suspended', 'inactive'];

export const UserList: React.FC<UserListProps> = ({ onEditUser }) => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToast();

  // Query state
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    sort: 'created_at',
    order: 'desc',
  });

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // API hooks
  const { data, isLoading, error } = useGetUsersQuery(queryParams);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();

  const users = data?.data || [];
  const pagination = data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Handlers
  const handleSearch = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 1,
    }));
  }, [searchInput]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (
    key: keyof UserQueryParams,
    value: string | undefined
  ) => {
    setQueryParams((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
    setSelectedIds(new Set());
  };

  const handleSort = (field: string) => {
    setQueryParams((prev) => ({
      ...prev,
      sort: field,
      order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id).unwrap();
      showSuccess(t('users.messages.deleted'));
      setUserToDelete(null);
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('users.errors.deleteFailed'));
    }
  };

  const handleSuspend = async (user: User) => {
    try {
      await suspendUser(user.id).unwrap();
      showSuccess(t('users.messages.suspended'));
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('users.errors.suspendFailed'));
    }
  };

  const handleActivate = async (user: User) => {
    try {
      await activateUser(user.id).unwrap();
      showSuccess(t('users.messages.activated'));
    } catch (err) {
      const apiError = err as ApiError;
      showError(apiError.data?.error?.message || t('users.errors.activateFailed'));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getSortIcon = (field: string) => {
    if (queryParams.sort !== field) return 'bi-arrow-down-up';
    return queryParams.order === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  };

  if (error) {
    return (
      <Alert variant="danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {t('users.errors.loadFailed')}
      </Alert>
    );
  }

  return (
    <div className="user-list">
      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <InputGroup style={{ maxWidth: '300px' }}>
          <Form.Control
            type="text"
            placeholder={t('common.actions.search')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <Button variant="outline-secondary" onClick={handleSearch}>
            <i className="bi bi-search"></i>
          </Button>
        </InputGroup>

        <Form.Select
          style={{ maxWidth: '180px' }}
          value={queryParams.user_type || ''}
          onChange={(e) => handleFilterChange('user_type', e.target.value)}
        >
          <option value="">{t('users.filters.allTypes')}</option>
          {USER_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`users.types.${type}`)}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          style={{ maxWidth: '180px' }}
          value={queryParams.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">{t('users.filters.allStatuses')}</option>
          {USER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`users.status.${status}`)}
            </option>
          ))}
        </Form.Select>

        {selectedIds.size > 0 && (
          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="text-muted">
              {t('users.selectedCount', { count: selectedIds.size })}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <Table hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: '40px' }}>
                <Form.Check
                  type="checkbox"
                  checked={selectedIds.size === users.length && users.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('first_name')}
              >
                {t('users.columns.name')}
                <i className={`bi ${getSortIcon('first_name')} ms-1`}></i>
              </th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('email')}
              >
                {t('users.columns.email')}
                <i className={`bi ${getSortIcon('email')} ms-1`}></i>
              </th>
              <th>{t('users.columns.type')}</th>
              <th>{t('users.columns.status')}</th>
              <th>{t('users.columns.verified')}</th>
              <th
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('created_at')}
              >
                {t('users.columns.createdAt')}
                <i className={`bi ${getSortIcon('created_at')} ms-1`}></i>
              </th>
              <th style={{ width: '100px' }}>{t('users.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-5 text-muted">
                  {t('users.noResults')}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/users/${user.id}`}
                      className="text-decoration-none"
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                          style={{ width: '36px', height: '36px', fontSize: '14px' }}
                        >
                          {user.first_name.charAt(0)}
                          {user.last_name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          {user.agency && (
                            <small className="text-muted">
                              {user.agency.name}
                            </small>
                          )}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} className="text-decoration-none">
                      {user.email}
                    </a>
                  </td>
                  <td>
                    <UserTypeBadge userType={user.user_type} size="sm" />
                  </td>
                  <td>
                    <UserStatusBadge status={user.status} size="sm" />
                  </td>
                  <td>
                    {user.email_verified ? (
                      <i className="bi bi-check-circle-fill text-success"></i>
                    ) : (
                      <i className="bi bi-x-circle-fill text-danger"></i>
                    )}
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant="link"
                        className="text-muted p-0"
                        id={`dropdown-${user.id}`}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={Link} to={`/users/${user.id}`}>
                          <i className="bi bi-eye me-2"></i>
                          {t('common.actions.view')}
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => onEditUser?.(user)}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          {t('common.actions.edit')}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {user.status === 'active' ? (
                          <Dropdown.Item
                            onClick={() => handleSuspend(user)}
                            disabled={isSuspending}
                            className="text-warning"
                          >
                            <i className="bi bi-pause-circle me-2"></i>
                            {t('users.actions.suspend')}
                          </Dropdown.Item>
                        ) : user.status === 'suspended' ? (
                          <Dropdown.Item
                            onClick={() => handleActivate(user)}
                            disabled={isActivating}
                            className="text-success"
                          >
                            <i className="bi bi-play-circle me-2"></i>
                            {t('users.actions.activate')}
                          </Dropdown.Item>
                        ) : null}
                        <Dropdown.Item
                          onClick={() => setUserToDelete(user)}
                          className="text-danger"
                        >
                          <i className="bi bi-trash me-2"></i>
                          {t('common.actions.delete')}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={!!userToDelete}
        onHide={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title={t('users.deleteModal.title')}
        message={t('users.deleteModal.message', {
          name: userToDelete
            ? `${userToDelete.first_name} ${userToDelete.last_name}`
            : '',
        })}
        confirmLabel={t('common.actions.delete')}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UserList;
