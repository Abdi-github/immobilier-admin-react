/**
 * City Form Modal Component
 */

import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { City, CityCreatePayload, CityUpdatePayload } from '../locations.types';
import { useCreateCityMutation, useUpdateCityMutation, useGetCantonsQuery } from '../locationsApi';
import { useToast } from '@/shared/hooks/useToast';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface CityFormModalProps {
  show: boolean;
  city: City | null;
  defaultCantonId?: string;
  onHide: () => void;
}

interface FormData {
  canton_id: string;
  postal_code: string;
  name_en: string;
  name_fr: string;
  name_de: string;
  name_it: string;
  is_active: boolean;
}

export function CityFormModal({ show, city, defaultCantonId, onHide }: CityFormModalProps) {
  const { t, i18n } = useTranslation();
  const { success, error } = useToast();
  const currentLanguage = i18n.language;
  const isEditMode = city && city.id;

  // Get cantons for dropdown
  const { data: cantonsData } = useGetCantonsQuery({ limit: 100 });
  const cantons = cantonsData?.data || [];

  const [createCity, { isLoading: isCreating }] = useCreateCityMutation();
  const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      canton_id: defaultCantonId || '',
      postal_code: '',
      name_en: '',
      name_fr: '',
      name_de: '',
      name_it: '',
      is_active: true,
    },
  });

  // Reset form when city changes
  useEffect(() => {
    if (city && city.id) {
      reset({
        canton_id: city.canton_id || '',
        postal_code: city.postal_code || '',
        name_en: city.name?.en || '',
        name_fr: city.name?.fr || '',
        name_de: city.name?.de || '',
        name_it: city.name?.it || '',
        is_active: city.is_active ?? true,
      });
    } else {
      reset({
        canton_id: defaultCantonId || '',
        postal_code: '',
        name_en: '',
        name_fr: '',
        name_de: '',
        name_it: '',
        is_active: true,
      });
    }
  }, [city, defaultCantonId, reset]);

  const onSubmit = async (data: FormData) => {
    const payload: CityCreatePayload | CityUpdatePayload = {
      canton_id: data.canton_id,
      postal_code: data.postal_code,
      name: {
        en: data.name_en,
        fr: data.name_fr,
        de: data.name_de,
        it: data.name_it,
      },
      is_active: data.is_active,
    };

    try {
      if (isEditMode && city) {
        await updateCity({ id: city.id, data: payload }).unwrap();
        success(t('locations.cities.updateSuccess'));
      } else {
        await createCity(payload as CityCreatePayload).unwrap();
        success(t('locations.cities.createSuccess'));
      }
      onHide();
    } catch (err) {
      error(isEditMode ? t('locations.cities.updateError') : t('locations.cities.createError'));
      console.error('Error saving city:', err);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? t('locations.cities.edit') : t('locations.cities.add')}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('locations.cities.canton')}</Form.Label>
                <Form.Select
                  {...register('canton_id', { required: t('validation.required') })}
                  isInvalid={!!errors.canton_id}
                >
                  <option value="">{t('locations.cities.selectCanton')}</option>
                  {cantons.map((canton) => (
                    <option key={canton.id} value={canton.id}>
                      {canton.code} - {getLocalizedName(canton.name, currentLanguage)}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.canton_id?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('locations.cities.postalCode')}</Form.Label>
                <Form.Control
                  type="text"
                  {...register('postal_code', {
                    required: t('validation.required'),
                    pattern: {
                      value: /^\d{4}$/,
                      message: t('validation.postalCodeFormat'),
                    },
                  })}
                  isInvalid={!!errors.postal_code}
                  placeholder="1000"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.postal_code?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="city_is_active"
              label={t('common.active')}
              {...register('is_active')}
            />
          </Form.Group>

          <h6 className="mb-3">{t('locations.cities.multilingualNames')}</h6>

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
                  placeholder="Lausanne"
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
                  placeholder="Lausanne"
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
                  placeholder="Lausanne"
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
                  placeholder="Losanna"
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
