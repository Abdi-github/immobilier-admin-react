/**
 * Role Form Modal Component
 *
 * Modal form for creating and editing roles.
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert, Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetPermissionsGroupedQuery,
} from '../rolesApi';
import type { Role, RoleCreatePayload, Permission, MultilingualText, PermissionsByResource } from '../roles.types';

interface RoleFormModalProps {
  show: boolean;
  role: Role | null;
  onClose: () => void;
}

export function RoleFormModal({ show, role, onClose }: RoleFormModalProps) {
  const { t, i18n } = useTranslation();
  const isEditing = !!role?.id;
  const currentLang = i18n.language as keyof MultilingualText;

  // Form state
  const [formData, setFormData] = useState<RoleCreatePayload>({
    name: '',
    display_name: { en: '', fr: '', de: '', it: '' },
    description: { en: '', fr: '', de: '', it: '' },
    permissions: [],
    is_system: false,
    is_active: true,
  });

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // API mutations
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetPermissionsGroupedQuery();

  const isLoading = isCreating || isUpdating;
  const groupedPermissions = permissionsData?.data || [];

  // Initialize form when role changes
  useEffect(() => {
    if (role?.id) {
      setFormData({
        name: role.name,
        display_name: role.display_name || { en: '', fr: '', de: '', it: '' },
        description: role.description || { en: '', fr: '', de: '', it: '' },
        permissions: [],
        is_system: role.is_system,
        is_active: role.is_active,
      });
      // Set selected permissions
      const permIds = role.permissions?.map((p) =>
        typeof p === 'string' ? p : p.id
      ) || [];
      setSelectedPermissions(new Set(permIds));
    } else {
      // Reset form for new role
      setFormData({
        name: '',
        display_name: { en: '', fr: '', de: '', it: '' },
        description: { en: '', fr: '', de: '', it: '' },
        permissions: [],
        is_system: false,
        is_active: true,
      });
      setSelectedPermissions(new Set());
    }
    setError(null);
  }, [role]);

  // Handle form field changes
  const handleChange = (field: keyof RoleCreatePayload, value: unknown) => {
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

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  // Handle select all permissions for a resource
  const handleSelectAllForResource = (permissions: Permission[], select: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => {
        if (select) {
          newSet.add(p.id);
        } else {
          newSet.delete(p.id);
        }
      });
      return newSet;
    });
  };

  // Get localized text helper
  const getLocalizedText = (text: MultilingualText | undefined): string => {
    if (!text) return '';
    return text[currentLang] || text.en || '';
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: RoleCreatePayload = {
      ...formData,
      permissions: Array.from(selectedPermissions),
    };

    try {
      if (isEditing) {
        await updateRole({ id: role!.id, data: payload }).unwrap();
      } else {
        await createRole(payload).unwrap();
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
          <Modal.Title>{isEditing ? t('roles.editRole') : t('roles.createRole')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('roles.name')} *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., property_manager"
                  required
                  disabled={isEditing && role?.is_system}
                />
                <Form.Text className="text-muted">{t('roles.nameHelp')}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={3}>
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
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('roles.type')}</Form.Label>
                <Form.Select
                  value={formData.is_system ? 'true' : 'false'}
                  onChange={(e) => handleChange('is_system', e.target.value === 'true')}
                  disabled={isEditing}
                >
                  <option value="false">{t('roles.customRole')}</option>
                  <option value="true">{t('roles.systemRole')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Display Name (Multilingual) */}
          <Form.Group className="mb-3">
            <Form.Label>{t('roles.displayName')} *</Form.Label>
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

          {/* Permissions */}
          <Form.Group className="mb-3">
            <Form.Label>
              {t('roles.permissions')} ({selectedPermissions.size} {t('common.selected')})
            </Form.Label>
            {isLoadingPermissions ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            ) : (
              <Accordion>
                {groupedPermissions.map((group: PermissionsByResource) => {
                  const allSelected = group.permissions.every((p: Permission) =>
                    selectedPermissions.has(p.id)
                  );
                  const someSelected = group.permissions.some((p: Permission) =>
                    selectedPermissions.has(p.id)
                  );

                  return (
                    <Accordion.Item key={group.resource} eventKey={group.resource}>
                      <Accordion.Header>
                        <div className="d-flex align-items-center gap-2">
                          <Form.Check
                            type="checkbox"
                            checked={allSelected}
                            ref={(el: HTMLInputElement | null) => {
                              if (el) el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectAllForResource(group.permissions, !allSelected);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-capitalize fw-semibold">{group.resource}</span>
                          <span className="badge bg-secondary ms-2">
                            {
                              group.permissions.filter((p: Permission) => selectedPermissions.has(p.id))
                                .length
                            }
                            /{group.permissions.length}
                          </span>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Row>
                          {group.permissions.map((permission: Permission) => (
                            <Col md={6} lg={4} key={permission.id}>
                              <Form.Check
                                type="checkbox"
                                id={`perm-${permission.id}`}
                                label={
                                  <span>
                                    <code className="small">{permission.action}</code>
                                    <br />
                                    <small className="text-muted">
                                      {getLocalizedText(permission.display_name)}
                                    </small>
                                  </span>
                                }
                                checked={selectedPermissions.has(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="mb-2"
                              />
                            </Col>
                          ))}
                        </Row>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
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
