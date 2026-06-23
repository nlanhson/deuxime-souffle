/**
 * AuthContext — the app's authentication + account-status seam (E01 — Auth & Account).
 *
 * PROTOTYPE: in-memory only. Models the coach account lifecycle the brief defines:
 *   signedOut → (register) → pending → (admin validates) → approved → (enter) → active
 *               (signIn, existing coach) ─────────────────────────────────────→ active
 * `approved` is the transient welcome beat (AcceptedScreen, AUTH-07) shown once before the app.
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

// 'approved' is a transient WELCOME beat between pending and active: the team has validated the
// account, so we show the "you're in" screen once, then `enter()` lands the coach in the app.
export type AccountStatus = 'signedOut' | 'pending' | 'approved' | 'active';
export type OnboardingEntry = 'splash' | 'signup' | 'login';

type AuthState = {
  status: AccountStatus;
  /** First name captured at registration, for greeting on the pending/accepted screens (null after login). */
  applicantName: string | null;
  /** Which onboarding screen to resume on when returning to the signed-out flow. */
  onboardingEntry: OnboardingEntry;
  signIn: () => void;
  register: (firstName?: string) => void;
  signOut: () => void;
  /** Leave the pending screen back to the Apply-to-coach form (not the splash). */
  backToSignup: () => void;
  /** Admin validates a pending account → show the welcome/accepted screen (AUTH-07). */
  approve: () => void;
  /** Leave the accepted screen → the active app. */
  enter: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountStatus>('signedOut');
  const [applicantName, setApplicantName] = useState<string | null>(null);
  // Where the onboarding flow resumes when we re-enter it: 'splash' on a cold start, 'login' after a
  // manual log-out (a returning coach lands straight on Login, not the splash), and 'signup' when
  // backing out of the pending screen (so the user lands on the Apply form, not splash).
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
        // A manual log-out returns a known coach to the Login screen (not the splash beat).
        setOnboardingEntry('login');
        setStatus('signedOut');
      },
      backToSignup: () => {
        setApplicantName(null);
        setOnboardingEntry('signup');
        setStatus('signedOut');
      },
      // pending → approved (the welcome beat) → active. `enter` keeps the captured first name so the
      // active app's first-run greeting can use it; a later manual log-out resets it via signOut.
      approve: () => setStatus('approved'),
      enter: () => setStatus('active'),
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
