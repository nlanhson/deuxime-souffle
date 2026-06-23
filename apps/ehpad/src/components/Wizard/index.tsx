import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { useStrings } from '@/i18n';
import { Button } from '@/components/Button';
import styles from './Wizard.module.css';

export interface WizardStepDef {
  id: string;
  title: string;
}

interface WizardProps {
  steps: WizardStepDef[];
  current: number; // index 0-based
  children: ReactNode;
  /** Nombre de pastilles affichées dans la barre de progression. Par défaut, toutes
   *  les étapes. En deçà du total, les étapes au-delà (ex. créneaux, récap) sont des
   *  écrans de continuation : la barre les montre toutes « faites », sans pastille. */
  visibleStepCount?: number | undefined;
  /** Récapitulatif des choix déjà faits — mémoire externe de l'utilisateur. */
  summary?: ReactNode | undefined;
  /** Encart d'aide affiché sous le contenu à CHAQUE étape (ex. « Besoin d'aide ? »). */
  help?: ReactNode | undefined;
  onBack?: (() => void) | undefined;
  onNext: () => void;
  nextLabel?: string | undefined;
  nextDisabled?: boolean | undefined;
  /** Quand le bouton est désactivé, on dit toujours pourquoi. */
  nextDisabledReason?: string | undefined;
  busy?: boolean | undefined;
  onSaveDraft?: (() => void) | undefined;
  extraFooter?: ReactNode | undefined;
}

/** Coquille de wizard — progression nommée + numérotée, Retour non destructif,
 *  brouillon enregistrable, bouton suivant désactivé avec raison affichée. */
export function Wizard({
  steps,
  current,
  children,
  visibleStepCount,
  summary,
  help,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  nextDisabledReason,
  busy,
  onSaveDraft,
  extraFooter,
}: WizardProps) {
  const fr = useStrings();
  const step = steps[current];
  // Pastilles affichées (≤ total). Les étapes au-delà (créneaux, récap) sont des
  // écrans de continuation : la barre montre alors les pastilles toutes « faites ».
  const shown = steps.slice(0, visibleStepCount ?? steps.length);
  const onContinuation = current >= shown.length;
  return (
    <div className={styles.wizard}>
      <nav aria-label={fr.contracts.wizard.title} className={styles.progress}>
        <p className={styles.stepLabel} aria-live="polite">
          {step ? (onContinuation ? step.title : fr.contracts.wizard.stepLabel(current + 1, shown.length, step.title)) : ''}
        </p>
        <ol className={styles.stepList}>
          {shown.map((s, index) => (
            <li
              key={s.id}
              className={styles.stepItem}
              data-state={index < current ? 'done' : index === current ? 'current' : 'todo'}
              {...(index === current ? { 'aria-current': 'step' } : {})}
            >
              <span className={styles.stepBullet} aria-hidden>
                {index < current ? <Check size={14} /> : index + 1}
              </span>
              <span className={styles.stepName}>{s.title}</span>
            </li>
          ))}
        </ol>
      </nav>

      <div className={styles.layout}>
        <section className={styles.content}>
          {children}
          {help}
        </section>
        {summary && <aside className={styles.summary}>{summary}</aside>}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          {onBack && (
            <Button onClick={onBack} variant="ghost">
              {fr.contracts.wizard.back}
            </Button>
          )}
          {onSaveDraft && (
            <Button onClick={onSaveDraft} variant="secondary">
              {fr.contracts.wizard.saveDraft}
            </Button>
          )}
          {extraFooter}
        </div>
        <div className={styles.footerRight}>
          {nextDisabled && nextDisabledReason && (
            <p className={styles.disabledReason} aria-live="polite">
              {nextDisabledReason}
            </p>
          )}
          {/* Avancer = bleu (chemin), seule la soumission finale est rouge. */}
          <Button
            variant={current === steps.length - 1 ? 'primary' : 'accent'}
            onClick={onNext}
            disabled={nextDisabled}
            loading={busy ?? false}
            {...(nextDisabledReason ? { disabledReason: nextDisabledReason } : {})}
          >
            {nextLabel ?? fr.contracts.wizard.next}
          </Button>
        </div>
      </footer>
    </div>
  );
}
