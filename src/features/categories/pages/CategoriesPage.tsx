/**
 * Categories Page
 */

import { useState } from 'react';
import { Container, Button, Card, Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/shared/hooks/usePermissions';
import {
  CategoryList,
  CategoryFormModal,
  DeleteCategoryModal,
  CategoriesBySection,
} from '../components';
import { Category } from '../categories.types';

export function CategoriesPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // View state
  const [activeTab, setActiveTab] = useState<'list' | 'sections'>('list');

  const canCreate = hasPermission('categories:create');
  const canDelete = hasPermission('categories:delete');

  const handleCreate = () => {
    setSelectedCategory(null);
    setShowFormModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowFormModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="bi bi-tags me-2"></i>
            {t('categories.title')}
          </h1>
          <p className="text-muted mb-0">{t('categories.description')}</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={handleCreate}>
            <i className="bi bi-plus-circle me-2"></i>
            {t('categories.createCategory')}
          </Button>
        )}
      </div>

      {/* View Tabs */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom-0 pt-3 pb-0">
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'list' | 'sections')}>
            <Nav.Item>
              <Nav.Link eventKey="list" className="px-4">
                <i className="bi bi-list-ul me-2"></i>
                {t('categories.viewList')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="sections" className="px-4">
                <i className="bi bi-grid me-2"></i>
                {t('categories.viewBySection')}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'list' ? (
        <CategoryList
          onEdit={handleEdit}
          onDelete={canDelete ? handleDelete : () => {}}
        />
      ) : (
        <CategoriesBySection
          onEdit={handleEdit}
          onDelete={canDelete ? handleDelete : () => {}}
        />
      )}

      {/* Form Modal */}
      <CategoryFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        category={selectedCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        category={selectedCategory}
      />
    </Container>
  );
}
