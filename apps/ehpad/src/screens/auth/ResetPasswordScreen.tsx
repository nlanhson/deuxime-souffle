import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAsync } from '@/hooks/useAsync';
import { Button, ButtonLink } from '@/components/Button';
import { InlineAlert } from '@/components/InlineAlert';
import { Skeleton, SkeletonGroup } from '@/components/Skeleton';
import { TextField } from '@/components/TextField';
import { AuthLayout } from './AuthLayout';
import { PasswordRules, passwordValid } from './PasswordRules';
import styles from './auth.module.css';

/** AUTH-07 — définition du nouveau mot de passe. */
export default function ResetPasswordScreen() {
  const fr = useStrings();
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const check = useAsync(() => api.checkResetToken(token), [token]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  if (check.loading) {
    return (
      <AuthLayout title={fr.auth.reset.title}>
        <SkeletonGroup>
          <p className={styles.subtitle}>{fr.auth.reset.checking}</p>
          <Skeleton height={52} radius="var(--radius-md)" />
          <Skeleton height={52} radius="var(--radius-md)" />
        </SkeletonGroup>
      </AuthLayout>
    );
  }

  const status = check.error || !check.data ? 'invalid' : check.data;

  if (status === 'expired') {
    return (
      <AuthLayout title={fr.auth.reset.title}>
        <InlineAlert variant="danger" title={fr.auth.reset.expired}>
          {fr.auth.reset.expiredBody}
        </InlineAlert>
        <div className={styles.actions}>
          <ButtonLink to="/mot-de-passe-oublie">{fr.auth.reset.requestNew}</ButtonLink>
        </div>
      </AuthLayout>
    );
  }

  if (status !== 'valid') {
    return (
      <AuthLayout title={fr.auth.reset.title}>
        <InlineAlert variant="danger" title={fr.auth.reset.invalid}>
          {fr.auth.reset.invalidBody}
        </InlineAlert>
        <div className={styles.actions}>
          <ButtonLink to="/mot-de-passe-oublie">{fr.auth.reset.requestNew}</ButtonLink>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title={fr.auth.reset.success}>
        <InlineAlert variant="success" title={fr.auth.reset.success}>
          {fr.auth.reset.successBody}
        </InlineAlert>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => navigate('/connexion')}>
            {fr.auth.activate.goToLogin}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const passwordOk = passwordValid(password);
    const confirmOk = confirm === password;
    setPasswordError(passwordOk ? null : fr.auth.passwordRules.notMet);
    setConfirmError(confirmOk ? null : fr.auth.passwordRules.mismatch);
    if (!passwordOk || !confirmOk) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.resetPassword(token);
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={fr.auth.reset.title}>
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField
          label={fr.auth.reset.newPassword}
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (passwordError) setPasswordError(null);
          }}
          onBlur={() => setPasswordError(passwordValid(password) ? null : fr.auth.passwordRules.notMet)}
          error={passwordError}
          required
          autoComplete="new-password"
        />
        <PasswordRules password={password} />
        <TextField
          label={fr.auth.reset.confirm}
          type="password"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            if (confirmError) setConfirmError(null);
          }}
          onBlur={() => setConfirmError(confirm === password ? null : fr.auth.passwordRules.mismatch)}
          error={confirmError}
          required
          autoComplete="new-password"
        />
        <div className={styles.actions}>
          <Button type="submit" variant="primary" loading={busy}>
            {fr.auth.reset.submit}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
