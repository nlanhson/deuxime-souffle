import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { ToastProvider } from '@/context/ToastContext';
import { I18nProvider } from '@/i18n';
import { router } from '@/routes';

export default function App() {
  return (
    <I18nProvider>
      <DataProvider>
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
          </ToastProvider>
        </AuthProvider>
      </DataProvider>
    </I18nProvider>
  );
}
