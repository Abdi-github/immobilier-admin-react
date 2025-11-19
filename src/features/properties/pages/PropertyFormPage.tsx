/**
 * Property Form Page Component
 * 
 * Create or edit a property with full support for:
 * - Basic property information
 * - Location selection (canton/city cascading)
 * - Amenities multi-select
 * - Image upload with drag & drop
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
  Image,
  ProgressBar,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  CheckCircle,
  Star,
  StarFill,
  Trash,
  PlusCircle,
} from 'react-bootstrap-icons';
import { useToast } from '@/shared/hooks/useToast';
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetPropertyQuery,
  useUploadPropertyImageMutation,
  useDeletePropertyImageMutation,
  useSetPrimaryImageMutation,
} from '../propertiesApi';
import { useGetCategoriesQuery } from '@/features/categories/categoriesApi';
import { useGetCantonsQuery, useGetCitiesQuery } from '@/features/locations/locationsApi';
import { useGetAgenciesQuery } from '@/features/agencies/agenciesApi';
import { useGetAmenitiesQuery } from '@/features/amenities/amenitiesApi';
import { PropertyCreateDto, PropertyUpdateDto, SupportedLanguage } from '../properties.types';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface FormData {
  external_url?: string;
  source_language: SupportedLanguage;
  category_id: string;
  agency_id?: string;
  transaction_type: 'rent' | 'buy';
  price: number;
  additional_costs?: number;
  rooms?: number;
  surface?: number;
  address: string;
  city_id: string;
  canton_id: string;
  postal_code?: string;
  title: string;
  description: string;
  amenities: string[];
  proximity: Record<string, string>;
}

interface ProximityItem {
  key: string;
  value: string;
}

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export function PropertyFormPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToast();
  const currentLanguage = i18n.language as SupportedLanguage;
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [selectedCantonId, setSelectedCantonId] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [proximityItems, setProximityItems] = useState<ProximityItem[]>([]);

  // Fetch data for dropdowns
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const { data: cantonsData } = useGetCantonsQuery({ limit: 100 });
  const { data: citiesData } = useGetCitiesQuery(
    { canton_id: selectedCantonId, limit: 500 },
    { skip: !selectedCantonId }
  );
  const { data: agenciesData } = useGetAgenciesQuery({ limit: 100 });
  const { data: amenitiesData } = useGetAmenitiesQuery({ limit: 100 });

  // Fetch existing property if editing
  const { data: propertyData, isLoading: isLoadingProperty, refetch: refetchProperty } = useGetPropertyQuery(id!, {
    skip: !id,
  });

  // Mutations
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
  const [uploadImage] = useUploadPropertyImageMutation();
  const [deleteImage] = useDeletePropertyImageMutation();
  const [setPrimaryImage] = useSetPrimaryImageMutation();

  const isLoading = isCreating || isUpdating;

  const categories = categoriesData?.data || [];
  const cantons = cantonsData?.data || [];
  const cities = citiesData?.data || [];
  const agencies = agenciesData?.data || [];
  const amenities = amenitiesData?.data || [];
  const propertyImages = propertyData?.data?.images || [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      external_url: '',
      source_language: 'en',
      category_id: '',
      agency_id: '',
      transaction_type: 'rent',
      price: 0,
      additional_costs: 0,
      rooms: undefined,
      surface: undefined,
      address: '',
      city_id: '',
      canton_id: '',
      postal_code: '',
      title: '',
      description: '',
      amenities: [],
      proximity: {},
    },
  });

  const watchedCantonId = watch('canton_id');

  // Update selected canton when form value changes
  useEffect(() => {
    if (watchedCantonId) {
      setSelectedCantonId(watchedCantonId);
    }
  }, [watchedCantonId]);

  // Populate form when editing
  useEffect(() => {
    if (propertyData?.data && isEditMode) {
      const property = propertyData.data;
      const amenityIds = (property.amenities?.map((a) => a._id || a.id).filter(Boolean) || []) as string[];
      
      // Convert proximity object to array of items
      const proximityArray: ProximityItem[] = property.proximity 
        ? Object.entries(property.proximity).map(([key, value]) => ({ key, value: value || '' }))
        : [];
      
      reset({
        external_url: property.external_url || '',
        source_language: property.source_language,
        category_id: property.category_id,
        agency_id: property.agency_id || '',
        transaction_type: property.transaction_type,
        price: property.price,
        additional_costs: property.additional_costs || 0,
        rooms: property.rooms,
        surface: property.surface,
        address: property.address,
        city_id: property.city_id,
        canton_id: property.canton_id,
        postal_code: property.postal_code || '',
        // Use new structure (root-level title/description) or fallback to legacy translations array
        title: property.title || property.translations?.[0]?.title || '',
        description: property.description || property.translations?.[0]?.description || '',
        amenities: amenityIds,
        proximity: property.proximity || {},
      });
      setSelectedCantonId(property.canton_id);
      setSelectedAmenities(amenityIds);
      setProximityItems(proximityArray);
    }
  }, [propertyData, isEditMode, reset]);

  // Handle amenity toggle
  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) => {
      const newAmenities = prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId];
      setValue('amenities', newAmenities);
      return newAmenities;
    });
  };

  // Handle proximity management
  const addProximityItem = () => {
    setProximityItems((prev) => [...prev, { key: '', value: '' }]);
  };

  const updateProximityItem = (index: number, field: 'key' | 'value', newValue: string) => {
    setProximityItems((prev) => {
      const updated: ProximityItem[] = prev.map((item, i) => {
        if (i === index) {
          return { key: field === 'key' ? newValue : item.key, value: field === 'value' ? newValue : item.value };
        }
        return item;
      });
      // Update form value
      const proximityObj: Record<string, string> = {};
      updated.forEach((item) => {
        if (item.key.trim()) {
          proximityObj[item.key] = item.value;
        }
      });
      setValue('proximity', proximityObj);
      return updated;
    });
  };

  const removeProximityItem = (index: number) => {
    setProximityItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Update form value
      const proximityObj: Record<string, string> = {};
      updated.forEach((item) => {
        if (item.key.trim()) {
          proximityObj[item.key] = item.value;
        }
      });
      setValue('proximity', proximityObj);
      return updated;
    });
  };

  // Handle files selected for upload (defined first so it can be referenced by handleDrop)
  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (!id) return;

    // Create preview items
    const newUploads: UploadingImage[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));

    setUploadingImages((prev) => [...prev, ...newUploads]);

    // Upload each file
    for (const upload of newUploads) {
      try {
        const formData = new FormData();
        formData.append('image', upload.file);

        // Update progress to show uploading
        setUploadingImages((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, progress: 50 } : u))
        );

        await uploadImage({ propertyId: id, formData }).unwrap();

        // Remove from uploading list on success
        setUploadingImages((prev) => prev.filter((u) => u.id !== upload.id));
        
        // Refetch property to get new images
        refetchProperty();
      } catch (err) {
        console.error('Upload error:', err);
        setUploadingImages((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, error: t('properties.uploadFailed'), progress: 0 } : u
          )
        );
      }
    }
  }, [id, uploadImage, refetchProperty, t]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isEditMode || !id) {
      showError(t('properties.saveBeforeUpload'));
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    handleFilesSelected(files);
  }, [isEditMode, id, t, showError, handleFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFilesSelected(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!id) return;
    
    try {
      await deleteImage({ propertyId: id, imageId }).unwrap();
      success(t('properties.imageDeleted'));
      refetchProperty();
    } catch {
      showError(t('properties.imageDeleteFailed'));
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!id) return;
    
    try {
      await setPrimaryImage({ propertyId: id, imageId }).unwrap();
      success(t('properties.primaryImageSet'));
      refetchProperty();
    } catch {
      showError(t('properties.primaryImageFailed'));
    }
  };

  const removeFailedUpload = (uploadId: string) => {
    setUploadingImages((prev) => prev.filter((u) => u.id !== uploadId));
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Build proximity object from items
      const proximityObj: Record<string, string> = {};
      proximityItems.forEach((item) => {
        if (item.key.trim()) {
          proximityObj[item.key] = item.value;
        }
      });
      
      if (isEditMode && id) {
        const updateData: PropertyUpdateDto = {
          external_url: data.external_url || undefined,
          category_id: data.category_id,
          agency_id: data.agency_id || undefined,
          transaction_type: data.transaction_type,
          price: data.price,
          additional_costs: data.additional_costs,
          rooms: data.rooms,
          surface: data.surface,
          address: data.address,
          city_id: data.city_id,
          canton_id: data.canton_id,
          postal_code: data.postal_code || undefined,
          proximity: Object.keys(proximityObj).length > 0 ? proximityObj : undefined,
          amenities: selectedAmenities,
        };
        await updateProperty({ id, data: updateData }).unwrap();
        success(t('properties.updateSuccess'));
      } else {
        const createData: PropertyCreateDto = {
          // external_id is auto-generated by the server
          external_url: data.external_url || undefined,
          source_language: data.source_language,
          category_id: data.category_id,
          agency_id: data.agency_id || undefined,
          transaction_type: data.transaction_type,
          price: data.price,
          additional_costs: data.additional_costs,
          rooms: data.rooms,
          surface: data.surface,
          address: data.address,
          city_id: data.city_id,
          canton_id: data.canton_id,
          postal_code: data.postal_code || undefined,
          proximity: Object.keys(proximityObj).length > 0 ? proximityObj : undefined,
          amenities: selectedAmenities,
          title: data.title,
          description: data.description,
        };
        const result = await createProperty(createData).unwrap();
        success(t('properties.createSuccess'));
        // Navigate to edit mode to allow image upload
        if (result.data?.id) {
          navigate(`/properties/${result.data.id}/edit`);
          return;
        }
      }
      navigate('/properties');
    } catch (err) {
      showError(isEditMode ? t('properties.updateError') : t('properties.createError'));
      console.error('Error saving property:', err);
    }
  };

  if (isLoadingProperty && isEditMode) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" className="p-0 me-3" onClick={() => navigate('/properties')}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="h2 mb-0">
            {isEditMode ? t('properties.edit') : t('properties.create')}
          </h1>
          <p className="text-muted mb-0">
            {isEditMode ? t('properties.editDescription') : t('properties.createDescription')}
          </p>
        </div>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col lg={8}>
            {/* Basic Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{t('properties.basicInfo')}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.sourceLanguage')} *</Form.Label>
                      <Form.Select
                        {...register('source_language', { required: t('validation.required') })}
                        isInvalid={!!errors.source_language}
                        disabled={isEditMode}
                      >
                        <option value="en">{t('languages.en')}</option>
                        <option value="fr">{t('languages.fr')}</option>
                        <option value="de">{t('languages.de')}</option>
                        <option value="it">{t('languages.it')}</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.source_language?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.externalUrl')}</Form.Label>
                      <Form.Control
                        type="url"
                        {...register('external_url')}
                        placeholder="https://"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.category')} *</Form.Label>
                      <Form.Select
                        {...register('category_id', { required: t('validation.required') })}
                        isInvalid={!!errors.category_id}
                      >
                        <option value="">{t('common.select', 'Select...')}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {getLocalizedName(category.name, currentLanguage)} ({category.section})
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category_id?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.fields.transactionType')} *</Form.Label>
                      <Form.Select
                        {...register('transaction_type', { required: t('validation.required') })}
                        isInvalid={!!errors.transaction_type}
                      >
                        <option value="rent">{t('properties.forRent')}</option>
                        <option value="buy">{t('properties.forSale')}</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.transaction_type?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.agency')}</Form.Label>
                      <Form.Select {...register('agency_id')}>
                        <option value="">{t('properties.noAgency')}</option>
                        {agencies.map((agency) => (
                          <option key={agency.id} value={agency.id}>
                            {agency.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Pricing */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{t('properties.pricing')}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.price')} (CHF) *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('price', {
                          required: t('validation.required'),
                          min: { value: 0, message: t('validation.minValue', { value: 0 }) },
                          valueAsNumber: true,
                        })}
                        isInvalid={!!errors.price}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.additionalCosts')} (CHF)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('additional_costs', { valueAsNumber: true })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Property Details */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{t('properties.sections.details')}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.rooms')}</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.5"
                        min="0"
                        {...register('rooms', { valueAsNumber: true })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.surface')} (m²)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('surface', { valueAsNumber: true })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Location */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{t('properties.location')}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.canton')} *</Form.Label>
                      <Form.Select
                        {...register('canton_id', { required: t('validation.required') })}
                        isInvalid={!!errors.canton_id}
                      >
                        <option value="">{t('common.select', 'Select...')}</option>
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
                      <Form.Label>{t('properties.city')} *</Form.Label>
                      <Form.Select
                        {...register('city_id', { required: t('validation.required') })}
                        isInvalid={!!errors.city_id}
                        disabled={!selectedCantonId}
                      >
                        <option value="">
                          {selectedCantonId ? t('common.select', 'Select...') : t('properties.selectCantonFirst')}
                        </option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.postal_code} - {getLocalizedName(city.name, currentLanguage)}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.city_id?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.address')} *</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('address', { required: t('validation.required') })}
                        isInvalid={!!errors.address}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.address?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('properties.postalCode')}</Form.Label>
                      <Form.Control
                        type="text"
                        {...register('postal_code')}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Proximity */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  {t('properties.proximity', 'Proximity')}
                  {proximityItems.length > 0 && (
                    <Badge bg="primary" className="ms-2">
                      {proximityItems.length}
                    </Badge>
                  )}
                </h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  type="button"
                  onClick={addProximityItem}
                >
                  <PlusCircle className="me-1" size={14} />
                  {t('properties.addProximity', 'Add')}
                </Button>
              </Card.Header>
              <Card.Body>
                {proximityItems.length === 0 ? (
                  <p className="text-muted mb-0">{t('properties.noProximityItems', 'No proximity items added. Click "Add" to add nearby places.')}</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {proximityItems.map((item, index) => (
                      <Row key={index} className="align-items-center">
                        <Col md={5}>
                          <Form.Control
                            type="text"
                            placeholder={t('properties.proximityPlace', 'Place (e.g., Train station)')}
                            value={item.key}
                            onChange={(e) => updateProximityItem(index, 'key', e.target.value)}
                          />
                        </Col>
                        <Col md={5}>
                          <Form.Control
                            type="text"
                            placeholder={t('properties.proximityDistance', 'Distance (e.g., 500m)')}
                            value={item.value}
                            onChange={(e) => updateProximityItem(index, 'value', e.target.value)}
                          />
                        </Col>
                        <Col md={2}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeProximityItem(index)}
                            className="w-100"
                          >
                            <Trash size={14} />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}
                <Form.Text className="text-muted mt-2 d-block">
                  {t('properties.proximityHelp', 'Add nearby places and their distances (e.g., School - 200m, Train station - 500m)')}
                </Form.Text>
              </Card.Body>
            </Card>

            {/* Amenities */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  {t('properties.amenities')}
                  {selectedAmenities.length > 0 && (
                    <Badge bg="primary" className="ms-2">
                      {selectedAmenities.length}
                    </Badge>
                  )}
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {amenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <Button
                        key={amenity.id}
                        variant={isSelected ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => toggleAmenity(amenity.id)}
                        className="d-flex align-items-center"
                        type="button"
                      >
                        {isSelected && <CheckCircle className="me-1" size={14} />}
                        {getLocalizedName(amenity.name, currentLanguage)}
                      </Button>
                    );
                  })}
                </div>
                {amenities.length === 0 && (
                  <p className="text-muted mb-0">{t('properties.noAmenitiesAvailable')}</p>
                )}
              </Card.Body>
            </Card>

            {/* Content (only for create) */}
            {!isEditMode && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">{t('properties.content')}</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('properties.fields.title')} *</Form.Label>
                    <Form.Control
                      type="text"
                      {...register('title', { required: t('validation.required') })}
                      isInvalid={!!errors.title}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.title?.message}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {t('properties.titleHelp')}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('properties.fields.description')} *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      {...register('description', { required: t('validation.required') })}
                      isInvalid={!!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description?.message}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {t('properties.descriptionHelp')}
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* Images (only for edit mode) */}
            {isEditMode && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">
                    {t('properties.images')}
                    {propertyImages.length > 0 && (
                      <Badge bg="primary" className="ms-2">
                        {propertyImages.length}
                      </Badge>
                    )}
                  </h5>
                </Card.Header>
                <Card.Body>
                  {/* Dropzone */}
                  <div
                    className={`border-2 border-dashed rounded p-4 mb-3 text-center ${
                      isDragging ? 'border-primary bg-light' : 'border-secondary'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{ cursor: 'pointer', borderStyle: 'dashed', borderWidth: '2px' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={40} className="text-muted mb-2" />
                    <p className="mb-1">{t('properties.dragDropImages')}</p>
                    <p className="text-muted small mb-0">{t('properties.orClickToSelect')}</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileInputChange}
                    />
                  </div>

                  {/* Uploading Images */}
                  {uploadingImages.length > 0 && (
                    <div className="mb-3">
                      <h6 className="mb-2">{t('properties.uploading')}</h6>
                      <Row xs={2} md={4} className="g-2">
                        {uploadingImages.map((upload) => (
                          <Col key={upload.id}>
                            <div className="position-relative border rounded overflow-hidden">
                              <Image
                                src={upload.preview}
                                alt="Uploading"
                                className="w-100"
                                style={{ height: '100px', objectFit: 'cover', opacity: 0.6 }}
                              />
                              {upload.error ? (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-danger bg-opacity-75 text-white">
                                  <X size={24} />
                                  <small>{upload.error}</small>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="text-white p-0"
                                    onClick={() => removeFailedUpload(upload.id)}
                                    type="button"
                                  >
                                    {t('common.remove')}
                                  </Button>
                                </div>
                              ) : (
                                <div className="position-absolute bottom-0 start-0 w-100 p-1">
                                  <ProgressBar
                                    now={upload.progress}
                                    animated
                                    striped
                                    variant="primary"
                                    style={{ height: '5px' }}
                                  />
                                </div>
                              )}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* Existing Images */}
                  {propertyImages.length > 0 ? (
                    <Row xs={2} md={4} className="g-3">
                      {propertyImages.map((image) => (
                        <Col key={image.id}>
                          <div className="position-relative border rounded overflow-hidden">
                            <Image
                              src={image.url}
                              alt="Property"
                              className="w-100"
                              style={{ height: '120px', objectFit: 'cover' }}
                            />
                            {image.is_primary && (
                              <Badge
                                bg="warning"
                                className="position-absolute top-0 start-0 m-1"
                              >
                                <StarFill size={10} className="me-1" />
                                {t('properties.primary')}
                              </Badge>
                            )}
                            <div className="position-absolute bottom-0 start-0 w-100 p-1 d-flex gap-1 bg-dark bg-opacity-50">
                              {!image.is_primary && (
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="flex-grow-1 py-0"
                                  onClick={() => handleSetPrimary(image.id)}
                                  title={t('properties.setPrimary')}
                                  type="button"
                                >
                                  <Star size={14} />
                                </Button>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                className="flex-grow-1 py-0"
                                onClick={() => handleDeleteImage(image.id)}
                                title={t('common.delete')}
                                type="button"
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <p className="text-muted text-center mb-0">
                      {t('properties.noImagesUploaded')}
                    </p>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="mb-4 sticky-top" style={{ top: '1rem' }}>
              <Card.Header>
                <h5 className="mb-0">{t('common.actions')}</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {t('common.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="me-2" />
                        {isEditMode ? t('common.save') : t('properties.createProperty')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/properties')}
                    disabled={isLoading}
                    type="button"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>

                {!isEditMode && (
                  <Alert variant="info" className="mt-3 mb-0">
                    <small>
                      <PlusCircle className="me-1" />
                      {t('properties.createNote')}
                    </small>
                  </Alert>
                )}

                {!isEditMode && (
                  <Alert variant="warning" className="mt-3 mb-0">
                    <small>
                      <Upload className="me-1" />
                      {t('properties.imageUploadAfterCreate')}
                    </small>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Property Info (Edit Mode) */}
            {isEditMode && propertyData?.data && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">{t('properties.propertyInfo')}</h5>
                </Card.Header>
                <Card.Body>
                  <dl className="mb-0">
                    <dt className="text-muted small">{t('properties.externalId')}</dt>
                    <dd className="mb-2">
                      <code>{propertyData.data.external_id}</code>
                    </dd>
                    <dt className="text-muted small">{t('properties.status')}</dt>
                    <dd className="mb-2">
                      <Badge bg={getStatusVariant(propertyData.data.status)}>
                        {propertyData.data.status}
                      </Badge>
                    </dd>
                    <dt className="text-muted small">{t('common.createdAt')}</dt>
                    <dd className="mb-0">
                      {new Date(propertyData.data.created_at).toLocaleString()}
                    </dd>
                  </dl>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

function getStatusVariant(status: string): string {
  const variants: Record<string, string> = {
    DRAFT: 'secondary',
    PENDING_APPROVAL: 'warning',
    APPROVED: 'info',
    REJECTED: 'danger',
    PUBLISHED: 'success',
    ARCHIVED: 'dark',
  };
  return variants[status] || 'secondary';
}
