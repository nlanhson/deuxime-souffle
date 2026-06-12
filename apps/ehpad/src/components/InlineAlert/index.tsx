import type { ReactNode } from 'react';
import { CheckCircle2, Info, OctagonX, TriangleAlert } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './InlineAlert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface InlineAlertProps {
  variant: AlertVariant;
  title?: string | undefined;
  children?: ReactNode | undefined;
  action?: ReactNode | undefined;
  /** Pleine largeur, coller en tête de page (bannière factures en retard…). */
  banner?: boolean | undefined;
}

const ICONS = { info: Info, success: CheckCircle2, warning: TriangleAlert, danger: OctagonX };

/** Message persistant en contexte. L'icône + le mot désambiguïsent toujours la
 *  couleur — le danger utilise le rouge sombre + ⊗ + le mot « Erreur ». */
export function InlineAlert({ variant, title, children, action, banner }: InlineAlertProps) {
  const fr = useStrings();
  const Icon = ICONS[variant];
  const role = variant === 'info' || variant === 'success' ? 'status' : 'alert';
  const heading = variant === 'danger' ? (title ?? fr.common.error) : title;
  return (
    <div className={`${styles.alert} ${banner ? styles.banner : ''}`} data-variant={variant} role={role}>
      <Icon className={styles.icon} aria-hidden />
      <div className={styles.content}>
        {heading && <p className={styles.title}>{heading}</p>}
        {children && <div className={styles.body}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
