import { Skeleton } from '@/components/Skeleton';
import type { Column } from './index';
import styles from './DataTable.module.css';

/** Squelette de chargement à la forme exacte de la table : panneau bordé, bande
 *  d'en-tête, lignes à 52px séparées d'un filet. Les colonnes reprennent les
 *  largeurs ET l'alignement réels (passés via `columns`) — la barre tombe sous la
 *  bonne colonne et la forme ne change pas au passage chargement → données.
 *  Décoratif (`aria-hidden`) : l'annonce « Chargement… » vit dans `SkeletonGroup`. */
export function DataTableSkeleton<T>({
  columns,
  rows = 6,
  footer = false,
}: {
  columns: Column<T>[];
  rows?: number;
  /** Rend aussi le pied (pagination + résumé) sous le panneau — pour les tables paginées. */
  footer?: boolean;
}) {
  const template = columns.map((column) => column.width ?? '1fr').join(' ');
  return (
    <>
      <div className={styles.skeleton} aria-hidden>
        <div className={styles.skeletonHeader} style={{ gridTemplateColumns: template }}>
          {columns.map((column) => (
            <span key={column.key} className={styles.skeletonCell} data-align={column.align ?? 'left'}>
              <Skeleton height={12} width="50%" />
            </span>
          ))}
        </div>
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className={styles.skeletonRow} style={{ gridTemplateColumns: template }}>
            {columns.map((column) => (
              <span key={column.key} className={styles.skeletonCell} data-align={column.align ?? 'left'}>
                <Skeleton height={14} width={column.align === 'right' ? '55%' : '72%'} />
              </span>
            ))}
          </div>
        ))}
      </div>
      {footer && (
        <div className={styles.skeletonFooter} aria-hidden>
          <span style={{ gridColumn: 2 }}>
            <Skeleton height={36} width={140} radius="var(--radius-pill)" />
          </span>
          <span className={styles.footerSummary}>
            <Skeleton height={12} width={80} radius="var(--radius-pill)" />
          </span>
        </div>
      )}
    </>
  );
}
