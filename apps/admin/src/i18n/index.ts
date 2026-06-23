/** Sélection de langue de la Console DS (fr par défaut, en optionnelle).
 *
 *  `useStrings()` / `useI18n()` donnent accès au dictionnaire actif depuis les
 *  composants React et déclenchent un re-render au changement de langue. Le choix
 *  est persisté dans le localStorage et reflété sur `document.documentElement.lang`. */

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { fr } from './fr';
import { en } from './en';
import type { Copy } from './fr';

export type { Copy } from './fr';

export type Locale = 'fr' | 'en';

export const LOCALES: readonly Locale[] = ['fr', 'en'];
export const DEFAULT_LOCALE: Locale = 'fr';

/** Libellés des langues, dans leur propre langue (auto-glottonymes). */
export const localeNames: Record<Locale, string> = { fr: 'Français', en: 'English' };
export const localeShort: Record<Locale, string> = { fr: '🇫🇷', en: '🇬🇧' };

const STORAGE_KEY = 'ds-admin.locale';

const dictionaries: Record<Locale, Copy> = { fr, en };

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'fr' ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

interface I18nValue {
  locale: Locale;
  strings: Copy;
  setLocale: (next: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* stockage indisponible — on conserve le changement en mémoire */
    }
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale; // sync initial + à chaque bascule
  }, [locale]);

  const value = useMemo<I18nValue>(
    () => ({ locale, strings: dictionaries[locale], setLocale }),
    [locale, setLocale],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n doit être utilisé sous <I18nProvider>');
  return value;
}

/** Raccourci : dictionnaire actif, re-render à chaque changement de langue. */
export function useStrings(): Copy {
  return useI18n().strings;
}
