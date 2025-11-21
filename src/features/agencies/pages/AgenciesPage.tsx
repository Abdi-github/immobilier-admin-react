/**
 * Agencies Page
 *
 * Main page for agency management with list, filters, and create modal.
 */

import React, { useState, useCallback } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/shared/components/PageHeader';
import { Breadcrumb } from '@/shared/components/Breadcrumb';
import { usePermissions } from '@/shared/hooks/usePermissions';

import { AgencyList, AgencyFormModal } from '../components';
import type { Agency } from '../agencies.types';

export const AgenciesPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | undefined>(undefined);

  const canCreate = hasPermission('agencies:create');
  const canManage = hasPermission('agencies:manage');

  const handleCreate = useCallback(() => {
    setEditingAgency(undefined);
    setShowCreateModal(true);
  }, []);

  const handleEdit = useCallback((agency: Agency) => {
    setEditingAgency(agency);
    setShowCreateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingAgency(undefined);
  }, []);

  const breadcrumbItems = [
    { label: t('common.navigation.dashboard'), path: '/' },
    { label: t('agencies.title') },
  ];

  return (
    <Container fluid className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={t('agencies.title')}
        subtitle={t('agencies.subtitle')}
        actions={
          canCreate && (
            <Button variant="primary" onClick={handleCreate}>
              <i className="bi bi-plus-lg me-2"></i>
              {t('agencies.addAgency')}
            </Button>
          )
        }
      />

      {/* Agency List */}
      <AgencyList onEdit={canManage ? handleEdit : undefined} />

      {/* Create/Edit Modal */}
      <AgencyFormModal
        show={showCreateModal}
        onHide={handleCloseModal}
        agency={editingAgency}
      />
    </Container>
  );
};

export default AgenciesPage;
