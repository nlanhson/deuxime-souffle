import { useRef } from 'react';
import styles from './Tabs.module.css';

export interface TabDef {
  id: string;
  label: string;
  count?: number | undefined;
}

interface TabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
  label: string;
  idBase: string;
}

export const tabId = (base: string, id: string) => `${base}-tab-${id}`;
export const panelId = (base: string, id: string) => `${base}-panel-${id}`;

/** Onglets en page — indicateur bleu + libellé Oswald, navigation aux flèches. */
export function Tabs({ tabs, active, onChange, label, idBase }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === active);
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    const target = tabs[next];
    if (next >= 0 && target) {
      event.preventDefault();
      onChange(target.id);
      listRef.current
        ?.querySelector<HTMLButtonElement>(`#${tabId(idBase, target.id)}`)
        ?.focus();
    }
  };

  return (
    <div className={styles.tablist} role="tablist" aria-label={label} ref={listRef}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={tabId(idBase, tab.id)}
            aria-selected={isActive}
            aria-controls={panelId(idBase, tab.id)}
            tabIndex={isActive ? 0 : -1}
            className={styles.tab}
            data-active={isActive || undefined}
            onClick={() => onChange(tab.id)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
            {tab.count !== undefined && <span className={styles.count}>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
