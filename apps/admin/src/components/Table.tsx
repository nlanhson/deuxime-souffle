import type { ReactNode } from 'react';
import styles from './Table.module.css';

export interface Column<T> {
  key: string;
  header: string;
  /** Cell renderer; defaults to `String(row[key])` when omitted. */
  render?: (row: T) => ReactNode;
  align?: 'start' | 'end' | undefined;
  /** Hide on narrow viewports (secondary column). */
  secondary?: boolean | undefined;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  ariaLabel: string;
  /** Optional id of the currently selected row (highlights it). */
  selectedKey?: string | null | undefined;
  empty?: ReactNode | undefined;
}

/**
 * Compact data table — the back-office's primary list idiom. Header in the
 * label tone, hairline row separators, whole-row click when `onRowClick` is set
 * (rendered as a real <button> for keyboard + screen-reader parity).
 */
export function Table<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  ariaLabel,
  selectedKey,
  empty,
}: TableProps<T>) {
  if (rows.length === 0 && empty) {
    return <div className={styles.empty}>{empty}</div>;
  }
  return (
    <div className={styles.scroll}>
      <table className={styles.table} aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={[
                  c.align === 'end' ? styles.end : '',
                  c.secondary ? styles.secondary : '',
                ].join(' ')}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = getRowKey(row);
            const clickable = Boolean(onRowClick);
            return (
              <tr
                key={key}
                className={[
                  clickable ? styles.clickable : '',
                  selectedKey === key ? styles.selected : '',
                ].join(' ')}
                {...(clickable
                  ? {
                      tabIndex: 0,
                      role: 'button',
                      onClick: () => onRowClick?.(row),
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick?.(row);
                        }
                      },
                    }
                  : {})}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={[
                      c.align === 'end' ? styles.end : '',
                      c.secondary ? styles.secondary : '',
                    ].join(' ')}
                  >
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
