/**
 * Categories by Section View Component
 */

import { Card, Row, Col, Spinner, Badge, ListGroup, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesBySectionQuery } from '../categoriesApi';
import { Category, CategorySection, CATEGORY_SECTIONS } from '../categories.types';
import { CategoryStatusBadge } from './CategoryStatusBadge';
import { getLocalizedName } from '@/shared/utils/i18n.utils';

interface CategoriesBySectionProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const sectionColors: Record<CategorySection, string> = {
  residential: 'primary',
  commercial: 'info',
  land: 'warning',
  parking: 'secondary',
  special: 'dark',
};

const sectionIcons: Record<CategorySection, string> = {
  residential: 'bi-house',
  commercial: 'bi-building',
  land: 'bi-geo-alt',
  parking: 'bi-p-square',
  special: 'bi-star',
};

function SectionCard({
  section,
  onEdit,
  onDelete,
}: {
  section: CategorySection;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { data, isLoading, error } = useGetCategoriesBySectionQuery(section);

  if (isLoading) {
    return (
      <Card className="h-100 border-0 shadow-sm">
        <Card.Header className={`bg-${sectionColors[section]} text-white`}>
          <i className={`${sectionIcons[section]} me-2`}></i>
          {t(`categories.sections.${section}`)}
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant={sectionColors[section]} />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100 border-0 shadow-sm">
        <Card.Header className={`bg-${sectionColors[section]} text-white`}>
          <i className={`${sectionIcons[section]} me-2`}></i>
          {t(`categories.sections.${section}`)}
        </Card.Header>
        <Card.Body className="text-center py-4 text-muted">
          {t('common.error')}
        </Card.Body>
      </Card>
    );
  }

  const categories = data?.data || [];

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Header className={`bg-${sectionColors[section]} text-white d-flex justify-content-between align-items-center`}>
        <span>
          <i className={`${sectionIcons[section]} me-2`}></i>
          {t(`categories.sections.${section}`)}
        </span>
        <Badge bg="light" text="dark">{categories.length}</Badge>
      </Card.Header>
      <ListGroup variant="flush">
        {categories.length === 0 ? (
          <ListGroup.Item className="text-center text-muted py-4">
            {t('categories.noCategories')}
          </ListGroup.Item>
        ) : (
          categories.map((category: Category) => (
            <ListGroup.Item
              key={category.id}
              className="d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-semibold">
                  {getLocalizedName(category.name, currentLanguage)}
                </div>
                <small className="text-muted d-flex align-items-center gap-2">
                  <code>{category.slug}</code>
                  {category.icon && (
                    <span>
                      <i className={`bi bi-${category.icon}`}></i>
                    </span>
                  )}
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CategoryStatusBadge isActive={category.is_active} />
                <div className="btn-group btn-group-sm">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(category)}
                    title={t('common.edit')}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(category)}
                    title={t('common.delete')}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
}

export function CategoriesBySection({ onEdit, onDelete }: CategoriesBySectionProps) {
  return (
    <Row className="g-4">
      {CATEGORY_SECTIONS.map((section) => (
        <Col key={section} lg={6} xl={4}>
          <SectionCard section={section} onEdit={onEdit} onDelete={onDelete} />
        </Col>
      ))}
    </Row>
  );
}
