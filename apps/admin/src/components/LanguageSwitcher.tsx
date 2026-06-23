import { useEffect, useRef, useState } from 'react';
import { LOCALES, localeNames, useI18n } from '@/i18n';
import type { Locale } from '@/i18n';
import styles from './LanguageSwitcher.module.css';

const flagSrc: Record<Locale, string> = {
  fr: '/brand/flag-fr.svg',
  en: '/brand/flag-en.svg',
};

export function LanguageSwitcher() {
  const { locale, setLocale, strings } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const others = LOCALES.filter((l) => l !== locale);

  return (
    <div className={styles.root} ref={ref}>
      {/* Slide-up picker */}
      <div
        className={styles.picker}
        data-open={open}
        role="listbox"
        aria-label={strings.app.language}
      >
        {others.map((loc) => (
          <button
            key={loc}
            type="button"
            role="option"
            aria-selected={false}
            className={styles.pickerOption}
            title={localeNames[loc]}
            onClick={() => { setLocale(loc); setOpen(false); }}
          >
            <img src={flagSrc[loc]} alt="" aria-hidden width={18} height={18} className={styles.flag} />
            <span className={styles.pickerLabel}>{localeNames[loc]}</span>
          </button>
        ))}
      </div>

      {/* Trigger — full-width row matching sidebar nav style */}
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${strings.app.language}: ${localeNames[locale]}`}
        onClick={() => setOpen((o) => !o)}
      >
        <img src={flagSrc[locale]} alt="" aria-hidden width={18} height={18} className={styles.flag} />
        <span className={styles.triggerLabel}>{localeNames[locale]}</span>
      </button>
    </div>
  );
}
