import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useAppSelector } from '@/app/hooks';
import clsx from 'clsx';

export function AdminLayout() {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <div className="admin-layout d-flex">
      <Sidebar />
      <div
        className={clsx('admin-content flex-grow-1', {
          'sidebar-collapsed': sidebarCollapsed,
        })}
      >
        <Header />
        <main className="admin-main">
          <Container fluid className="py-4">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
}
