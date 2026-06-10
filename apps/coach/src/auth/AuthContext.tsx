/**
 * AuthContext — the app's authentication + account-status seam (E01 — Auth & Account).
 *
 * PROTOTYPE: in-memory only. Models the coach account lifecycle the brief defines:
 *   signedOut → (register) → pending  → (admin validates) → active
 *               (signIn, existing coach) ───────────────────→ active
 * `register` mirrors "Coach self-registration … with admin validation": it creates a
 * PENDING_APPROVAL account, so the App gate locks the coach onto the pending-approval screen
 * until an admin approves (here, there's no backend, so approval doesn't happen yet). `signIn`
 * is the existing-coach path → active. `signOut` returns to onboarding.
 *
 * When the stack lands, replace the body with Supabase auth + the real status from the backend
 * (Active · Pending · Inactive · Suspended) and persist the session. The surface — `useAuth()`
 * returning `{ status, applicantName, signIn, register, signOut }` — is meant to stay.
 */
import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type AccountStatus = 'signedOut' | 'pending' | 'active';
export type OnboardingEntry = 'splash' | 'signup';

type AuthState = {
  status: AccountStatus;
  /** First name captured at registration, for greeting on the pending screen (null after login). */
  applicantName: string | null;
  /** Which onboarding screen to resume on when returning to the signed-out flow. */
  onboardingEntry: OnboardingEntry;
  signIn: () => void;
  register: (firstName?: string) => void;
  signOut: () => void;
  /** Leave the pending screen back to the Apply-to-coach form (not the splash). */
  backToSignup: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountStatus>('signedOut');
  const [applicantName, setApplicantName] = useState<string | null>(null);
  // Where the onboarding flow resumes when we re-enter it: 'splash' on a cold start / full sign-out,
  // 'signup' when backing out of the pending screen (so the user lands on the Apply form, not splash).
  const [onboardingEntry, setOnboardingEntry] = useState<OnboardingEntry>('splash');

  const value = useMemo<AuthState>(
    () => ({
      status,
      applicantName,
      onboardingEntry,
      signIn: () => {
        setApplicantName(null);
        setOnboardingEntry('splash');
        setStatus('active');
      },
      register: (firstName?: string) => {
        setApplicantName(firstName?.trim() ? firstName.trim() : null);
        setStatus('pending');
      },
      signOut: () => {
        setApplicantName(null);
        setOnboardingEntry('splash');
        setStatus('signedOut');
      },
      backToSignup: () => {
        setApplicantName(null);
        setOnboardingEntry('signup');
        setStatus('signedOut');
      },
    }),
    [status, applicantName, onboardingEntry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
