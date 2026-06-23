/**
 * i18n seam for the coach app — French (default) ↔ English.
 *
 * `copy.ts` is the French source of truth; `copy.en.ts` is a DEEP-PARTIAL English override, so a
 * key that isn't translated yet automatically falls back to French (we translate in passes). This
 * module deep-merges the two per locale, persists the choice across launches (AsyncStorage), and
 * serves the active copy tree through `useCopy()`. The toggle lives in the Profile/Settings screen
 * and calls `setLocale`.
 *
 * Components must read copy via `useCopy()` (reactive) rather than importing `copy` directly, so
 * flipping the language re-renders the UI.
 */
import React, {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { copy, type Copy } from './copy';
import { en as enOverrides } from './copy.en';

export type Locale = 'fr' | 'en';
const STORAGE_KEY = 'coach.locale';

/**
 * Deep-merge an override tree over a base. Plain objects merge key-by-key; everything else
 * (strings, numbers, ARRAYS) is replaced wholesale — so an array override must supply the full
 * array, and any key absent from the override keeps the base (French) value.
 */
function deepMerge<T>(base: T, over: unknown): T {
  if (over == null) return base;
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return (over as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  const ov = over as Record<string, unknown>;
  for (const k of Object.keys(out)) {
    if (k in ov) out[k] = deepMerge(out[k], ov[k]);
  }
  return out as T;
}

const enCopy: Copy = deepMerge(copy, enOverrides);
const BY_LOCALE: Record<Locale, Copy> = { fr: copy, en: enCopy };

/**
 * First-run default: always French. The app is French-first, so the device language no longer
 * auto-selects English — English is opt-in only, via the FR/EN toggle in Profile/Settings (whose
 * choice still persists across launches). Kept as a function so the call sites stay unchanged.
 */
function deviceDefault(): Locale {
  return 'fr';
}

type LocaleState = { locale: Locale; setLocale: (l: Locale) => void; ready: boolean };
const LocaleContext = createContext<LocaleState | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [ready, setReady] = useState(false);

  // Restore the saved choice (or fall back to the device language) once on mount.
  useEffect(() => {
    let on = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!on) return;
        setLocaleState(saved === 'en' || saved === 'fr' ? saved : deviceDefault());
        setReady(true);
      })
      .catch(() => { if (on) { setLocaleState(deviceDefault()); setReady(true); } });
    return () => { on = false; };
  }, []);

  const value = useMemo<LocaleState>(() => ({
    locale,
    ready,
    setLocale: (l) => {
      setLocaleState(l);
      AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
    },
  }), [locale, ready]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleState {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a <LocaleProvider>');
  return ctx;
}

/** The active copy tree. Falls back to French if used outside the provider. */
export function useCopy(): Copy {
  const ctx = useContext(LocaleContext);
  return ctx ? BY_LOCALE[ctx.locale] : copy;
}
