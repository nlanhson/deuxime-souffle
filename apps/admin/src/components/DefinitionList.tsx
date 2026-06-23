import type { ReactNode } from 'react';
import styles from './DefinitionList.module.css';

export interface DefItem {
  term: string;
  value: ReactNode;
}

interface DefinitionListProps {
  items: DefItem[];
  /** Two columns on wide panels; one on narrow. */
  columns?: 1 | 2 | undefined;
}

/** Term/value grid for detail panels (profiles, session reports, invoices). */
export function DefinitionList({ items, columns = 2 }: DefinitionListProps) {
  return (
    <dl className={styles.list} data-columns={columns}>
      {items.map((it) => (
        <div key={it.term} className={styles.pair}>
          <dt className={styles.term}>{it.term}</dt>
          <dd className={styles.value}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
