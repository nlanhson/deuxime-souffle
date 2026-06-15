import type { ReactNode } from 'react';
import styles from './Pill.module.css';

type Tone = 'neutral' | 'info' | 'progress' | 'warning' | 'danger' | 'reward';

interface PillProps {
  tone?: Tone;
  children: ReactNode;
}

/** Compact status label — colour is always paired with text (never colour alone). */
export function Pill({ tone = 'neutral', children }: PillProps) {
  return <span className={`${styles.pill} ${styles[tone]}`}>{children}</span>;
}
