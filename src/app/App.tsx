import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes';
import { ToastContainer } from '@/shared/components/ToastContainer';

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
}
