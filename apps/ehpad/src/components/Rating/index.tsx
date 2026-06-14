import { useId } from 'react';
import { Star } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './Rating.module.css';

interface RatingInputProps {
  legend: string;
  value: number | null;
  onChange: (value: number) => void;
}

/** Note 1–5 — radiogroup, chaque étoile ≥ 44px, étoiles BLEUES (jamais or),
 *  valeur toujours annoncée en toutes lettres. */
export function RatingInput({ legend, value, onChange }: RatingInputProps) {
  const fr = useStrings();
  const name = useId();
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = value !== null && n <= value;
          return (
            <label key={n} className={styles.star} data-filled={filled || undefined}>
              <input
                type="radio"
                className={styles.srInput}
                name={name}
                checked={value === n}
                onChange={() => onChange(n)}
                aria-label={fr.a11y.ratingInput(n)}
              />
              <Star className={styles.icon} aria-hidden />
            </label>
          );
        })}
      </div>
      <p className={styles.value} aria-live="polite">
        {value !== null ? fr.evaluations.form.starsValue(value) : ' '}
      </p>
    </fieldset>
  );
}

interface RatingDisplayProps {
  value: number;
  /** Texte d'accompagnement (ex. « Note : 4 sur 5 ») affiché à côté des étoiles. */
  showText?: boolean | undefined;
  size?: 'sm' | 'md' | undefined;
}

/** Lecture seule — moyennes et évaluations envoyées. */
export function RatingDisplay({ value, showText = true, size = 'md' }: RatingDisplayProps) {
  const fr = useStrings();
  return (
    <span className={styles.display} data-size={size}>
      <span aria-hidden className={styles.displayRow}>
        {[1, 2, 3, 4, 5].map((n) => {
          // Part remplie de cette étoile (0→1) : gère les demi-étoiles (ex. 4,5).
          const fill = Math.max(0, Math.min(1, value - (n - 1)));
          return (
            <span key={n} className={styles.displayStar}>
              <Star className={styles.icon} />
              {fill > 0 && (
                <Star
                  className={`${styles.icon} ${styles.starFillIcon}`}
                  data-filled
                  style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}
                />
              )}
            </span>
          );
        })}
      </span>
      {showText ? (
        <span className={styles.displayText}>
          {value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} {fr.dashboard.kpi.outOfFive}
        </span>
      ) : (
        <span className="sr-only">{fr.a11y.rating(value)}</span>
      )}
    </span>
  );
}
