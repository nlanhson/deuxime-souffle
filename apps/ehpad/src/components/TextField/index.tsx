import { useId, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff, Search, TriangleAlert } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from '@/components/forms.module.css';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'password' | 'search' | 'number' | undefined;
  helper?: string | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  placeholder?: string | undefined;
  autoComplete?: string | undefined;
  maxLength?: number | undefined;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'] | undefined;
  onBlur?: (() => void) | undefined;
}

/** Champ texte — étiquette visible au-dessus (jamais le placeholder seul),
 *  validation au blur, erreur = bordure + ⚠ + message (jamais la couleur seule). */
export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  helper,
  error,
  required,
  readOnly,
  disabled,
  placeholder,
  autoComplete,
  maxLength,
  inputMode,
  onBlur,
}: TextFieldProps) {
  const fr = useStrings();
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (revealed ? 'text' : 'password') : type;
  const describedBy = [helper ? `${id}-helper` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}> ({fr.common.required})</span>}
      </label>
      {helper && (
        <p className={styles.helper} id={`${id}-helper`}>
          {helper}
        </p>
      )}
      <span
        className={styles.control}
        data-invalid={error ? 'true' : undefined}
        data-readonly={readOnly ? 'true' : undefined}
      >
        {type === 'search' && <Search className={styles.leadingIcon} aria-hidden />}
        <input
          id={id}
          className={styles.input}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...(onBlur ? { onBlur } : {})}
          {...(placeholder ? { placeholder } : {})}
          {...(autoComplete ? { autoComplete } : {})}
          {...(maxLength ? { maxLength } : {})}
          {...(inputMode ? { inputMode } : {})}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.affixButton}
            onClick={() => setRevealed((r) => !r)}
            aria-pressed={revealed}
            aria-label={revealed ? fr.auth.login.hidePassword : fr.auth.login.showPassword}
          >
            {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          </button>
        )}
      </span>
      <div aria-live="polite">
        {error && (
          <p className={styles.errorMsg} id={`${id}-error`}>
            <TriangleAlert className={styles.errorIcon} aria-hidden />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}
