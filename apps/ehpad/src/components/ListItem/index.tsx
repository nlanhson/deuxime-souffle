import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './ListItem.module.css';

interface ListItemProps {
  leading?: ReactNode | undefined;
  primary: ReactNode;
  secondary?: ReactNode | undefined;
  trailing?: ReactNode | undefined;
  /** La ligne entière devient un lien (chevron ajouté). */
  to?: string | undefined;
  unread?: boolean | undefined;
  onClick?: (() => void) | undefined;
}

/** L'atome de toutes les listes — ligne ≥ 56px, séparateur fin. */
export function ListItem({ leading, primary, secondary, trailing, to, unread, onClick }: ListItemProps) {
  const content = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.text}>
        <span className={`${styles.primary} ${unread ? styles.unread : ''}`}>{primary}</span>
        {secondary && <span className={styles.secondary}>{secondary}</span>}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
      {to && <ChevronRight className={styles.chevron} aria-hidden />}
    </>
  );
  if (to) {
    return (
      <li className={styles.item}>
        <Link to={to} className={styles.row}>
          {content}
        </Link>
      </li>
    );
  }
  if (onClick) {
    return (
      <li className={styles.item}>
        <button type="button" onClick={onClick} className={styles.row}>
          {content}
        </button>
      </li>
    );
  }
  return (
    <li className={styles.item}>
      <span className={styles.row}>{content}</span>
    </li>
  );
}

export function List({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul className={styles.list} {...(label ? { 'aria-label': label } : {})}>
      {children}
    </ul>
  );
}
