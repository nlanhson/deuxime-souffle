import { useId } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from '@/components/forms.module.css';

export interface RadioOption<V extends string> {
  value: V;
  label: string;
  helper?: string | undefined;
}

interface RadioGroupProps<V extends string> {
  legend: string;
  value: V | null;
  onChange: (value: V) => void;
  options: RadioOption<V>[];
  /** `card` = grandes cartes tappables (flux d'évaluation, wizard). */
  appearance?: 'row' | 'card' | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
}

/** Groupe radio — fieldset/legend, exactement un choix, flèches natives. */
export function RadioGroup<V extends string>({
  legend,
  value,
  onChange,
  options,
  appearance = 'row',
  error,
  required,
  disabled,
}: RadioGroupProps<V>) {
  const fr = useStrings();
  const name = useId();
  const rowClass = appearance === 'card' ? styles.choiceCard : styles.choiceRow;
  return (
    <fieldset className={styles.fieldset} aria-invalid={error ? true : undefined}>
      <legend className={styles.legend}>
        {legend}
        {required && <span className={styles.required}> ({fr.common.required})</span>}
      </legend>
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label key={option.value} className={rowClass} data-checked={checked || undefined}>
            <input
              type="radio"
              className={styles.srInput}
              name={name}
              checked={checked}
              onChange={() => onChange(option.value)}
              disabled={disabled}
            />
            <span className={`${styles.box} ${styles.round}`} aria-hidden>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'currentcolor',
                }}
              />
            </span>
            <span className={styles.choiceLabel}>
              {option.label}
              {option.helper && <span className={styles.choiceHelper}>{option.helper}</span>}
            </span>
          </label>
        );
      })}
      <div aria-live="polite">
        {error && (
          <p className={styles.errorMsg}>
            <TriangleAlert className={styles.errorIcon} aria-hidden />
            <span>{error}</span>
          </p>
        )}
      </div>
    </fieldset>
  );
}
