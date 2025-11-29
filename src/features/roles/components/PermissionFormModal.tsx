/**
 * Permission Form Modal Component
 *
 * Modal form for creating and editing permissions.
 */

import { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useGetPermissionResourcesQuery,
} from '../rolesApi';
import { PERMISSION_ACTIONS } from '../roles.types';
import type { Permission, PermissionCreatePayload, PermissionAction, MultilingualText } from '../roles.types';

interface PermissionFormModalProps {
  show: boolean;
  permission: Permission | null;
  onClose: () => void;
}

export function PermissionFormModal({ show, permission, onClose }: PermissionFormModalProps) {
  const { t } = useTranslation();
  const isEditing = !!permission?.id;

  // Form state
  const [formData, setFormData] = useState<PermissionCreatePayload>({
    name: '',
    display_name: { en: '', fr: '', de: '', it: '' },
    description: { en: '', fr: '', de: '', it: '' },
    resource: '',
    action: 'read',
    is_active: true,
  });

  const [customResource, setCustomResource] = useState('');
  const [useCustomResource, setUseCustomResource] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API mutations
  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();
  const { data: resourcesData } = useGetPermissionResourcesQuery();

  const isLoading = isCreating || isUpdating;
  const existingResources = useMemo(() => resourcesData?.data || [], [resourcesData?.data]);

  // Initialize form when permission changes
  useEffect(() => {
    if (permission?.id) {
      setFormData({
        name: permission.name,
        display_name: permission.display_name || { en: '', fr: '', de: '', it: '' },
        description: permission.description || { en: '', fr: '', de: '', it: '' },
        resource: permission.resource,
        action: permission.action,
        is_active: permission.is_active,
      });
      // Check if resource is in existing list
      const isExisting = existingResources.includes(permission.resource);
      setUseCustomResource(!isExisting);
      if (!isExisting) {
        setCustomResource(permission.resource);
      }
    } else {
      // Reset form for new permission
      setFormData({
        name: '',
        display_name: { en: '', fr: '', de: '', it: '' },
        description: { en: '', fr: '', de: '', it: '' },
        resource: '',
        action: 'read',
        is_active: true,
      });
      setUseCustomResource(false);
      setCustomResource('');
    }
    setError(null);
  }, [permission, existingResources]);

  // Auto-generate permission name
  useEffect(() => {
    if (!isEditing) {
      const resource = useCustomResource ? customResource : formData.resource;
      if (resource && formData.action) {
        setFormData((prev) => ({
          ...prev,
          name: `${resource}:${formData.action}`,
        }));
      }
    }
  }, [formData.resource, formData.action, customResource, useCustomResource, isEditing]);

  // Handle form field changes
  const handleChange = (field: keyof PermissionCreatePayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle multilingual field changes
  const handleMultilingualChange = (
    field: 'display_name' | 'description',
    lang: keyof MultilingualText,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: PermissionCreatePayload = {
      ...formData,
      resource: useCustomResource ? customResource : formData.resource,
    };

    try {
      if (isEditing) {
        await updatePermission({ id: permission!.id, data: payload }).unwrap();
      } else {
        await createPermission(payload).unwrap();
      }
      onClose();
    } catch (err) {
      const errorMessage = (err as { data?: { message?: string } })?.data?.message;
      setError(errorMessage || t('common.errorOccurred'));
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? t('permissions.editPermission') : t('permissions.createPermission')}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('permissions.resource')} *</Form.Label>
                {useCustomResource ? (
                  <Form.Control
                    type="text"
                    value={customResource}
                    onChange={(e) => setCustomResource(e.target.value.toLowerCase())}
                    placeholder="e.g., properties, users"
                    required
                  />
                ) : (
                  <Form.Select
                    value={formData.resource}
                    onChange={(e) => handleChange('resource', e.target.value)}
                    required={!useCustomResource}
                  >
                    <option value="">{t('permissions.selectResource')}</option>
                    {existingResources.map((resource: string) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </Form.Select>
                )}
                <Form.Check
                  type="checkbox"
                  className="mt-2"
                  label={t('permissions.useCustomResource')}
                  checked={useCustomResource}
                  onChange={(e) => setUseCustomResource(e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('permissions.action')} *</Form.Label>
                <Form.Select
                  value={formData.action}
                  onChange={(e) => handleChange('action', e.target.value as PermissionAction)}
                  required
                >
                  {PERMISSION_ACTIONS.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">{t('permissions.actionHelp')}</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>{t('permissions.name')}</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Auto-generated from resource:action"
                  disabled={!isEditing}
                />
                <Form.Text className="text-muted">{t('permissions.nameHelp')}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('common.status')}</Form.Label>
                <Form.Select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => handleChange('is_active', e.target.value === 'true')}
                >
                  <option value="true">{t('common.active')}</option>
                  <option value="false">{t('common.inactive')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Display Name (Multilingual) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('permissions.displayName')} *</Form.Label>
            <Row>
              {(['en', 'fr', 'de', 'it'] as const).map((lang) => (
                <Col md={6} key={lang} className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder={t(`common.languages.${lang}`)}
                    value={formData.display_name?.[lang] || ''}
                    onChange={(e) => handleMultilingualChange('display_name', lang, e.target.value)}
                    required={lang === 'en'}
                  />
                </Col>
              ))}
            </Row>
          </Form.Group>

          {/* Description (Multilingual) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('common.description')}</Form.Label>
            <Row>
              {(['en', 'fr', 'de', 'it'] as const).map((lang) => (
                <Col md={6} key={lang} className="mb-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={t(`common.languages.${lang}`)}
                    value={formData.description?.[lang] || ''}
                    onChange={(e) => handleMultilingualChange('description', lang, e.target.value)}
                  />
                </Col>
              ))}
            </Row>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
