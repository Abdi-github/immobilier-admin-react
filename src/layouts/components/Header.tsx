import { Navbar, Container, Dropdown, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { toggleMobileSidebar } from '@/shared/slices/uiSlice';
import { getInitials } from '@/shared/utils/formatters';
import { api } from '@/shared/api/baseApi';
import type { Language } from '@/shared/types';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

export function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: Language) => {
    i18n.changeLanguage(code);
    // Reset API cache to refetch data with new language header
    // This ensures translations are fetched in the new language
    dispatch(api.util.resetApiState());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userName = user ? `${user.first_name} ${user.last_name}` : 'User';

  return (
    <Navbar bg="white" className="admin-header border-bottom px-3">
      <Container fluid className="px-0">
        <Button
          variant="link"
          className="d-lg-none text-dark p-0 me-3"
          onClick={() => dispatch(toggleMobileSidebar())}
        >
          <i className="bi bi-list fs-4" />
        </Button>

        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Language Selector */}
          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm" id="language-dropdown">
              {currentLanguage?.flag} {currentLanguage?.code.toUpperCase()}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {languages.map((lang) => (
                <Dropdown.Item
                  key={lang.code}
                  active={i18n.language === lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.flag} {lang.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* User Menu */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="light"
              id="user-dropdown"
              className="d-flex align-items-center gap-2"
            >
              <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                {getInitials(userName)}
              </div>
              <span className="d-none d-md-inline">{userName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate('/settings')}>
                <i className="bi bi-gear me-2" />
                {t('nav.settings')}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2" />
                {t('auth.logout')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
}
