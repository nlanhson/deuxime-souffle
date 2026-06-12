import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  /** `interactive` = toute la carte est un lien. `inline` = sans ombre, bord fin. */
  variant?: 'static' | 'interactive' | 'inline' | undefined;
  to?: string | undefined;
  accent?: boolean | undefined;
  className?: string | undefined;
  ariaLabel?: string | undefined;
}

export function Card({ children, variant = 'static', to, accent, className, ariaLabel }: CardProps) {
  const cls = [styles.card, accent ? styles.accent : '', className ?? ''].join(' ').trim();
  if (variant === 'interactive' && to) {
    return (
      <Link to={to} className={cls} data-variant={variant} {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}>
        {children}
      </Link>
    );
  }
  return (
    <div className={cls} data-variant={variant}>
      {children}
    </div>
  );
}

interface CardSectionProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode | undefined;
}

/** Carte titrée — le « chunking » du profil établissement et des détails. */
export function CardSection({ title, children, actions }: CardSectionProps) {
  return (
    <section className={styles.card} data-variant="static">
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {actions}
      </header>
      {children}
    </section>
  );
}
