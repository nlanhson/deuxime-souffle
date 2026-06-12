import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, TriangleAlert } from 'lucide-react';
import { useStrings } from '@/i18n';
import { addDays, addMonths, isSameDay, isSameMonth, isToday, monthGrid } from '@/lib/calendar';
import { capitalize, formatDate, formatMonthYear, parseDate, toIso } from '@/lib/format';
import styles from './DatePicker.module.css';
import forms from '@/components/forms.module.css';

interface DatePickerProps {
  label: string;
  value: string | null;
  onChange: (iso: string) => void;
  /** Date minimale incluse (ex. demain pour une nouvelle séance). */
  min?: string | undefined;
  /** Jours indisponibles (fermetures, exclusions du contrat) — grisés. */
  isDisabledDay?: ((date: Date) => boolean) | undefined;
  disabledDayReason?: string | undefined;
  helper?: string | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
}

/** Sélecteur de date — contraint les saisies : les jours impossibles sont
 *  désactivés plutôt que signalés en erreur après coup. */
export function DatePicker({
  label,
  value,
  onChange,
  min,
  isDisabledDay,
  disabledDayReason,
  helper,
  error,
  required,
  placeholder,
}: DatePickerProps) {
  const fr = useStrings();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => (value ? parseDate(value) : new Date()));
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  const minDate = min ? parseDate(min) : null;
  const dayBlocked = (date: Date): { blocked: boolean; reason?: string } => {
    if (minDate && date < minDate) return { blocked: true, reason: fr.a11y.pastDay };
    if (isDisabledDay?.(date))
      return { blocked: true, reason: disabledDayReason ?? fr.a11y.closedDay };
    return { blocked: false };
  };

  const selected = value ? parseDate(value) : null;
  const weeks = monthGrid(cursor);

  const moveFocus = (from: Date, deltaDays: number) => {
    const target = addDays(from, deltaDays);
    if (!isSameMonth(target, cursor)) setCursor(target);
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-iso="${toIso(target)}"]`)
        ?.focus();
    });
  };

  const describedBy = [helper ? `${id}-helper` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${forms.field} ${styles.root}`} ref={rootRef}>
      <span className={forms.label} id={`${id}-label`}>
        {label}
        {required && <span className={forms.required}> ({fr.common.required})</span>}
      </span>
      {helper && (
        <p className={forms.helper} id={`${id}-helper`}>
          {helper}
        </p>
      )}
      <button
        type="button"
        className={forms.control}
        data-invalid={error ? 'true' : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label`}
        {...(describedBy ? { 'aria-describedby': describedBy } : {})}
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarDays className={forms.leadingIcon} aria-hidden />
        <span className={styles.valueText} data-placeholder={!value || undefined}>
          {value ? capitalize(formatDate(value)) : (placeholder ?? 'Choisir une date')}
        </span>
      </button>

      {open && (
        <div className={styles.popover} role="dialog" aria-label={label}>
          <div className={styles.navRow}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setCursor((c) => addMonths(c, -1))}
              aria-label={fr.calendar.previous}
            >
              <ChevronLeft aria-hidden />
            </button>
            <p className={styles.monthLabel} aria-live="polite">
              {capitalize(formatMonthYear(cursor))}
            </p>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setCursor((c) => addMonths(c, 1))}
              aria-label={fr.calendar.next}
            >
              <ChevronRight aria-hidden />
            </button>
          </div>
          <div className={styles.grid} ref={gridRef}>
            {fr.weekdaysShort.map((day) => (
              <span key={day} className={styles.weekday} aria-hidden>
                {day}
              </span>
            ))}
            {weeks.flat().map((date) => {
              const iso = toIso(date);
              const { blocked, reason } = dayBlocked(date);
              const isSelected = selected !== null && isSameDay(date, selected);
              const outside = !isSameMonth(date, cursor);
              return (
                <button
                  key={iso}
                  type="button"
                  className={styles.day}
                  data-iso={iso}
                  data-outside={outside || undefined}
                  data-today={isToday(date) || undefined}
                  data-selected={isSelected || undefined}
                  disabled={blocked}
                  {...(blocked && reason ? { title: reason } : {})}
                  aria-label={`${capitalize(formatDate(iso))}${blocked && reason ? ` — ${reason}` : ''}`}
                  {...(isSelected ? { 'aria-current': 'date' } : {})}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  onKeyDown={(event) => {
                    const moves: Record<string, number> = {
                      ArrowLeft: -1,
                      ArrowRight: 1,
                      ArrowUp: -7,
                      ArrowDown: 7,
                    };
                    const delta = moves[event.key];
                    if (delta !== undefined) {
                      event.preventDefault();
                      moveFocus(date, delta);
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {disabledDayReason && <p className={styles.gridNote}>{disabledDayReason}</p>}
        </div>
      )}

      <div aria-live="polite">
        {error && (
          <p className={forms.errorMsg} id={`${id}-error`}>
            <TriangleAlert className={forms.errorIcon} aria-hidden />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}
