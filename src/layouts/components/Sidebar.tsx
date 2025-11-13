import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { toggleSidebar, setMobileSidebarOpen } from '@/shared/slices/uiSlice';
import clsx from 'clsx';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: 'bi-speedometer2', label: 'nav.dashboard' },
  { path: '/properties', icon: 'bi-building', label: 'nav.properties', permission: 'properties:read' },
  { path: '/agencies', icon: 'bi-buildings', label: 'nav.agencies', permission: 'agencies:read' },
  { path: '/users', icon: 'bi-people', label: 'nav.users', permission: 'users:read' },
  { path: '/categories', icon: 'bi-tags', label: 'nav.categories', permission: 'categories:read' },
  { path: '/amenities', icon: 'bi-check2-square', label: 'nav.amenities', permission: 'amenities:read' },
  { path: '/locations', icon: 'bi-geo-alt', label: 'nav.locations', permission: 'locations:read' },
  { path: '/translations', icon: 'bi-translate', label: 'nav.translations', permission: 'translations:read' },
  { path: '/roles', icon: 'bi-shield-lock', label: 'nav.roles', permission: 'roles:read' },
  { path: '/permissions', icon: 'bi-key', label: 'nav.permissions', permission: 'permissions:read' },
  { path: '/settings', icon: 'bi-gear', label: 'nav.settings' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, sidebarMobileOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const userPermissions = user?.permissions || [];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission) || userPermissions.includes('*');
  });

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    if (sidebarMobileOpen) {
      dispatch(setMobileSidebarOpen(false));
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={() => dispatch(setMobileSidebarOpen(false))}
        />
      )}

      <aside
        className={clsx('sidebar bg-dark', {
          collapsed: sidebarCollapsed,
          'mobile-open': sidebarMobileOpen,
        })}
      >
        <div className="sidebar-header d-flex align-items-center justify-content-between p-3">
          <span className="sidebar-brand text-white fw-bold">
            {sidebarCollapsed ? 'IM' : 'Immobilier'}
          </span>
          <button
            className="btn btn-link text-white d-none d-lg-block p-0"
            onClick={() => dispatch(toggleSidebar())}
          >
            <i className={clsx('bi', sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left')} />
          </button>
        </div>

        <Nav className="flex-column sidebar-nav">
          {filteredNavItems.map((item) => (
            <Nav.Item key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx('nav-link d-flex align-items-center', { active: isActive })
                }
                onClick={handleNavClick}
              >
                <i className={clsx('bi', item.icon, 'nav-icon')} />
                {!sidebarCollapsed && <span className="nav-text">{t(item.label)}</span>}
              </NavLink>
            </Nav.Item>
          ))}
        </Nav>
      </aside>
    </>
  );
}
