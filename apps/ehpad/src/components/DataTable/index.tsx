import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useStrings } from '@/i18n';
import { Pagination } from '@/components/Pagination';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: ((row: T) => string | number) | undefined;
  align?: 'left' | 'right' | undefined;
  /** Largeur fixe de la colonne (ex. `'160px'`). Dès qu'une colonne en porte une,
   *  la table passe en `table-layout: fixed` : les colonnes s'alignent au pixel
   *  et le texte trop long se tronque au lieu de pousser ses voisines. */
  width?: string | undefined;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  /** Tri initial : clé de colonne préfixée de `-` pour descendant. */
  defaultSort?: string | undefined;
  onRowClick?: ((row: T) => void) | undefined;
  /** Remplit la hauteur restante et fait défiler les lignes en interne, en-tête
   *  épinglé (façon console Intercom). Sans ça, la table suit le défilement de
   *  la page (comportement par défaut, conservé pour les factures). */
  fillHeight?: boolean | undefined;
  /** Active la pagination interne : la table trie TOUTES les lignes puis n'affiche
   *  que `pageSize` lignes par page (flèches « précédent / suivant » en pied).
   *  Omis → aucune pagination (comportement par défaut, factures intactes). */
  pageSize?: number | undefined;
  /** Appoint affiché à droite du pied (ex. « 7 résultats »). Indépendant de la
   *  pagination : un pied apparaît dès que `summary` ou `pageSize` est fourni. */
  summary?: ReactNode | undefined;
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
  fillHeight = false,
  pageSize,
  summary,
}: DataTableProps<T>) {
  const fr = useStrings();
  const [sort, setSort] = useState<string | null>(defaultSort ?? null);
  const [page, setPage] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hasWidths = columns.some((c) => c.width);

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

  // Pagination interne : on trie d'abord TOUTES les lignes (le tri reste global,
  // jamais limité à la page courante), puis on ne rend que la tranche demandée.
  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const visible = pageSize
    ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sorted;

  // Le jeu de lignes (filtre/recherche) ou le tri changent → retour page 1.
  useEffect(() => {
    setPage(1);
  }, [rows, sort]);

  const toggleSort = (key: string) => {
    setSort((current) => (current === key ? `-${key}` : current === `-${key}` ? key : key));
  };

  const goToPage = (next: number) => {
    setPage(next);
    const el = wrapRef.current;
    if (el) {
      // En mode pleine hauteur, c'est ce conteneur qui défile : on le remet en haut.
      if (fillHeight) el.scrollTop = 0;
      // Puis on ramène le haut de la table en vue (défilement de page éventuel).
      el.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <>
    <div
      ref={wrapRef}
      className={`${styles.wrap}${fillHeight ? ` ${styles.fill}` : ''}`}
      {...(fillHeight ? { tabIndex: 0, 'aria-label': caption } : {})}
    >
      <table className={`${styles.table}${hasWidths ? ` ${styles.fixed}` : ''}`}>
        <caption className="sr-only">{caption}</caption>
        {hasWidths && (
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} {...(column.width ? { style: { width: column.width } } : {})} />
            ))}
          </colgroup>
        )}
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
                  {...(isSorted ? { 'data-sorted': 'true' } : {})}
                  {...(isSorted
                    ? { 'aria-sort': sortDesc ? 'descending' : 'ascending' }
                    : {})}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className={styles.sortBtn}
                      onClick={() => toggleSort(column.key)}
                      aria-label={`${fr.a11y.sortBy(column.header)}${isSorted ? `, ${sortDesc ? fr.a11y.sortDesc : fr.a11y.sortAsc}` : ''}`}
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
          {visible.map((row) => (
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
      {(pageSize || summary != null) && (
        <div className={styles.footer}>
          {pageSize ? (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onChange={goToPage}
              variant="plain"
            />
          ) : null}
          {summary != null && <span className={styles.footerSummary}>{summary}</span>}
        </div>
      )}
    </>
  );
}
