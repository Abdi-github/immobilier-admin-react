import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/shared/hooks/useToast';
import type { ApiError } from '@/shared/types';

import type {
  User,
  UserCreateDto,
  UserUpdateDto,
  UserType,
  UserStatus,
  SupportedLanguage,
  UserFormData,
} from '../users.types';
import { useCreateUserMutation, useUpdateUserMutation } from '../usersApi';

interface UserFormModalProps {
  show: boolean;
  onHide: () => void;
  user?: User | null;
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

const LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'de', 'it'];

const initialFormData: UserFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
  phone: '',
  avatar_url: '',
  user_type: 'end_user',
  agency_id: '',
  preferred_language: 'en',
  status: 'active',
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  show,
  onHide,
  user,
}) => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isEditing = !!user;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        confirmPassword: '',
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
        user_type: user.user_type,
        agency_id: user.agency_id || '',
        preferred_language: user.preferred_language,
        status: user.status,
      });
    } else {
      setFormData(initialFormData);
    }
    setValidationErrors({});
  }, [user, show]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = t('users.validation.emailRequired');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = t('users.validation.emailInvalid');
    }

    if (!isEditing && !formData.password) {
      errors.password = t('users.validation.passwordRequired');
    } else if (formData.password && formData.password.length < 8) {
      errors.password = t('users.validation.passwordMinLength');
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('users.validation.passwordMismatch');
    }

    if (!formData.first_name) {
      errors.first_name = t('users.validation.firstNameRequired');
    }

    if (!formData.last_name) {
      errors.last_name = t('users.validation.lastNameRequired');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && user) {
        const updateData: UserUpdateDto = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || undefined,
          avatar_url: formData.avatar_url || undefined,
          user_type: formData.user_type,
          agency_id: formData.agency_id || undefined,
          preferred_language: formData.preferred_language,
          status: formData.status,
        };
        await updateUser({ id: user.id, data: updateData }).unwrap();
        showSuccess(t('users.messages.updated'));
      } else {
        const createData: UserCreateDto = {
          email: formData.email,
          password: formData.password!,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || undefined,
          avatar_url: formData.avatar_url || undefined,
          user_type: formData.user_type,
          agency_id: formData.agency_id || undefined,
          preferred_language: formData.preferred_language,
          status: formData.status,
        };
        await createUser(createData).unwrap();
        showSuccess(t('users.messages.created'));
      }
      onHide();
    } catch (err) {
      const apiError = err as ApiError;
      showError(
        apiError.data?.error?.message ||
          t(isEditing ? 'users.errors.updateFailed' : 'users.errors.createFailed')
      );
    }
  };

  const requiresAgency = ['agent', 'agency_admin'].includes(formData.user_type);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? t('users.edit') : t('users.create')}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {t('common.errors.validation')}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('users.fields.firstName')} *</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.first_name}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.first_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('users.fields.lastName')} *</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.last_name}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.last_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>{t('users.fields.email')} *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEditing}
              isInvalid={!!validationErrors.email}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.email}
            </Form.Control.Feedback>
            {isEditing && (
              <Form.Text className="text-muted">
                {t('users.emailCannotBeChanged')}
              </Form.Text>
            )}
          </Form.Group>

          {!isEditing && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('users.fields.password')} *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('users.fields.confirmPassword')} *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('users.fields.phone')}</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+41 79 000 0000"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('users.fields.preferredLanguage')}</Form.Label>
                <Form.Select
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {t(`languages.${lang}`)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('users.fields.userType')}</Form.Label>
                <Form.Select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                >
                  {USER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`users.types.${type}`)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('users.fields.status')}</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {USER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {t(`users.status.${status}`)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {requiresAgency && (
            <Form.Group className="mb-3">
              <Form.Label>
                {t('users.fields.agency')}
                {requiresAgency && ' *'}
              </Form.Label>
              <Form.Control
                type="text"
                name="agency_id"
                value={formData.agency_id}
                onChange={handleChange}
                placeholder={t('users.agencyIdPlaceholder')}
              />
              <Form.Text className="text-muted">
                {t('users.agencyIdHint')}
              </Form.Text>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            {t('common.actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading && (
              <Spinner animation="border" size="sm" className="me-2" />
            )}
            {isEditing ? t('common.actions.save') : t('common.actions.create')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
