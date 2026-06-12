import type { ReactNode } from 'react';
import styles from './KpiCard.module.css';

interface KpiCardProps {
  eyebrow: string;
  value: string | number;
  unit?: string | undefined;
  detail?: ReactNode | undefined;
  /** Neutre par défaut (une stat informe sans attirer l'œil). Les teintes
   *  sont réservées aux cas sémantiques explicites (santé/alerte). */
  tone?: 'neutral' | 'accent' | 'progress' | undefined;
  action?: ReactNode | undefined;
}

/** Carte KPI — chiffre d'affichage, neutre par défaut. Le détail dit la
 *  direction en toutes lettres ; la couleur ne sert que sur demande explicite. */
export function KpiCard({ eyebrow, value, unit, detail, tone = 'neutral', action }: KpiCardProps) {
  return (
    <div className={styles.kpi} data-tone={tone}>
      <p className={styles.eyebrow}>{eyebrow}</p>
    <p className={styles.value}>
        <span className={styles.number}>{value}</span>
        {unit && <span className={styles.unit}> {unit}</span>}
      </p>
      {detail && <div className={styles.detail}>{detail}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
