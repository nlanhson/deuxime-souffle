import { LOCALES, localeNames, localeShort, useI18n } from '@/i18n';
import styles from './LanguageSwitcher.module.css';

interface LanguageSwitcherProps {
  /** « bar » : compact, dans la barre du haut. « auth » : centré, écrans hors coquille. */
  tone?: 'bar' | 'auth';
}

/** Bascule de langue FR / EN. Groupe de boutons à bascule : le libellé court (FR/EN)
 *  est visible, le nom complet de la langue sert de nom accessible. Couleur jamais
 *  seule — `aria-pressed` porte l'état sélectionné. */
export function LanguageSwitcher({ tone = 'bar' }: LanguageSwitcherProps) {
  const { locale, setLocale, strings } = useI18n();
  return (
    <div className={styles.group} role="group" aria-label={strings.app.language} data-tone={tone}>
      {LOCALES.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            className={styles.option}
            data-active={active}
            aria-pressed={active}
            aria-label={localeNames[loc]}
            title={localeNames[loc]}
            onClick={() => setLocale(loc)}
          >
            {localeShort[loc]}
          </button>
        );
      })}
    </div>
  );
}
