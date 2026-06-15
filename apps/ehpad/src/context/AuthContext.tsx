import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from '@/data/api';
import { bootConfig } from '@/data/config';
import { getDb } from '@/data/store';
import type { Role, SessionUser } from '@/types/models';

const STORAGE_KEY = 'ds-ehpad.session';

// STUB: session « persistante » en localStorage — aucune vraie authentification.
function loadStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

/** ?role=admin|user → connexion automatique avec le compte seedé correspondant. */
function autoRoleUser(role: Role): SessionUser | null {
  const contact = getDb().contacts.find((c) => c.account?.role === role && c.account.active);
  if (!contact) return null;
  return {
    contactId: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    ...(contact.avatarUrl ? { avatarUrl: contact.avatarUrl } : {}),
    email: contact.email,
    role,
  };
}

interface AuthValue {
  user: SessionUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<api.LoginResult>;
  logout: () => void;
  refreshUser: (patch: Pick<SessionUser, 'firstName' | 'lastName'>) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (bootConfig.autoRole) {
      const auto = autoRoleUser(bootConfig.autoRole);
      if (auto) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auto));
        return auto;
      }
    }
    return loadStoredUser();
  });

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    if (result.ok) {
      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshUser = useCallback((patch: Pick<SessionUser, 'firstName' | 'lastName'>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, isAdmin: user?.role === 'admin', login, logout, refreshUser }),
    [user, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth doit être utilisé sous AuthProvider');
  return value;
}
