import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAsync } from '@/hooks/useAsync';
import { Button } from '@/components/Button';
import { InlineAlert } from '@/components/InlineAlert';
import { Skeleton, SkeletonGroup } from '@/components/Skeleton';
import { TextField } from '@/components/TextField';
import { AuthLayout } from './AuthLayout';
import { PasswordRules, passwordValid } from './PasswordRules';
import styles from './auth.module.css';

/** AUTH-04 — activation du compte depuis le lien d'invitation. */
export default function ActivateScreen() {
  const fr = useStrings();
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const check = useAsync(() => api.checkActivationToken(token), [token]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  if (check.loading) {
    return (
      <AuthLayout title={fr.auth.activate.title}>
        <SkeletonGroup>
          <p className={styles.subtitle}>{fr.auth.activate.checkingLink}</p>
          <Skeleton height={52} radius="var(--radius-md)" />
          <Skeleton height={52} radius="var(--radius-md)" />
          <Skeleton height={52} radius="var(--radius-md)" />
        </SkeletonGroup>
      </AuthLayout>
    );
  }

  if (check.error || !check.data || check.data.status !== 'valid') {
    return (
      <AuthLayout title={fr.auth.activate.title}>
        <InlineAlert variant="danger" title={fr.auth.activate.invalidLink}>
          {fr.auth.activate.invalidLinkBody}
        </InlineAlert>
        <div className={styles.actions}>
          <Button onClick={() => navigate('/connexion')}>{fr.auth.activate.goToLogin}</Button>
          <a className={styles.link} href={`mailto:${fr.support.dsEmail}`}>
            {fr.auth.activate.contactDs}
          </a>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title={fr.auth.activate.success}>
        <InlineAlert variant="success" title={fr.auth.activate.success}>
          {fr.auth.activate.successBody}
        </InlineAlert>
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => navigate('/connexion')}>
            {fr.auth.activate.goToLogin}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const setError = (key: string, value: string | null) =>
    setErrors((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string | null> = {
      firstName: firstName.trim() ? null : fr.common.requiredField,
      lastName: lastName.trim() ? null : fr.common.requiredField,
      phone: phone.trim() ? null : fr.common.requiredField,
      password: passwordValid(password) ? null : fr.auth.passwordRules.notMet,
      confirm: confirm === password ? null : fr.auth.passwordRules.mismatch,
    };
    setErrors(next);
    if (Object.values(next).some((v) => v !== null)) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.activateAccount(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={fr.auth.activate.title} subtitle={fr.auth.activate.subtitle}>
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} autoFocus />}
      <form className={`${styles.form} ${styles.formGrouped}`} onSubmit={submit} noValidate>
        {/* Groupe 1 — identité */}
        <div className={styles.fieldGroup}>
          <TextField
            label={fr.auth.activate.firstName}
            value={firstName}
            onChange={(v) => {
              setFirstName(v);
              if (errors.firstName) setError('firstName', null);
            }}
            onBlur={() => setError('firstName', firstName.trim() ? null : fr.common.requiredField)}
            error={errors.firstName ?? null}
            required
            autoComplete="given-name"
          />
          <TextField
            label={fr.auth.activate.lastName}
            value={lastName}
            onChange={(v) => {
              setLastName(v);
              if (errors.lastName) setError('lastName', null);
            }}
            onBlur={() => setError('lastName', lastName.trim() ? null : fr.common.requiredField)}
            error={errors.lastName ?? null}
            required
            autoComplete="family-name"
          />
          <TextField
            label={fr.auth.activate.phone}
            type="tel"
            value={phone}
            onChange={(v) => {
              setPhone(v);
              if (errors.phone) setError('phone', null);
            }}
            onBlur={() => setError('phone', phone.trim() ? null : fr.common.requiredField)}
            error={errors.phone ?? null}
            required
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
        {/* Groupe 2 — informations d'invitation (lecture seule) */}
        <div className={styles.fieldGroup}>
          <TextField
            label={fr.auth.login.email}
            type="email"
            value={check.data.email ?? ''}
            onChange={() => undefined}
            readOnly
            helper={fr.auth.activate.emailHelper}
          />
          <TextField
            label={fr.auth.activate.rolesLabel}
            value={(check.data.roleLabels ?? []).join(', ')}
            onChange={() => undefined}
            readOnly
            helper={fr.auth.activate.rolesHelper}
          />
        </div>
        {/* Groupe 3 — mot de passe */}
        <div className={styles.fieldGroup}>
          <TextField
            label={fr.auth.activate.password}
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password) setError('password', null);
            }}
            onBlur={() =>
              setError('password', passwordValid(password) ? null : fr.auth.passwordRules.notMet)
            }
            error={errors.password ?? null}
            required
            autoComplete="new-password"
          />
          <PasswordRules password={password} />
          <TextField
            label={fr.auth.activate.passwordConfirm}
            type="password"
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              if (errors.confirm) setError('confirm', null);
            }}
            onBlur={() =>
              setError('confirm', confirm === password ? null : fr.auth.passwordRules.mismatch)
            }
            error={errors.confirm ?? null}
            required
            autoComplete="new-password"
          />
        </div>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" loading={busy}>
            {fr.auth.activate.submit}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
