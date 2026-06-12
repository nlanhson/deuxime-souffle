import type { ReactNode } from 'react';
import { useStrings } from '@/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Logo } from '@/components/Logo';
import styles from './auth.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Cadre des écrans hors coquille (connexion, activation, réinitialisation). */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const fr = useStrings();
  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <div className={styles.lockup}>
          <Logo size={48} />
          <p className={styles.brand}>
            {fr.app.name}
            <span className={styles.brandSub}>{fr.app.space}</span>
          </p>
        </div>
        <div className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {children}
      </main>
      {/* Hors de la carte : la bascule de langue reste après le contenu principal
          dans l'ordre de tabulation, posée sur le papier sous la carte. */}
      <LanguageSwitcher tone="auth" />
    </div>
  );
}
