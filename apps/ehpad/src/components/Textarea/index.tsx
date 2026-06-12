import { useId } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from '@/components/forms.module.css';

interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  placeholder?: string | undefined;
  rows?: number | undefined;
  onBlur?: (() => void) | undefined;
}

export function Textarea({
  label,
  value,
  onChange,
  helper,
  error,
  required,
  disabled,
  placeholder,
  rows = 3,
  onBlur,
}: TextareaProps) {
  const fr = useStrings();
  const id = useId();
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
      <span className={styles.control} data-invalid={error ? 'true' : undefined}>
        <textarea
          id={id}
          className={styles.input}
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          {...(onBlur ? { onBlur } : {})}
          {...(placeholder ? { placeholder } : {})}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        />
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
