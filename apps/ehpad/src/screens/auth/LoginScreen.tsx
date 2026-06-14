import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useStrings } from '@/i18n';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { InlineAlert } from '@/components/InlineAlert';
import { TextField } from '@/components/TextField';
import { AuthLayout } from './AuthLayout';
import styles from './auth.module.css';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** AUTH-05 — connexion. */
export default function LoginScreen() {
  const fr = useStrings();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  const validateEmail = () => {
    if (email.trim() === '') {
      setEmailError(fr.common.requiredField);
      return false;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(fr.auth.forgot.emailInvalid);
      return false;
    }
    setEmailError(null);
    return true;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const emailOk = validateEmail();
    const passwordOk = password !== '';
    setPasswordError(passwordOk ? null : fr.common.requiredField);
    if (!emailOk || !passwordOk) return;
    setBusy(true);
    setFormError(null);
    try {
      const result = await login(email, password);
      if (result.ok) {
        const from = (location.state as { from?: string } | null)?.from ?? '/';
        navigate(from, { replace: true });
      } else {
        setFormError(result.reason === 'inactive' ? fr.auth.login.inactive : fr.auth.login.invalid);
      }
    } catch {
      setFormError(fr.common.genericError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={fr.auth.login.title} subtitle={fr.auth.login.subtitle}>
      {formError && <InlineAlert variant="danger" title={formError} autoFocus />}
      <form className={styles.form} onSubmit={submit} noValidate>
        <TextField
          label={fr.auth.login.email}
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (emailError) setEmailError(null);
          }}
          onBlur={validateEmail}
          error={emailError}
          required
          autoComplete="email"
        />
        <TextField
          label={fr.auth.login.password}
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError}
          required
          autoComplete="current-password"
        />
        <Link className={styles.link} to="/mot-de-passe-oublie">
          {fr.auth.login.forgot}
        </Link>
        <div className={styles.actions}>
          <Button type="submit" variant="primary" loading={busy}>
            {fr.auth.login.submit}
          </Button>
        </div>
      </form>
      <div className={styles.demo}>
        <p className={styles.demoTitle}>{fr.auth.login.demoHint}</p>
        <p>{fr.auth.login.demoAdmin}</p>
        <p>{fr.auth.login.demoUser}</p>
        <p>{fr.auth.login.demoPassword}</p>
      </div>
    </AuthLayout>
  );
}
