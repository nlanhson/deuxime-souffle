import { RouterProvider } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { AuthProvider } from '@/context/AuthContext';
import { router } from '@/routes';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </AuthProvider>
    </I18nProvider>
  );
}
