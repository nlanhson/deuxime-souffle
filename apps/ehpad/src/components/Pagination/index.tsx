import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './Pagination.module.css';

interface PaginationProps {
  /** Page courante (1-based). */
  page: number;
  /** Nombre total de pages. */
  pageCount: number;
  onChange: (page: number) => void;
  /** `'plain'` retire la bordure des flèches (style allégé, ex. pied de table) ;
   *  le repère visuel passe alors par un fond au survol. Défaut : `'bordered'`. */
  variant?: 'bordered' | 'plain' | undefined;
}

/** Pagination « précédent / suivant » + indicateur « Page X sur Y ». Bornée : aux
 *  extrémités, la flèche concernée est `aria-disabled` (et non `disabled`) pour
 *  garder le focus clavier plutôt que de le perdre vers le `body`. Cibles ≥ 44px
 *  (usage tablette). Ne rend rien s'il n'y a qu'une seule page. */
export function Pagination({ page, pageCount, onChange, variant = 'bordered' }: PaginationProps) {
  const fr = useStrings();
  if (pageCount <= 1) return null;

  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  return (
    <nav
      className={`${styles.pagination}${variant === 'plain' ? ` ${styles.plain}` : ''}`}
      aria-label={fr.pagination.label}
    >
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => !atStart && onChange(page - 1)}
        aria-disabled={atStart}
        aria-label={fr.pagination.previous}
      >
        <ChevronLeft aria-hidden />
      </button>
      <span className={styles.status} aria-live="polite">
        {fr.pagination.status(page, pageCount)}
      </span>
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => !atEnd && onChange(page + 1)}
        aria-disabled={atEnd}
        aria-label={fr.pagination.next}
      >
        <ChevronRight aria-hidden />
      </button>
    </nav>
  );
}
