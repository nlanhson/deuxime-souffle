import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useToast } from '@/context/ToastContext';
import { capitalize, formatTime, formatWeekdayDate } from '@/lib/format';
import { Button, Select, TimePicker } from '@/components';
import type { Contract } from '@/types/models';
import styles from './QuickCreatePopover.module.css';

/** Rectangle (coordonnées écran) du créneau cliqué, pour ancrer la pop-up à côté. */
export interface SlotAnchor {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface QuickCreatePopoverProps {
  anchor: SlotAnchor;
  /** Jour cliqué (ISO). */
  date: string;
  /** Heure cliquée (HH:MM), pré-remplie et modifiable. */
  time: string;
  contracts: Contract[];
  onClose: () => void;
  /** « Plus d'options » : bascule vers le formulaire complet (pré-rempli). */
  onMore: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const POP_W = 304;
const GAP = 10;

/** Création rapide « à la Google Agenda » : pop-up ancrée à côté du créneau cliqué
 *  dans la vue Semaine. Choix du contrat + heure, puis « Créer » — ou le formulaire
 *  complet via « Plus d'options ». Focus piégé, fermeture Échap / clic dehors / défilement. */
export function QuickCreatePopover({ anchor, date, time: initialTime, contracts, onClose, onMore }: QuickCreatePopoverProps) {
  const fr = useStrings();
  const { showToast } = useToast();
  const actives = contracts.filter((c) => c.status === 'active');
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [contractId, setContractId] = useState('');
  const [time, setTime] = useState(initialTime);
  const [contractError, setContractError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // À droite du créneau ; bascule à gauche si débordement ; calé dans le viewport.
  useLayoutEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const ph = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = anchor.right + GAP;
    if (left + POP_W > vw - GAP) left = anchor.left - POP_W - GAP;
    if (left < GAP) left = GAP;
    let top = anchor.top;
    if (top + ph > vh - GAP) top = vh - GAP - ph;
    if (top < GAP) top = GAP;
    setPos({ left, top });
  }, [anchor]);

  // Focus 1er champ + piège ; ferme sur Échap / clic extérieur / défilement / redimensionnement.
  useEffect(() => {
    const el = popRef.current;
    el?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (el && !el.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  const submit = async () => {
    if (contractId === '') {
      setContractError(fr.common.requiredField);
      return;
    }
    setBusy(true);
    try {
      await api.createOneOffSession(contractId, date, time);
      showToast({ message: fr.dashboard.plan.success });
      onClose();
    } catch {
      showToast({ kind: 'danger', message: fr.common.genericError });
      setBusy(false);
    }
  };

  return createPortal(
    <div
      ref={popRef}
      className={styles.popover}
      role="dialog"
      aria-label={fr.dashboard.quickCreate.title}
      style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
    >
      <p className={styles.title}>{fr.dashboard.quickCreate.title}</p>
      <p className={styles.when}>
        {capitalize(formatWeekdayDate(date))} · {formatTime(time)}
      </p>

      {actives.length === 0 ? (
        <p className={styles.empty}>{fr.dashboard.quickCreate.noContract}</p>
      ) : (
        <>
          <Select
            label={fr.dashboard.plan.contract}
            value={contractId}
            onChange={(v) => {
              setContractId(v);
              if (contractError) setContractError(null);
            }}
            options={actives.map((c) => ({
              value: c.id,
              label: `${c.reference} — ${c.units.map((u) => fr.units[u]).join(', ')}`,
            }))}
            placeholder={fr.dashboard.plan.contractPlaceholder}
            error={contractError}
            required
          />
          <TimePicker label={fr.dashboard.plan.time} value={time} onChange={setTime} required />
        </>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" size="md" onClick={onMore}>
          {fr.dashboard.quickCreate.more}
        </Button>
        {actives.length > 0 && (
          <Button variant="primary" size="md" onClick={submit} loading={busy}>
            {fr.dashboard.quickCreate.create}
          </Button>
        )}
      </div>
    </div>,
    document.body,
  );
}
