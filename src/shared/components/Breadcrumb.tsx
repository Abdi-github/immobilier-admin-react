import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb as BootstrapBreadcrumb } from 'react-bootstrap';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <BootstrapBreadcrumb className="mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast || !item.path) {
          return (
            <BootstrapBreadcrumb.Item key={index} active>
              {item.label}
            </BootstrapBreadcrumb.Item>
          );
        }

        return (
          <BootstrapBreadcrumb.Item
            key={index}
            linkAs={Link}
            linkProps={{ to: item.path }}
          >
            {item.label}
          </BootstrapBreadcrumb.Item>
        );
      })}
    </BootstrapBreadcrumb>
  );
};

export default Breadcrumb;
