import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export function AuthLayout() {
  return (
    <div className="auth-layout min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}
