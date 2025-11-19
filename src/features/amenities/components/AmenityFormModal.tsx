/**
 * Amenity Form Modal Component
 */

import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useCreateAmenityMutation, useUpdateAmenityMutation } from '../amenitiesApi';
import {
  Amenity,
  AmenityGroup,
  AmenityCreatePayload,
  AmenityUpdatePayload,
  AMENITY_GROUPS,
  MultilingualText,
} from '../amenities.types';

interface AmenityFormModalProps {
  show: boolean;
  onHide: () => void;
  amenity?: Amenity | null;
}

export function AmenityFormModal({ show, onHide, amenity }: AmenityFormModalProps) {
  const { t } = useTranslation();
  const isEditing = !!amenity;

  // Form state
  const [group, setGroup] = useState<AmenityGroup>('general');
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
  const [createAmenity, { isLoading: isCreating, error: createError }] =
    useCreateAmenityMutation();
  const [updateAmenity, { isLoading: isUpdating, error: updateError }] =
    useUpdateAmenityMutation();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  // Reset form when modal opens/closes or amenity changes
  useEffect(() => {
    if (show && amenity) {
      setGroup(amenity.group);
      setIcon(amenity.icon || '');
      setSortOrder(amenity.sort_order);
      setIsActive(amenity.is_active);
      setNames({
        en: amenity.name.en || '',
        fr: amenity.name.fr || '',
        de: amenity.name.de || '',
        it: amenity.name.it || '',
      });
    } else if (show && !amenity) {
      // Reset for create
      setGroup('general');
      setIcon('');
      setSortOrder(0);
      setIsActive(true);
      setNames({ en: '', fr: '', de: '', it: '' });
    }
  }, [show, amenity]);

  const handleNameChange = (lang: keyof MultilingualText, value: string) => {
    setNames((prev: MultilingualText) => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && amenity) {
        const payload: AmenityUpdatePayload = {
          group,
          name: names,
          icon: icon || undefined,
          sort_order: sortOrder,
          is_active: isActive,
        };
        await updateAmenity({ id: amenity.id, data: payload }).unwrap();
      } else {
        const payload: AmenityCreatePayload = {
          group,
          name: names,
          icon: icon || undefined,
          sort_order: sortOrder,
          is_active: isActive,
        };
        await createAmenity(payload).unwrap();
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
            {isEditing ? t('amenities.editAmenity') : t('amenities.createAmenity')}
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
                <Form.Label>{t('amenities.group')} *</Form.Label>
                <Form.Select
                  value={group}
                  onChange={(e) => setGroup(e.target.value as AmenityGroup)}
                  required
                >
                  {AMENITY_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {t(`amenities.groups.${g}`)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('amenities.icon')}</Form.Label>
                <Form.Control
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g., wifi, tv, parking"
                />
                <Form.Text className="text-muted">
                  {t('amenities.iconHelp')}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('amenities.sortOrder')}</Form.Label>
                <Form.Control
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mt-4">
                <Form.Check
                  type="switch"
                  id="isActive"
                  label={t('amenities.isActive')}
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Multilingual Name Tabs */}
          <Form.Group className="mb-3">
            <Form.Label>{t('amenities.name')} *</Form.Label>
            <Tabs defaultActiveKey="en" className="mb-2">
              {(['en', 'fr', 'de', 'it'] as const).map((lang) => (
                <Tab
                  key={lang}
                  eventKey={lang}
                  title={
                    <span>
                      {t(`common.languages.${lang}`)}
                      {!names[lang] && <span className="text-danger ms-1">*</span>}
                    </span>
                  }
                >
                  <Form.Control
                    type="text"
                    value={names[lang]}
                    onChange={(e) => handleNameChange(lang, e.target.value)}
                    placeholder={t('amenities.namePlaceholder', {
                      language: t(`common.languages.${lang}`),
                    })}
                    required
                  />
                </Tab>
              ))}
            </Tabs>
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
                <i className={`bi ${isEditing ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
                {isEditing ? t('common.save') : t('common.create')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
