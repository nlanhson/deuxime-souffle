import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { Button } from '@/components/Button';
import { InlineAlert } from '@/components/InlineAlert';
import { TextField } from '@/components/TextField';
import { AuthLayout } from './AuthLayout';
import styles from './auth.module.css';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** AUTH-07 — demande de réinitialisation du mot de passe. */
export default function ForgotPasswordScreen() {
  const fr = useStrings();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const validate = (): boolean => {
    if (email.trim() === '') {
      setError(fr.common.requiredField);
      return false;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(fr.auth.forgot.emailInvalid);
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title={fr.auth.forgot.title}>
        <InlineAlert variant="success" title={fr.auth.forgot.sent}>
          {fr.auth.forgot.sentBody}
        </InlineAlert>
        <Link className={styles.link} to="/connexion">
          {fr.auth.forgot.backToLogin}
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={fr.auth.forgot.title} subtitle={fr.auth.forgot.subtitle}>
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField
          label={fr.auth.forgot.email}
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (error) setError(null);
          }}
          onBlur={validate}
          error={error}
          required
          autoComplete="email"
        />
        <div className={styles.actions}>
          <Button type="submit" variant="primary" loading={busy}>
            {fr.auth.forgot.submit}
          </Button>
        </div>
      </form>
      <Link className={styles.link} to="/connexion">
        {fr.auth.forgot.backToLogin}
      </Link>
    </AuthLayout>
  );
}
