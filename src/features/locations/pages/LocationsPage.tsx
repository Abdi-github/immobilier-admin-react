/**
 * Locations Page Component
 * 
 * Manages Swiss cantons and cities with tabbed interface.
 */

import { useState } from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { GeoAlt, Building } from 'react-bootstrap-icons';
import {
  CantonList,
  CityList,
  CantonFormModal,
  CityFormModal,
  CantonDeleteModal,
  CityDeleteModal,
} from '../components';
import { Canton, City } from '../locations.types';

export function LocationsPage() {
  const { t } = useTranslation();

  // Tab state
  const [activeTab, setActiveTab] = useState('cantons');

  // Canton modals state
  const [showCantonForm, setShowCantonForm] = useState(false);
  const [editingCanton, setEditingCanton] = useState<Canton | null>(null);
  const [showCantonDelete, setShowCantonDelete] = useState(false);
  const [deletingCanton, setDeletingCanton] = useState<Canton | null>(null);

  // City modals state
  const [showCityForm, setShowCityForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showCityDelete, setShowCityDelete] = useState(false);
  const [deletingCity, setDeletingCity] = useState<City | null>(null);

  // Canton filter for cities (when clicking "View Cities" on a canton)
  const [cantonFilter, setCantonFilter] = useState<Canton | null>(null);

  // Canton handlers
  const handleEditCanton = (canton: Canton) => {
    setEditingCanton(canton);
    setShowCantonForm(true);
  };

  const handleDeleteCanton = (canton: Canton) => {
    setDeletingCanton(canton);
    setShowCantonDelete(true);
  };

  const handleViewCities = (canton: Canton) => {
    setCantonFilter(canton);
    setActiveTab('cities');
  };

  const handleCloseCantonForm = () => {
    setShowCantonForm(false);
    setEditingCanton(null);
  };

  const handleCloseCantonDelete = () => {
    setShowCantonDelete(false);
    setDeletingCanton(null);
  };

  // City handlers
  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setShowCityForm(true);
  };

  const handleDeleteCity = (city: City) => {
    setDeletingCity(city);
    setShowCityDelete(true);
  };

  const handleCloseCityForm = () => {
    setShowCityForm(false);
    setEditingCity(null);
  };

  const handleCloseCityDelete = () => {
    setShowCityDelete(false);
    setDeletingCity(null);
  };

  const handleClearCantonFilter = () => {
    setCantonFilter(null);
  };

  return (
    <Container fluid className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">
            <GeoAlt className="me-2" />
            {t('locations.pageTitle')}
          </h2>
          <p className="text-muted mb-0">
            {t('locations.pageDescription')}
          </p>
        </Col>
      </Row>

      {/* Tabbed Content */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="cantons">
                  <GeoAlt className="me-1" />
                  {t('locations.cantons.tabTitle')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="cities">
                  <Building className="me-1" />
                  {t('locations.cities.tabTitle')}
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="cantons">
                <CantonList
                  onEdit={handleEditCanton}
                  onDelete={handleDeleteCanton}
                  onViewCities={handleViewCities}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="cities">
                <CityList
                  cantonFilter={cantonFilter}
                  onEdit={handleEditCity}
                  onDelete={handleDeleteCity}
                  onClearCantonFilter={handleClearCantonFilter}
                />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Canton Modals */}
      <CantonFormModal
        show={showCantonForm}
        canton={editingCanton}
        onHide={handleCloseCantonForm}
      />
      <CantonDeleteModal
        show={showCantonDelete}
        canton={deletingCanton}
        onHide={handleCloseCantonDelete}
      />

      {/* City Modals */}
      <CityFormModal
        show={showCityForm}
        city={editingCity}
        defaultCantonId={cantonFilter?.id}
        onHide={handleCloseCityForm}
      />
      <CityDeleteModal
        show={showCityDelete}
        city={deletingCity}
        onHide={handleCloseCityDelete}
      />
    </Container>
  );
}
