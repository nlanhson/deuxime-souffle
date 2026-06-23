import { useId, type ReactNode } from 'react';
import styles from './Form.module.css';

interface FieldProps {
  label: string;
  required?: boolean | undefined;
  hint?: string | undefined;
  children: (id: string) => ReactNode;
}

/** Label + control + optional hint. Passes a generated id to the control. */
export function Field({ label, required, hint, children }: FieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? <span className={styles.req} aria-hidden> *</span> : null}
      </label>
      {children(id)}
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  );
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={styles.input} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={styles.textarea} rows={props.rows ?? 3} />;
}

export function FormSelect({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={styles.select}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export interface ChoiceOption {
  value: string;
  label: string;
  desc?: string;
}

interface RadioCardsProps {
  name: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2 | undefined;
}

/** Single-choice selectable cards (wizard radios). */
export function RadioCards({ name, options, value, onChange, columns = 1 }: RadioCardsProps) {
  return (
    <div className={styles.cards} data-columns={columns} role="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label key={o.value} className={styles.card} data-selected={selected || undefined}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className={styles.control}
            />
            <span className={styles.cardText}>
              <span className={styles.cardLabel}>{o.label}</span>
              {o.desc ? <span className={styles.cardDesc}>{o.desc}</span> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

interface CheckboxCardsProps {
  options: ChoiceOption[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: 1 | 2 | undefined;
}

/** Multi-choice selectable cards (wizard checkboxes). */
export function CheckboxCards({ options, values, onChange, columns = 2 }: CheckboxCardsProps) {
  function toggle(v: string) {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  }
  return (
    <div className={styles.cards} data-columns={columns}>
      {options.map((o) => {
        const selected = values.includes(o.value);
        return (
          <label key={o.value} className={styles.card} data-selected={selected || undefined}>
            <input
              type="checkbox"
              checked={selected}
              onChange={() => toggle(o.value)}
              className={styles.control}
            />
            <span className={styles.cardText}>
              <span className={styles.cardLabel}>{o.label}</span>
              {o.desc ? <span className={styles.cardDesc}>{o.desc}</span> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Two-column grid for arranging Field components side by side. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
