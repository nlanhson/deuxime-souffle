import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  count?: number | undefined;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}

/** Segmented tab bar — soft-red veil marks the active tab (admin selected idiom). */
export function Tabs({ items, active, onChange, ariaLabel }: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {items.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={styles.tab}
            data-active={isActive || undefined}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {t.count !== undefined ? <span className={styles.count}>{t.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
