/**
 * Agency Form Modal Component
 *
 * Modal form for creating and editing agencies.
 */

import React, { useCallback, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useToast } from '@/shared/hooks/useToast';
import type { ApiError } from '@/shared/types';

import { useCreateAgencyMutation, useUpdateAgencyMutation } from '../agenciesApi';
import type { Agency, AgencyStatus } from '../agencies.types';

// Validation schema
const agencySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  contact_person: z.string().max(200).optional(),
  address: z.string().min(1, 'Address is required'),
  postal_code: z.string().optional(),
  city_id: z.string().min(1, 'City is required'),
  canton_id: z.string().min(1, 'Canton is required'),
  status: z.enum(['active', 'pending', 'suspended', 'inactive']),
  is_verified: z.boolean(),
  description_en: z.string().max(2000).optional(),
  description_fr: z.string().max(2000).optional(),
  description_de: z.string().max(2000).optional(),
  description_it: z.string().max(2000).optional(),
});

type AgencyFormData = z.infer<typeof agencySchema>;

interface AgencyFormModalProps {
  show: boolean;
  onHide: () => void;
  agency?: Agency;
}

export const AgencyFormModal: React.FC<AgencyFormModalProps> = ({
  show,
  onHide,
  agency,
}) => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToast();
  const isEditMode = !!agency;

  const [createAgency, { isLoading: isCreating }] = useCreateAgencyMutation();
  const [updateAgency, { isLoading: isUpdating }] = useUpdateAgencyMutation();

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: '',
      slug: '',
      website: '',
      email: '',
      phone: '',
      contact_person: '',
      address: '',
      postal_code: '',
      city_id: '',
      canton_id: '',
      status: 'active',
      is_verified: false,
      description_en: '',
      description_fr: '',
      description_de: '',
      description_it: '',
    },
  });

  // Reset form when modal opens/closes or agency changes
  useEffect(() => {
    if (show && agency) {
      const description =
        typeof agency.description === 'object' ? agency.description : {};
      reset({
        name: agency.name,
        slug: agency.slug,
        website: agency.website || '',
        email: agency.email || '',
        phone: agency.phone || '',
        contact_person: agency.contact_person || '',
        address: agency.address,
        postal_code: agency.postal_code || '',
        city_id: agency.city_id,
        canton_id: agency.canton_id,
        status: agency.status,
        is_verified: agency.is_verified,
        description_en: description.en || '',
        description_fr: description.fr || '',
        description_de: description.de || '',
        description_it: description.it || '',
      });
    } else if (show) {
      reset({
        name: '',
        slug: '',
        website: '',
        email: '',
        phone: '',
        contact_person: '',
        address: '',
        postal_code: '',
        city_id: '',
        canton_id: '',
        status: 'active',
        is_verified: false,
        description_en: '',
        description_fr: '',
        description_de: '',
        description_it: '',
      });
    }
  }, [show, agency, reset]);

  const onSubmit = useCallback(
    async (data: AgencyFormData) => {
      try {
        const payload = {
          name: data.name,
          slug: data.slug || undefined,
          website: data.website || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          contact_person: data.contact_person || undefined,
          address: data.address,
          postal_code: data.postal_code || undefined,
          city_id: data.city_id,
          canton_id: data.canton_id,
          status: data.status as AgencyStatus,
          is_verified: data.is_verified,
          description: {
            en: data.description_en || undefined,
            fr: data.description_fr || undefined,
            de: data.description_de || undefined,
            it: data.description_it || undefined,
          },
        };

        if (isEditMode && agency) {
          await updateAgency({ id: agency.id, data: payload }).unwrap();
          showSuccess(t('agencies.messages.updated'));
        } else {
          await createAgency(payload).unwrap();
          showSuccess(t('agencies.messages.created'));
        }

        onHide();
      } catch (err) {
        const apiError = err as ApiError;
        showError(
          apiError.data?.error?.message ||
            t(isEditMode ? 'agencies.errors.updateFailed' : 'agencies.errors.createFailed')
        );
      }
    },
    [isEditMode, agency, createAgency, updateAgency, showSuccess, showError, t, onHide]
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? t('agencies.editAgency') : t('agencies.createAgency')}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {/* Basic Information */}
          <h6 className="text-muted mb-3">{t('agencies.sections.basicInfo')}</h6>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.name')} *</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.slug')}</Form.Label>
                <Form.Control
                  type="text"
                  {...register('slug')}
                  placeholder={t('agencies.placeholders.slugAuto')}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.website')}</Form.Label>
                <Form.Control
                  type="url"
                  {...register('website')}
                  isInvalid={!!errors.website}
                  placeholder="https://"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.website?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.email')}</Form.Label>
                <Form.Control
                  type="email"
                  {...register('email')}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.phone')}</Form.Label>
                <Form.Control type="tel" {...register('phone')} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.contactPerson')}</Form.Label>
                <Form.Control type="text" {...register('contact_person')} />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          {/* Location */}
          <h6 className="text-muted mb-3">{t('agencies.sections.location')}</h6>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.address')} *</Form.Label>
                <Form.Control
                  type="text"
                  {...register('address')}
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.postalCode')}</Form.Label>
                <Form.Control type="text" {...register('postal_code')} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.canton')} *</Form.Label>
                <Form.Control
                  type="text"
                  {...register('canton_id')}
                  isInvalid={!!errors.canton_id}
                  placeholder={t('agencies.placeholders.cantonId')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.canton_id?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.city')} *</Form.Label>
                <Form.Control
                  type="text"
                  {...register('city_id')}
                  isInvalid={!!errors.city_id}
                  placeholder={t('agencies.placeholders.cityId')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.city_id?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          {/* Status */}
          <h6 className="text-muted mb-3">{t('agencies.sections.status')}</h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('agencies.fields.status')}</Form.Label>
                <Form.Select {...register('status')}>
                  <option value="active">{t('agencies.status.active')}</option>
                  <option value="pending">{t('agencies.status.pending')}</option>
                  <option value="suspended">{t('agencies.status.suspended')}</option>
                  <option value="inactive">{t('agencies.status.inactive')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3 pt-4">
                <Controller
                  name="is_verified"
                  control={control}
                  render={({ field }) => (
                    <Form.Check
                      type="switch"
                      id="is_verified"
                      label={t('agencies.fields.isVerified')}
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          {/* Description */}
          <h6 className="text-muted mb-3">{t('agencies.sections.description')}</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-gb me-1"></span>
                  {t('common.languages.en')}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('description_en')}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-fr me-1"></span>
                  {t('common.languages.fr')}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('description_fr')}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-de me-1"></span>
                  {t('common.languages.de')}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('description_de')}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-it me-1"></span>
                  {t('common.languages.it')}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('description_it')}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            {t('common.actions.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('common.actions.saving')}
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                {isEditMode ? t('common.actions.save') : t('common.actions.create')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AgencyFormModal;
