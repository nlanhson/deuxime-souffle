import { useId, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import styles from './Filters.module.css';

interface ToolbarProps {
  children: ReactNode;
  /** Right-aligned slot (actions / result count). */
  end?: ReactNode | undefined;
}

/** Filter row above a table — controls on the left, actions on the right. */
export function Toolbar({ children, end }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.start}>{children}</div>
      {end ? <div className={styles.end}>{end}</div> : null}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export function SearchInput({ value, onChange, placeholder, label }: SearchInputProps) {
  const id = useId();
  return (
    <div className={styles.search}>
      <Search size={16} className={styles.searchIcon} aria-hidden />
      <input
        id={id}
        type="search"
        className={styles.searchInput}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}

export function Select({ value, onChange, options, label }: SelectProps) {
  return (
    <select
      className={styles.select}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
