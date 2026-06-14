import { Search } from 'lucide-react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Libellé accessible (le champ n'a pas d'étiquette visible — c'est une pilule). */
  ariaLabel: string;
  placeholder?: string | undefined;
  className?: string | undefined;
}

/** Recherche tertiaire — pilule grise discrète : fond recessé, sans bordure au
 *  repos, anneau net au focus seulement. Elle aide sans capter l'attention (vs.
 *  un champ étiqueté qui crie « remplis-moi »). Partagée par les tables qui se
 *  filtrent au-dessus d'elles (contrats, factures). */
export function SearchInput({ value, onChange, ariaLabel, placeholder, className }: SearchInputProps) {
  return (
    <div className={[styles.searchBox, className ?? ''].join(' ').trim()}>
      <Search className={styles.searchIcon} aria-hidden />
      <input
        type="search"
        className={styles.searchInput}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
