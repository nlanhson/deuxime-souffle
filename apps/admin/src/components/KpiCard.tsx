import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react';
import styles from './KpiCard.module.css';

export interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  /** Render the numeral in the gold data-lead tone (key operational metrics). */
  lead?: boolean;
  trend?: { dir: 'up' | 'down' | 'flat'; label: string };
}

const TREND_ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus } as const;

export function KpiCard({ label, value, hint, icon: Icon, lead = false, trend }: KpiCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.dir] : null;
  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        {Icon ? <Icon size={18} className={styles.icon} aria-hidden /> : null}
      </div>
      <div className={`${styles.value} ${lead ? styles.lead : ''}`}>{value}</div>
      <div className={styles.foot}>
        {trend && TrendIcon ? (
          <span className={`${styles.trend} ${styles[`trend_${trend.dir}`]}`}>
            <TrendIcon size={14} aria-hidden />
            {trend.label}
          </span>
        ) : null}
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
    </div>
  );
}
