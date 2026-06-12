import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CircleAlert, Inbox, SearchX } from 'lucide-react';
import { useStrings } from '@/i18n';
import { Button } from '@/components/Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  variant?: 'first-run' | 'no-results' | 'error' | undefined;
  icon?: LucideIcon | undefined;
  title: string;
  body?: string | undefined;
  action?: ReactNode | undefined;
  onRetry?: (() => void) | undefined;
}

/** Transforme un cul-de-sac en prochaine étape — chaleureux, jamais culpabilisant. */
export function EmptyState({ variant = 'first-run', icon, title, body, action, onRetry }: EmptyStateProps) {
  const fr = useStrings();
  const Icon = icon ?? (variant === 'error' ? CircleAlert : variant === 'no-results' ? SearchX : Inbox);
  return (
    <div className={styles.empty} data-variant={variant} {...(variant === 'error' ? { role: 'alert' } : {})}>
      <Icon className={styles.icon} aria-hidden />
      <h3 className={styles.title}>{title}</h3>
      {body && <p className={styles.body}>{body}</p>}
      {(action || onRetry) && (
        <div className={styles.action}>
          {action}
          {onRetry && <Button onClick={onRetry}>{fr.common.retry}</Button>}
        </div>
      )}
    </div>
  );
}

/** État d'erreur de chargement standard (toutes les listes/écrans de données). */
export function LoadError({ onRetry }: { onRetry: () => void }) {
  const fr = useStrings();
  return <EmptyState variant="error" title={fr.common.loadError} body={fr.common.genericError} onRetry={onRetry} />;
}
