/**
 * Category Form Modal Component
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../categoriesApi';
import {
  Category,
  CategorySection,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CATEGORY_SECTIONS,
  MultilingualText,
} from '../categories.types';

interface CategoryFormModalProps {
  show: boolean;
  onHide: () => void;
  category?: Category | null;
}

export function CategoryFormModal({ show, onHide, category }: CategoryFormModalProps) {
  const { t } = useTranslation();
  const isEditing = !!category;

  // Form state
  const [section, setSection] = useState<CategorySection>('residential');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [names, setNames] = useState<MultilingualText>({
    en: '',
    fr: '',
    de: '',
    it: '',
  });

  // Mutations
  const [createCategory, { isLoading: isCreating, error: createError }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, error: updateError }] =
    useUpdateCategoryMutation();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (show && category) {
      setSection(category.section);
      setSlug(category.slug);
      setIcon(category.icon || '');
      setSortOrder(category.sort_order);
      setIsActive(category.is_active);
      setNames({
        en: category.name.en || '',
        fr: category.name.fr || '',
        de: category.name.de || '',
        it: category.name.it || '',
      });
    } else if (show && !category) {
      // Reset for create
      setSection('residential');
      setSlug('');
      setIcon('');
      setSortOrder(0);
      setIsActive(true);
      setNames({ en: '', fr: '', de: '', it: '' });
    }
  }, [show, category]);

  // Auto-generate slug from English name
  const handleEnglishNameChange = (value: string) => {
    setNames((prev: MultilingualText) => ({ ...prev, en: value }));
    if (!isEditing || !slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  };

  const handleNameChange = (lang: keyof MultilingualText, value: string) => {
    if (lang === 'en') {
      handleEnglishNameChange(value);
    } else {
      setNames((prev: MultilingualText) => ({ ...prev, [lang]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && category) {
        const payload: CategoryUpdatePayload = {
          section,
          slug,
          name: names,
          icon: icon || undefined,
          sort_order: sortOrder,
          is_active: isActive,
        };
        await updateCategory({ id: category.id, data: payload }).unwrap();
      } else {
        const payload: CategoryCreatePayload = {
          section,
          slug,
          name: names,
          icon: icon || undefined,
          sort_order: sortOrder,
          is_active: isActive,
        };
        await createCategory(payload).unwrap();
      }
      onHide();
    } catch {
      // Error is handled by RTK Query
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if ('data' in error) {
      const data = error.data as { message?: string; error?: { message?: string } };
      return data.message || data.error?.message || t('common.error');
    }
    return t('common.error');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className={`bi ${isEditing ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
            {isEditing ? t('categories.editCategory') : t('categories.createCategory')}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible>
              {getErrorMessage()}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('categories.section')} *</Form.Label>
                <Form.Select
                  value={section}
                  onChange={(e) => setSection(e.target.value as CategorySection)}
                  required
                >
                  {CATEGORY_SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {t(`categories.sections.${s}`)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('categories.slug')} *</Form.Label>
                <Form.Control
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., apartment, house"
                  required
                  pattern="[a-z0-9-]+"
                />
                <Form.Text className="text-muted">
                  {t('categories.slugHelp')}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>{t('categories.names')} *</Form.Label>
            <Tabs defaultActiveKey="en" className="mb-2">
              <Tab eventKey="en" title="🇬🇧 English">
                <Form.Control
                  type="text"
                  value={names.en}
                  onChange={(e) => handleNameChange('en', e.target.value)}
                  placeholder={t('categories.namePlaceholder', { lang: 'English' })}
                  required
                />
              </Tab>
              <Tab eventKey="fr" title="🇫🇷 Français">
                <Form.Control
                  type="text"
                  value={names.fr}
                  onChange={(e) => handleNameChange('fr', e.target.value)}
                  placeholder={t('categories.namePlaceholder', { lang: 'French' })}
                  required
                />
              </Tab>
              <Tab eventKey="de" title="🇩🇪 Deutsch">
                <Form.Control
                  type="text"
                  value={names.de}
                  onChange={(e) => handleNameChange('de', e.target.value)}
                  placeholder={t('categories.namePlaceholder', { lang: 'German' })}
                  required
                />
              </Tab>
              <Tab eventKey="it" title="🇮🇹 Italiano">
                <Form.Control
                  type="text"
                  value={names.it}
                  onChange={(e) => handleNameChange('it', e.target.value)}
                  placeholder={t('categories.namePlaceholder', { lang: 'Italian' })}
                  required
                />
              </Tab>
            </Tabs>
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('categories.icon')}</Form.Label>
                <Form.Control
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g., house, building"
                />
                <Form.Text className="text-muted">
                  {t('categories.iconHelp')}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('categories.sortOrder')}</Form.Label>
                <Form.Control
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group>
            <Form.Check
              type="switch"
              id="is-active"
              label={t('categories.isActive')}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1"></i>
                {isEditing ? t('common.save') : t('common.create')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
