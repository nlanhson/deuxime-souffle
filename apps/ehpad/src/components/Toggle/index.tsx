import styles from './Toggle.module.css';
import forms from '@/components/forms.module.css';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helper?: string | undefined;
  disabled?: boolean | undefined;
}

/** Interrupteur — réglage binaire immédiat ; « on » = remplissage bleu + position. */
export function Toggle({ label, checked, onChange, helper, disabled }: ToggleProps) {
  return (
    <label className={forms.choiceRow} data-disabled={disabled || undefined}>
      <input
        type="checkbox"
        role="switch"
        className={forms.srInput}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span className={styles.track} data-on={checked || undefined} aria-hidden>
        <span className={styles.knob} />
      </span>
      <span className={forms.choiceLabel}>
        {label}
        {helper && <span className={forms.choiceHelper}>{helper}</span>}
      </span>
    </label>
  );
}
