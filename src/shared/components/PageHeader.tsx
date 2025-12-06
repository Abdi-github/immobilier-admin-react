import React from 'react';
import { Row, Col } from 'react-bootstrap';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => {
  return (
    <Row className="mb-4 align-items-center">
      <Col>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </Col>
      {actions && (
        <Col xs="auto">
          <div className="d-flex gap-2">{actions}</div>
        </Col>
      )}
    </Row>
  );
};

export default PageHeader;
