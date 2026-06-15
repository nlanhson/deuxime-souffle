import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppShell } from '@/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { NotFoundScreen } from '@/screens/NotFoundScreen';
import { AssignmentsScreen } from '@/screens/assignments/AssignmentsScreen';
import { SessionsScreen } from '@/screens/sessions/SessionsScreen';
import { ContractsScreen } from '@/screens/contracts/ContractsScreen';
import { EstablishmentsScreen } from '@/screens/establishments/EstablishmentsScreen';
import { CoachesScreen } from '@/screens/coaches/CoachesScreen';
import { BillingScreen } from '@/screens/billing/BillingScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginScreen /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardScreen /> },
      { path: 'affectations', element: <AssignmentsScreen /> },
      { path: 'seances', element: <SessionsScreen /> },
      { path: 'contrats', element: <ContractsScreen /> },
      { path: 'etablissements', element: <EstablishmentsScreen /> },
      { path: 'coachs', element: <CoachesScreen /> },
      { path: 'facturation', element: <BillingScreen /> },
      { path: 'parametres', element: <SettingsScreen /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]);
