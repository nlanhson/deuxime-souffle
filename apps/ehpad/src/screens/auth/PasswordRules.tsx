import { Check, Circle } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './auth.module.css';

export const passwordChecks = (password: string) => ({
  minLength: password.length >= 8,
  uppercase: /[A-ZÀ-Ý]/.test(password),
  number: /\d/.test(password),
});

export const passwordValid = (password: string): boolean =>
  Object.values(passwordChecks(password)).every(Boolean);

/** Liste de règles vivante — cochée au fur et à mesure (prévention d'erreur). */
export function PasswordRules({ password }: { password: string }) {
  const fr = useStrings();
  const checks = passwordChecks(password);
  const rows: { key: keyof typeof checks; label: string }[] = [
    { key: 'minLength', label: fr.auth.passwordRules.minLength },
    { key: 'uppercase', label: fr.auth.passwordRules.uppercase },
    { key: 'number', label: fr.auth.passwordRules.number },
  ];
  return (
    <div className={styles.rulesBox}>
      <p className={styles.rulesTitle}>{fr.auth.passwordRules.title}</p>
      <ul className={styles.rules}>
        {rows.map((row) => {
          const met = checks[row.key];
          return (
            <li key={row.key} className={styles.rule} data-met={met}>
              {met ? (
                <Check className={styles.ruleIcon} aria-hidden />
              ) : (
                <Circle className={styles.ruleIcon} aria-hidden />
              )}
              <span>
                {row.label}
                <span className="sr-only">
                  {' '}
                  — {met ? fr.auth.passwordRules.ruleMet : fr.auth.passwordRules.ruleUnmet}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
