import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCredentials, logout } from '../authSlice';
import { useLoginMutation } from '../authApi';
import { isAdminUserType } from '@/shared/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname: string };
  accessDenied?: boolean;
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);

  const locationState = location.state as LocationState | null;
  const from = locationState?.from?.pathname || '/dashboard';
  const accessDenied = locationState?.accessDenied || false;

  // Show access denied message when redirected from protected route
  useEffect(() => {
    if (accessDenied) {
      setError(t('auth.errors.adminOnly'));
      // Clear the user session since they're not authorized for admin panel
      dispatch(logout());
    }
  }, [accessDenied, dispatch, t]);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user && isAdminUserType(user.user_type)) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const response = await login(data).unwrap();

      // Check if user is an admin before allowing access
      if (!isAdminUserType(response.data.user.user_type)) {
        setError(t('auth.errors.adminOnly'));
        return;
      }

      dispatch(
        setCredentials({
          user: response.data.user,
          accessToken: response.data.tokens.access_token,
          refreshToken: response.data.tokens.refresh_token,
        })
      );
      navigate(from, { replace: true });
    } catch (err) {
      const apiError = err as { data?: { error?: { message?: string } } };
      setError(apiError.data?.error?.message || t('auth.errors.invalidCredentials'));
    }
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={10} md={8} lg={6} xl={4}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-primary">Immobilier</h1>
              <p className="text-muted">{t('auth.loginTitle')}</p>
            </div>

            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3">
                <Form.Label>{t('auth.email')}</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="admin@immobilier.ch"
                  {...register('email')}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t('auth.password')}</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check type="checkbox" label={t('auth.rememberMe')} id="remember-me" />
                <a href="#" className="text-decoration-none small">
                  {t('auth.forgotPassword')}
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-100"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.login')}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
