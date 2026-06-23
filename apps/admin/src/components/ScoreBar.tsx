import styles from './ScoreBar.module.css';

interface ScoreBarProps {
  label: string;
  /** 0–100. */
  value: number;
  /** Show the numeric value at the end of the row. */
  showValue?: boolean | undefined;
  tone?: 'accent' | 'progress' | 'reward' | 'info' | undefined;
}

/** Horizontal meter for a composite-score component or any 0–100 ratio. */
export function ScoreBar({ label, value, showValue = true, tone = 'info' }: ScoreBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.track}>
        <span
          className={styles.fill}
          data-tone={tone}
          style={{ width: `${pct}%` }}
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </span>
      {showValue ? <span className={styles.value}>{pct}</span> : null}
    </div>
  );
}
