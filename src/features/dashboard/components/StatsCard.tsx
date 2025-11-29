import { Card } from 'react-bootstrap';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

export function StatsCard({ title, value, icon, variant = 'primary', change }: StatsCardProps) {
  return (
    <Card className="stats-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted small mb-1">{title}</p>
            <h3 className="mb-0 fw-bold">{value}</h3>
            {change && (
              <small
                className={clsx(
                  change.type === 'increase' ? 'text-success' : 'text-danger'
                )}
              >
                <i
                  className={clsx(
                    'bi me-1',
                    change.type === 'increase' ? 'bi-arrow-up' : 'bi-arrow-down'
                  )}
                />
                {change.value}%
              </small>
            )}
          </div>
          <div
            className={clsx(
              'stats-icon rounded-circle d-flex align-items-center justify-content-center',
              `bg-${variant} bg-opacity-10 text-${variant}`
            )}
            style={{ width: '48px', height: '48px' }}
          >
            <i className={clsx('bi', icon, 'fs-4')} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
