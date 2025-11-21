/**
 * Canton Form Modal Component
 */

import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Canton, CantonCreatePayload, CantonUpdatePayload } from '../locations.types';
import { useCreateCantonMutation, useUpdateCantonMutation } from '../locationsApi';
import { useToast } from '@/shared/hooks/useToast';

interface CantonFormModalProps {
  show: boolean;
  canton: Canton | null;
  onHide: () => void;
}

interface FormData {
  code: string;
  name_en: string;
  name_fr: string;
  name_de: string;
  name_it: string;
  is_active: boolean;
}

export function CantonFormModal({ show, canton, onHide }: CantonFormModalProps) {
  const { t } = useTranslation();
  const { success, error } = useToast();
  const isEditMode = canton && canton.id;

  const [createCanton, { isLoading: isCreating }] = useCreateCantonMutation();
  const [updateCanton, { isLoading: isUpdating }] = useUpdateCantonMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      code: '',
      name_en: '',
      name_fr: '',
      name_de: '',
      name_it: '',
      is_active: true,
    },
  });

  // Reset form when canton changes
  useEffect(() => {
    if (canton && canton.id) {
      reset({
        code: canton.code || '',
        name_en: canton.name?.en || '',
        name_fr: canton.name?.fr || '',
        name_de: canton.name?.de || '',
        name_it: canton.name?.it || '',
        is_active: canton.is_active ?? true,
      });
    } else {
      reset({
        code: '',
        name_en: '',
        name_fr: '',
        name_de: '',
        name_it: '',
        is_active: true,
      });
    }
  }, [canton, reset]);

  const onSubmit = async (data: FormData) => {
    const payload: CantonCreatePayload | CantonUpdatePayload = {
      code: data.code.toUpperCase(),
      name: {
        en: data.name_en,
        fr: data.name_fr,
        de: data.name_de,
        it: data.name_it,
      },
      is_active: data.is_active,
    };

    try {
      if (isEditMode && canton) {
        await updateCanton({ id: canton.id, data: payload }).unwrap();
        success(t('locations.cantons.updateSuccess'));
      } else {
        await createCanton(payload as CantonCreatePayload).unwrap();
        success(t('locations.cantons.createSuccess'));
      }
      onHide();
    } catch (err) {
      error(isEditMode ? t('locations.cantons.updateError') : t('locations.cantons.createError'));
      console.error('Error saving canton:', err);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? t('locations.cantons.edit') : t('locations.cantons.add')}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('locations.cantons.code')}</Form.Label>
                <Form.Control
                  type="text"
                  {...register('code', {
                    required: t('validation.required'),
                    minLength: { value: 2, message: t('validation.minLength', { count: 2 }) },
                    maxLength: { value: 2, message: t('validation.maxLength', { count: 2 }) },
                  })}
                  isInvalid={!!errors.code}
                  placeholder="VD"
                  style={{ textTransform: 'uppercase' }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('common.status')}</Form.Label>
                <Form.Check
                  type="switch"
                  id="is_active"
                  label={t('common.active')}
                  {...register('is_active')}
                />
              </Form.Group>
            </Col>
          </Row>

          <h6 className="mb-3">{t('locations.cantons.multilingualNames')}</h6>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-gb me-2"></span>
                  {t('languages.en')}
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register('name_en', { required: t('validation.required') })}
                  isInvalid={!!errors.name_en}
                  placeholder="Vaud"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name_en?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-fr me-2"></span>
                  {t('languages.fr')}
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register('name_fr', { required: t('validation.required') })}
                  isInvalid={!!errors.name_fr}
                  placeholder="Vaud"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name_fr?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-de me-2"></span>
                  {t('languages.de')}
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register('name_de', { required: t('validation.required') })}
                  isInvalid={!!errors.name_de}
                  placeholder="Waadt"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name_de?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <span className="fi fi-it me-2"></span>
                  {t('languages.it')}
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register('name_it', { required: t('validation.required') })}
                  isInvalid={!!errors.name_it}
                  placeholder="Vaud"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name_it?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
