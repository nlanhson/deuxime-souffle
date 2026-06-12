import { useEffect, useId, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check, ChevronDown, TriangleAlert } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from '@/components/forms.module.css';
import own from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string | undefined;
  helper?: string | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Étiquette masquée visuellement (filtres compacts avec libellé évident). */
  hideLabel?: boolean | undefined;
  /** `field` (défaut) = champ de formulaire bordé ; `pill` = bouton-pilule compact
   *  pour les filtres (libellé masqué, icône en tête, fond gris discret). */
  variant?: 'field' | 'pill' | undefined;
  /** Icône en tête (variante `pill` uniquement). */
  icon?: LucideIcon | undefined;
}

/** Choix unique — `<select>` natif stylé (le plus léger et le plus accessible au web). */
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  helper,
  error,
  required,
  disabled,
  hideLabel,
  variant = 'field',
  icon: Icon,
}: SelectProps) {
  const fr = useStrings();
  const id = useId();

  // Variante pilule (filtres) — listbox personnalisée, popover positionné sous le
  // déclencheur. Le popup natif de l'OS ne s'alignait pas (origine du texte au bord
  // gauche de la pilule, sous l'icône) et son placement n'est pas pilotable en CSS.
  if (variant === 'pill') {
    return (
      <PillSelect
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        icon={Icon}
      />
    );
  }

  const describedBy = [helper ? `${id}-helper` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={styles.field}>
      <label className={`${styles.label} ${hideLabel ? 'sr-only' : ''}`} htmlFor={id}>
        {label}
        {required && <span className={styles.required}> ({fr.common.required})</span>}
      </label>
      {helper && (
        <p className={styles.helper} id={`${id}-helper`}>
          {helper}
        </p>
      )}
      <select
        id={id}
        className={styles.control}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        {...(describedBy ? { 'aria-describedby': describedBy } : {})}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

/** Variante pilule : listbox personnalisée (popover maîtrisé sous le déclencheur).
 *  Clavier : ↑/↓/Début/Fin déplacent le focus, Entrée/Espace choisissent, Échap ferme ;
 *  clic extérieur ferme ; le focus revient au déclencheur après choix/fermeture. */
function PillSelect({ label, value, onChange, options, placeholder, disabled, icon: Icon }: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);
  const display = selected?.label ?? placeholder ?? '';

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // À l'ouverture, focus l'option sélectionnée (sinon la première) pour le clavier.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const target =
      list.querySelector<HTMLButtonElement>('[data-selected]') ??
      list.querySelector<HTMLButtonElement>('button');
    target?.focus();
  }, [open]);

  return (
    <div className={own.pillRoot} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={own.pill}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {Icon && <Icon className={own.pillIcon} aria-hidden />}
        <span className={own.pillText}>{display}</span>
        <ChevronDown className={own.pillChevron} data-open={open || undefined} aria-hidden />
      </button>
      {open && (
        <div
          ref={listRef}
          className={own.listbox}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={(event) => {
            const buttons = Array.from(
              listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [],
            );
            const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              buttons[(idx + 1) % buttons.length]?.focus();
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
            } else if (event.key === 'Home') {
              event.preventDefault();
              buttons[0]?.focus();
            } else if (event.key === 'End') {
              event.preventDefault();
              buttons[buttons.length - 1]?.focus();
            }
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                className={own.optionRow}
                data-selected={isSelected || undefined}
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
              >
                <Check className={own.optionCheck} data-on={isSelected || undefined} aria-hidden />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  helper?: string | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
}

/** Choix multiple — bouton-champ qui révèle une liste de cases (✓ + fond, jamais
 *  la couleur seule). Utilisé pour les rôles de contact et les unités cibles. */
export function MultiSelect({
  label,
  values,
  onChange,
  options,
  helper,
  error,
  required,
  disabled,
}: MultiSelectProps) {
  const fr = useStrings();
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  };

  const summary =
    values.length === 0
      ? '—'
      : values.length <= 2
        ? values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ')
        : `${values.length} sélectionnés`;

  return (
    <div className={styles.field} ref={rootRef}>
      <span className={styles.label} id={`${id}-label`}>
        {label}
        {required && <span className={styles.required}> ({fr.common.required})</span>}
      </span>
      {helper && <p className={styles.helper}>{helper}</p>}
      <div className={own.multiRoot}>
        <button
          type="button"
          className={styles.control}
          data-invalid={error ? 'true' : undefined}
          aria-expanded={open}
          aria-labelledby={`${id}-label`}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={own.multiSummary}>{summary}</span>
          <ChevronDown className={own.chevron} data-open={open || undefined} aria-hidden />
        </button>
        {open && (
          <div className={own.popover} role="group" aria-labelledby={`${id}-label`}>
            {options.map((option) => {
              const checked = values.includes(option.value);
              return (
                <label key={option.value} className={styles.choiceRow}>
                  <input
                    type="checkbox"
                    className={styles.srInput}
                    checked={checked}
                    onChange={() => toggle(option.value)}
                  />
                  <span className={styles.box} aria-hidden>
                    <Check size={16} />
                  </span>
                  <span className={styles.choiceLabel}>{option.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
      <div aria-live="polite">
        {error && (
          <p className={styles.errorMsg}>
            <TriangleAlert className={styles.errorIcon} aria-hidden />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}
