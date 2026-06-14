import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useStrings } from '@/i18n';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode | undefined;
  /** Confirmation destructive : pas de fermeture par Échap ni clic sur le voile —
   *  un choix explicite est requis. */
  destructive?: boolean | undefined;
  wide?: boolean | undefined;
  /** Grand dialogue (aperçu de séance type Google Agenda) — large et spacieux. */
  large?: boolean | undefined;
  /** Titre discret : quand le corps porte déjà un gros en-tête (ex. la date d'une
   *  séance), on rend le titre du dialogue en sourdine pour éviter la redondance.
   *  Reste la cible d'aria-labelledby (nom accessible inchangé). */
  quietTitle?: boolean | undefined;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Dialogue centré — focus piégé, rendu au déclencheur à la fermeture. */
export function Modal({ open, onClose, title, children, footer, destructive, wide, large, quietTitle }: ModalProps) {
  const fr = useStrings();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !destructive) {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusables = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (!firstEl || !lastEl) return;
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = '';
      previousFocus.current?.focus();
    };
  }, [open, destructive, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onMouseDown={destructive ? undefined : (e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${styles.dialog} ${large ? styles.large : wide ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        {/* <div> et non <header> : un <header> compterait comme repère « banner »
            à l'intérieur du dialogue (role=dialog n'est pas du contenu de section). */}
        <div className={styles.header}>
          <h2 className={`${styles.title} ${quietTitle ? styles.titleQuiet : ''}`.trim()} id={titleId}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={fr.common.close}>
            <X aria-hidden />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
