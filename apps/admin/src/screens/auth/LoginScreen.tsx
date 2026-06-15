import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useStrings } from '@/i18n';
import styles from './LoginScreen.module.css';

export function LoginScreen() {
  const fr = useStrings();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('camille.roussel@deuxiemesouffle.fr');
  const [password, setPassword] = useState('');

  // Already signed in (e.g. via ?role=admin or a persisted session) → skip the form.
  if (user) return <Navigate to="/" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // STUB: no real auth — any credentials sign you into the prototype.
    login(email.trim() || undefined);
    navigate('/', { replace: true });
  }

  return (
    <main className={styles.screen}>
      <div className={styles.stack}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.brand}>
            <img src="/brand/picto-black.svg" alt="" width={48} height={48} className={styles.logo} />
            <div>
              <p className={styles.brandName}>{fr.app.brandName}</p>
              <p className={styles.brandTag}>{fr.login.brandTag}</p>
            </div>
          </div>

          <h1 className={styles.title}>{fr.login.title}</h1>

          <label className={styles.field}>
            <span className={styles.label}>{fr.login.emailLabel}</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>{fr.login.passwordLabel}</span>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder={fr.login.passwordPlaceholder}
            />
          </label>

          <Button type="submit" className={styles.submit}>
            {fr.login.submit}
          </Button>

          <p className={styles.hint}>
            {fr.login.hintBefore}
            <code>?role=admin</code>
            {fr.login.hintAfter}
          </p>
        </form>

        <LanguageSwitcher />
      </div>
    </main>
  );
}
