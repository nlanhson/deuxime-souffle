import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max: number;
  /** Phrase complète, ex. « 19 séances réalisées sur 34 ». */
  label: string;
}

/** Barre de progression santé — remplissage vert, valeur toujours en toutes lettres. */
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <span className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
