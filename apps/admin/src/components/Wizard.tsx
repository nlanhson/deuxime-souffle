import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import styles from './Wizard.module.css';

interface WizardProps {
  steps: string[];
  current: number;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  onComplete: () => void;
  completeLabel: string;
  /** Disable the forward button (incomplete required fields). */
  nextDisabled?: boolean | undefined;
}

/**
 * Step indicator + footer navigation for the multi-step admin flows
 * (create session / contract / establishment / coach). Presentational: the
 * parent owns the step index and the per-step form state, and renders the
 * current step's body as children.
 */
export function Wizard({
  steps,
  current,
  children,
  onBack,
  onNext,
  onCancel,
  onComplete,
  completeLabel,
  nextDisabled,
}: WizardProps) {
  const isLast = current === steps.length - 1;
  return (
    <div className={styles.wizard}>
      <ol className={styles.stepper}>
        {steps.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'todo';
          return (
            <li key={label} className={styles.step} data-state={state}>
              <span className={styles.dot}>
                {state === 'done' ? <Check size={14} aria-hidden /> : i + 1}
              </span>
              <span className={styles.stepLabel}>{label}</span>
            </li>
          );
        })}
      </ol>

      <div className={styles.body}>{children}</div>

      <div className={styles.footer}>
        {current === 0 ? (
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        ) : (
          <Button variant="ghost" onClick={onBack}>
            Précédent
          </Button>
        )}
        {isLast ? (
          <Button onClick={onComplete}>{completeLabel}</Button>
        ) : (
          <Button variant="secondary" onClick={onNext} disabled={nextDisabled}>
            Continuer
          </Button>
        )}
      </div>
    </div>
  );
}
