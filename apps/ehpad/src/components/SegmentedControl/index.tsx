import { useId } from 'react';
import styles from './SegmentedControl.module.css';

interface SegmentedControlProps<V extends string> {
  label: string;
  options: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
}

/** Bascule de vue (Mois · Semaine · Liste) — radios masquées : clavier natif. */
export function SegmentedControl<V extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<V>) {
  const name = useId();
  return (
    <fieldset className={styles.group}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.segment} data-active={value === option.value || undefined}>
          <input
            type="radio"
            className={styles.input}
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
