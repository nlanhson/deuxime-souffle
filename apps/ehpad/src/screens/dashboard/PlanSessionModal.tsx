import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useToast } from '@/context/ToastContext';
import { addDays } from '@/lib/calendar';
import { toIso } from '@/lib/format';
import { isDayFullyExcluded } from '@/lib/exclusions';
import { Button, DatePicker, EmptyState, InlineAlert, Modal, Select, TimePicker } from '@/components';
import type { Contract } from '@/types/models';

interface PlanSessionModalProps {
  open: boolean;
  onClose: () => void;
  contracts: Contract[];
  userName: string;
  /** Préselectionne le contrat (entrée « Créer une séance ponctuelle », CON-03). */
  initialContractId?: string | undefined;
  /** Préselectionne la date (entrée « + » sur une case du calendrier). */
  initialDate?: string | undefined;
}

/** SESS-08 « Planifier une séance » — séance ponctuelle depuis un contrat ACTIF. */
export function PlanSessionModal({ open, onClose, contracts, initialContractId, initialDate }: PlanSessionModalProps) {
  const fr = useStrings();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const actives = useMemo(() => contracts.filter((c) => c.status === 'active'), [contracts]);

  const [contractId, setContractId] = useState('');

  useEffect(() => {
    if (open && initialContractId) setContractId(initialContractId);
  }, [open, initialContractId]);
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    if (open && initialDate) setDate(initialDate);
  }, [open, initialDate]);
  const [time, setTime] = useState('10:00');
  const [contractError, setContractError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const selected = actives.find((c) => c.id === contractId);
  const tomorrow = toIso(addDays(new Date(), 1));

  const reset = () => {
    setContractId('');
    setDate(null);
    setTime('10:00');
    setContractError(null);
    setDateError(null);
    setFailed(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    const contractOk = contractId !== '';
    const dateOk = date !== null;
    setContractError(contractOk ? null : fr.common.requiredField);
    setDateError(dateOk ? null : fr.dashboard.plan.dateHelp);
    if (!contractOk || !dateOk || date === null) return;
    setBusy(true);
    setFailed(false);
    try {
      await api.createOneOffSession(contractId, date, time);
      showToast({ message: fr.dashboard.plan.success });
      close();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={fr.dashboard.plan.title}
      footer={
        actives.length > 0 ? (
          <>
            <Button onClick={close} variant="ghost">
              {fr.common.cancel}
            </Button>
            <Button variant="primary" onClick={submit} loading={busy}>
              {fr.dashboard.plan.submit}
            </Button>
          </>
        ) : undefined
      }
    >
      {actives.length === 0 ? (
        <EmptyState
          title={fr.dashboard.plan.noActiveContract}
          body={fr.dashboard.plan.noActiveContractBody}
          action={
            <Button
              onClick={() => {
                close();
                navigate('/contrats');
              }}
            >
              {fr.dashboard.plan.goToContracts}
            </Button>
          }
        />
      ) : (
        <>
          <p>{fr.dashboard.plan.intro}</p>
          {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}
          <Select
            label={fr.dashboard.plan.contract}
            value={contractId}
            onChange={(value) => {
              setContractId(value);
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
          <DatePicker
            label={fr.dashboard.plan.date}
            value={date}
            onChange={(iso) => {
              setDate(iso);
              if (dateError) setDateError(null);
            }}
            min={tomorrow}
            isDisabledDay={
              selected ? (d) => isDayFullyExcluded(selected.excludedSlots, d) : undefined
            }
            disabledDayReason={fr.a11y.closedDay}
            helper={fr.dashboard.plan.dateHelp}
            error={dateError}
            required
          />
          <TimePicker label={fr.dashboard.plan.time} value={time} onChange={setTime} required />
        </>
      )}
    </Modal>
  );
}
