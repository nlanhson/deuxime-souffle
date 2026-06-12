/** Sélection de langue (fr par défaut, en optionnelle).
 *
 *  Deux voies d'accès au dictionnaire actif :
 *   - `useStrings()` / `useI18n()` pour les composants React → re-render au changement de langue.
 *   - `getStrings()` pour le code hors React (api.ts, seed, lib/status.ts) qui ne peut pas
 *     appeler de hook ; lit un miroir au niveau module tenu à jour par le provider.
 *
 *  Limite assumée (prototype à backend simulé) : les libellés déjà « gravés » dans le
 *  magasin au seed (journal d'événements, historique, notifications) restent dans la langue
 *  de leur création. Le rechargement régénère le seed dans la langue persistée. */

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fr } from './fr';
import { en } from './en';
import type { Copy } from './fr';

export type Locale = 'fr' | 'en';

export const LOCALES: readonly Locale[] = ['fr', 'en'];
export const DEFAULT_LOCALE: Locale = 'fr';

/** Libellés des langues, dans leur propre langue (auto-glottonymes). */
export const localeNames: Record<Locale, string> = { fr: 'Français', en: 'English' };
export const localeShort: Record<Locale, string> = { fr: 'FR', en: 'EN' };

const STORAGE_KEY = 'ds-ehpad.locale';

const dictionaries: Record<Locale, Copy> = { fr, en };

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'fr' ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/* Miroir au niveau module — initialisé au chargement, avant l'exécution du seed. */
let activeLocale: Locale = readStoredLocale();

/** Langue active (pour le code hors React). */
export function getLocale(): Locale {
  return activeLocale;
}

/** Dictionnaire actif — pour le code qui ne peut pas appeler de hook. */
export function getStrings(): Copy {
  return dictionaries[activeLocale];
}

interface I18nValue {
  locale: Locale;
  strings: Copy;
  setLocale: (next: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => activeLocale);

  const setLocale = useCallback((next: Locale) => {
    activeLocale = next; // garde le miroir hors React synchronisé
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
  if (!value) throw new Error('useI18n doit être utilisé sous I18nProvider');
  return value;
}

/** Raccourci : dictionnaire actif, re-render à chaque changement de langue. */
export function useStrings(): Copy {
  return useI18n().strings;
}
