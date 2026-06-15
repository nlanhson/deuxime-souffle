import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Lightweight demo auth for the DS back-office prototype.
 * No real server — `login` accepts any credentials (STUB), and the session is
 * kept in localStorage so navigating the console doesn't sign you out.
 *
 * Quick-login knob: append `?role=admin` to the URL to land straight in.
 */

export interface AdminUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: 'admin';
  roleLabel: string;
}

const DEMO_USER: AdminUser = {
  id: 'ds-001',
  name: 'Camille Roussel',
  initials: 'CR',
  email: 'camille.roussel@deuxiemesouffle.fr',
  role: 'admin',
  roleLabel: 'Opérations DS',
};

const STORAGE_KEY = 'ds-admin-auth';

interface AuthContextValue {
  user: AdminUser | null;
  login: (email?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the starting user synchronously, so the first render is already
 * authenticated when the `?role=admin` quick-login knob is present. (Doing this
 * in an effect loses the race against RequireAuth's redirect to /login.)
 */
function readInitialUser(): AdminUser | null {
  const stored = readStored();
  if (stored) return stored;
  try {
    if (new URLSearchParams(window.location.search).get('role') === 'admin') {
      return DEMO_USER;
    }
  } catch {
    /* ignore — prototype */
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => readInitialUser());

  const login = useCallback((email?: string) => {
    const next: AdminUser = email ? { ...DEMO_USER, email } : DEMO_USER;
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore — prototype */
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore — prototype */
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
