import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from '@/components/forms.module.css';

interface CheckboxProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helper?: ReactNode | undefined;
  disabled?: boolean | undefined;
  /** `card` = carte bordée tappable (étape Unités du wizard), comme les radios `card`. */
  appearance?: 'row' | 'card' | undefined;
}

/** Case à cocher — contrôle ≥ 24px, rangée entière cliquable (cible ≥ 44px),
 *  l'état coché = remplissage bleu ET coche. */
export function Checkbox({ label, checked, onChange, helper, disabled, appearance = 'row' }: CheckboxProps) {
  const rowClass = appearance === 'card' ? styles.choiceCard : styles.choiceRow;
  return (
    <label
      className={rowClass}
      data-checked={(appearance === 'card' && checked) || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        type="checkbox"
        className={styles.srInput}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span className={styles.box} aria-hidden>
        <Check size={16} />
      </span>
      <span className={styles.choiceLabel}>
        {label}
        {helper && <span className={styles.choiceHelper}>{helper}</span>}
      </span>
    </label>
  );
}
