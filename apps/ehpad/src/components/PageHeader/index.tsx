import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './PageHeader.module.css';

export interface Crumb {
  label: string;
  to?: string | undefined;
}

interface PageHeaderProps {
  /** Le h1 = exactement le libellé de navigation (repérage). */
  title: string;
  crumbs?: Crumb[] | undefined;
  intro?: string | undefined;
  actions?: ReactNode | undefined;
}

export function PageHeader({ title, crumbs, intro, actions }: PageHeaderProps) {
  const fr = useStrings();
  return (
    <header className={styles.header}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label={fr.a11y.breadcrumb} className={styles.crumbs}>
          <ol>
            {crumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`}>
                {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                {index < crumbs.length - 1 && <ChevronRight className={styles.sep} aria-hidden />}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {intro && <p className={styles.intro}>{intro}</p>}
    </header>
  );
}
