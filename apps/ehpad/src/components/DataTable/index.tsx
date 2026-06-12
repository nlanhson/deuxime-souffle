import { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: ((row: T) => string | number) | undefined;
  align?: 'left' | 'right' | undefined;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  /** Tri initial : clé de colonne préfixée de `-` pour descendant. */
  defaultSort?: string | undefined;
  onRowClick?: ((row: T) => void) | undefined;
}

/** Table de données — en-tête épinglé, lignes ≥ 56px, tri accessible ;
 *  passe en cartes empilées sous 720px (pas de défilement horizontal). */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  defaultSort,
  onRowClick,
}: DataTableProps<T>) {
  const fr = useStrings();
  const [sort, setSort] = useState<string | null>(defaultSort ?? null);

  const sortKey = sort?.replace(/^-/, '');
  const sortDesc = sort?.startsWith('-') ?? false;
  const sortColumn = columns.find((c) => c.key === sortKey && c.sortValue);

  const sorted = sortColumn
    ? [...rows].sort((a, b) => {
        const va = sortColumn.sortValue?.(a) ?? '';
        const vb = sortColumn.sortValue?.(b) ?? '';
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortDesc ? -cmp : cmp;
      })
    : rows;

  const toggleSort = (key: string) => {
    setSort((current) => (current === key ? `-${key}` : current === `-${key}` ? key : key));
  };

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSorted = sortKey === column.key && sortColumn;
              const SortIcon = !isSorted ? ArrowUpDown : sortDesc ? ArrowDown : ArrowUp;
              return (
                <th
                  key={column.key}
                  scope="col"
                  data-align={column.align ?? 'left'}
                  {...(isSorted
                    ? { 'aria-sort': sortDesc ? 'descending' : 'ascending' }
                    : {})}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className={styles.sortBtn}
                      onClick={() => toggleSort(column.key)}
                      aria-label={`${fr.a11y.sortBy(column.header)}${isSorted ? ` — ${sortDesc ? fr.a11y.sortDesc : fr.a11y.sortAsc}` : ''}`}
                    >
                      {column.header}
                      <SortIcon className={styles.sortIcon} aria-hidden />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              className={onRowClick ? styles.clickable : undefined}
              onClick={
                onRowClick
                  ? (event) => {
                      // les actions imbriquées (boutons, liens) gardent la main
                      if ((event.target as HTMLElement).closest('a, button, input, label')) return;
                      onRowClick(row);
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <td key={column.key} data-align={column.align ?? 'left'} data-label={column.header}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
