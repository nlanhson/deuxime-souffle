import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/layout/AppShell';
import LoginScreen from '@/screens/auth/LoginScreen';
import ActivateScreen from '@/screens/auth/ActivateScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import SessionsScreen from '@/screens/sessions/SessionsScreen';
import SessionDetailScreen from '@/screens/sessions/SessionDetailScreen';
import EditSessionScreen from '@/screens/sessions/EditSessionScreen';
import EvaluationsScreen from '@/screens/evaluations/EvaluationsScreen';
import EvaluateScreen from '@/screens/evaluations/EvaluateScreen';
import ContractsScreen from '@/screens/contracts/ContractsScreen';
import ContractDetailScreen from '@/screens/contracts/ContractDetailScreen';
import ContractWizard from '@/screens/contracts/ContractWizard';
import EditContractScreen from '@/screens/contracts/EditContractScreen';
import RenewScreen from '@/screens/contracts/RenewScreen';
import NonRenewalScreen from '@/screens/contracts/NonRenewalScreen';
import ContactsScreen from '@/screens/contacts/ContactsScreen';
import InvoicesScreen from '@/screens/invoices/InvoicesScreen';
import InvoiceDetailScreen from '@/screens/invoices/InvoiceDetailScreen';
import FacilityScreen from '@/screens/facility/FacilityScreen';
import FacilityEditScreen from '@/screens/facility/FacilityEditScreen';
import AccountScreen from '@/screens/account/AccountScreen';
import NotificationsScreen from '@/screens/notifications/NotificationsScreen';
import ContactScreen from '@/screens/support/ContactScreen';
import NotFoundScreen from '@/screens/NotFoundScreen';

/** Garde d'authentification : les routes protégées rendent la coquille. */
function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }
  return <AppShell />;
}

export const router = createBrowserRouter([
  // Auth — sans coquille
  { path: '/connexion', element: <LoginScreen /> },
  { path: '/activer/:token', element: <ActivateScreen /> },
  { path: '/mot-de-passe-oublie', element: <ForgotPasswordScreen /> },
  { path: '/reinitialiser/:token', element: <ResetPasswordScreen /> },

  // Espace authentifié — AppShell
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <DashboardScreen /> },
      { path: '/sessions', element: <SessionsScreen /> },
      { path: '/sessions/:id', element: <SessionDetailScreen /> },
      { path: '/sessions/:id/modifier', element: <EditSessionScreen /> },
      { path: '/evaluations', element: <EvaluationsScreen /> },
      { path: '/evaluations/:sessionId', element: <EvaluateScreen /> },
      { path: '/contrats', element: <ContractsScreen /> },
      { path: '/contrats/nouveau', element: <ContractWizard mode="create" /> },
      { path: '/contrats/:id', element: <ContractDetailScreen /> },
      { path: '/contrats/:id/modifier', element: <EditContractScreen /> },
      { path: '/contrats/:id/resoumettre', element: <ContractWizard mode="resubmit" /> },
      { path: '/contrats/:id/renouveler', element: <RenewScreen /> },
      { path: '/contrats/:id/non-renouvellement', element: <NonRenewalScreen /> },
      { path: '/contacts', element: <ContactsScreen /> },
      { path: '/factures', element: <InvoicesScreen /> },
      { path: '/factures/:id', element: <InvoiceDetailScreen /> },
      { path: '/etablissement', element: <FacilityScreen /> },
      { path: '/etablissement/modifier', element: <FacilityEditScreen /> },
      { path: '/mon-compte', element: <AccountScreen /> },
      { path: '/notifications', element: <NotificationsScreen /> },
      { path: '/contact', element: <ContactScreen /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]);
