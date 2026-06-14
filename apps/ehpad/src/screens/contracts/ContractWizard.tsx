import { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { addDays, addMonths } from '@/lib/calendar';
import { capitalize, formatDate, formatEuro, formatTime, formatTimestamp, parseDate, toIso } from '@/lib/format';
import { suitabilityChip, unitLabel } from '@/lib/status';
import {
  Button,
  ButtonLink,
  Checkbox,
  DatePicker,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  RadioGroup,
  Skeleton,
  SkeletonGroup,
  StatusChip,
  TextField,
  Wizard,
} from '@/components';
import type { WizardStepDef } from '@/components';
import type {
  Contract,
  ContractDraft,
  Frequency,
  SessionType,
  SpecialPeriod,
  UnitType,
  WizardData,
} from '@/types/models';
import { ExclusionsStep } from './ExclusionsStep';
import styles from './contracts.module.css';

export const EMPTY_WIZARD: WizardData = {
  frequency: null,
  sessionType: null,
  units: [],
  otherUnitLabel: '',
  multiUnitPlanning: null,
  weeklyExclusions: [],
  specialPeriods: [],
  planningNotes: '',
  startDate: null,
  endDate: null,
  selectedSlotId: null,
  removedSlotIds: [],
};

/** Re-déduit l'état du wizard depuis un contrat existant (resoumission, renouvellement). */
export function dataFromContract(contract: Contract): WizardData {
  const weekly: WizardData['weeklyExclusions'] = [];
  const periods: SpecialPeriod[] = [];
  contract.excludedSlots.forEach((slot) => {
    if (slot.kind === 'demi_journee' && slot.weekday !== undefined) {
      if (slot.part === 'journee') {
        weekly.push({ weekday: slot.weekday, part: 'matin' }, { weekday: slot.weekday, part: 'apres_midi' });
      } else {
        weekly.push({ weekday: slot.weekday, part: slot.part });
      }
    } else if (slot.startDate) {
      periods.push({
        id: slot.id,
        kind: slot.kind === 'fermeture' ? 'fermeture' : slot.kind === 'jour_unique' ? 'jour_unique' : 'recurrent',
        label: slot.label,
        startDate: slot.startDate,
        ...(slot.endDate ? { endDate: slot.endDate } : {}),
        part: slot.part,
      });
    }
  });
  return {
    ...EMPTY_WIZARD,
    frequency: contract.frequency,
    sessionType: contract.sessionType,
    units: [...contract.units],
    multiUnitPlanning: contract.units.length > 1 ? 'jours_separes' : null,
    weeklyExclusions: weekly,
    specialPeriods: periods,
    planningNotes: contract.availabilityNotes ?? '',
    startDate: contract.startDate,
    endDate: contract.endDate,
  };
}

type WizardAction =
  | { type: 'patch'; patch: Partial<WizardData> }
  | { type: 'load'; data: WizardData }
  | { type: 'toggleWeekly'; weekday: number; part: 'matin' | 'apres_midi' }
  | { type: 'preset'; preset: 'wednesday' | 'mornings' | 'monfri' }
  | { type: 'resetExclusions' }
  | { type: 'addPeriod'; period: SpecialPeriod }
  | { type: 'updatePeriod'; period: SpecialPeriod }
  | { type: 'removePeriod'; id: string };

function reducer(data: WizardData, action: WizardAction): WizardData {
  switch (action.type) {
    case 'patch':
      return { ...data, ...action.patch };
    case 'load':
      return action.data;
    case 'toggleWeekly': {
      const exists = data.weeklyExclusions.some(
        (e) => e.weekday === action.weekday && e.part === action.part,
      );
      return {
        ...data,
        weeklyExclusions: exists
          ? data.weeklyExclusions.filter((e) => !(e.weekday === action.weekday && e.part === action.part))
          : [...data.weeklyExclusions, { weekday: action.weekday, part: action.part }],
      };
    }
    case 'preset': {
      const add = (list: WizardData['weeklyExclusions'], weekday: number, part: 'matin' | 'apres_midi') =>
        list.some((e) => e.weekday === weekday && e.part === part) ? list : [...list, { weekday, part }];
      let list = data.weeklyExclusions;
      if (action.preset === 'wednesday') {
        list = add(add(list, 2, 'matin'), 2, 'apres_midi');
      } else if (action.preset === 'mornings') {
        for (let d = 0; d < 7; d += 1) list = add(list, d, 'matin');
      } else {
        list = add(add(list, 0, 'matin'), 4, 'matin');
      }
      return { ...data, weeklyExclusions: list };
    }
    case 'resetExclusions':
      return { ...data, weeklyExclusions: [], specialPeriods: [] };
    case 'addPeriod':
      return { ...data, specialPeriods: [...data.specialPeriods, action.period] };
    case 'updatePeriod':
      return {
        ...data,
        specialPeriods: data.specialPeriods.map((p) => (p.id === action.period.id ? action.period : p)),
      };
    case 'removePeriod':
      return { ...data, specialPeriods: data.specialPeriods.filter((p) => p.id !== action.id) };
  }
}

interface ContractWizardProps {
  mode: 'create' | 'resubmit';
}

/** CON-01/02/08 — wizard de demande de contrat (5 étapes), réutilisé prérempli
 *  pour la resoumission (CON-06) et la personnalisation du renouvellement (CON-15). */
export default function ContractWizard({ mode }: ContractWizardProps) {
  const fr = useStrings();
  const navigate = useNavigate();
  const { id: resubmitId = '' } = useParams();
  const [params] = useSearchParams();
  const renewalOf = params.get('from');
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const sourceId = mode === 'resubmit' ? resubmitId : renewalOf;
  const source = useAsync(
    () => (sourceId ? api.getContract(sourceId) : Promise.resolve(null)),
    [sourceId],
  );
  const draftState = useAsync(
    () => (mode === 'create' && !renewalOf ? api.getContractDraft() : Promise.resolve(null)),
    [mode, renewalOf],
  );

  const [data, dispatch] = useReducer(reducer, EMPTY_WIZARD);
  const [step, setStep] = useState(0);
  const [loadedFrom, setLoadedFrom] = useState<'none' | 'contract' | 'draft'>('none');
  const [draftBanner, setDraftBanner] = useState<ContractDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Préremplissage depuis le contrat source (resoumission / renouvellement)
  useEffect(() => {
    if (source.data && loadedFrom === 'none') {
      dispatch({ type: 'load', data: dataFromContract(source.data) });
      setLoadedFrom('contract');
    }
  }, [source.data, loadedFrom]);

  // Brouillon partagé (compte multi-utilisateur, AUTH-05)
  useEffect(() => {
    if (draftState.data && loadedFrom === 'none') setDraftBanner(draftState.data);
  }, [draftState.data, loadedFrom]);

  const steps: WizardStepDef[] = [
    { id: 'needs', title: fr.contracts.wizard.steps.needs },
    { id: 'availability', title: fr.contracts.wizard.steps.availability },
    { id: 'period', title: fr.contracts.wizard.steps.period },
    { id: 'slots', title: fr.contracts.wizard.steps.slots },
    { id: 'summary', title: fr.contracts.wizard.steps.summary },
  ];

  // CON-08 — suggestions chargées à l'entrée de l'étape 4
  const suggestions = useAsync(
    () => (step === 3 ? api.getSlotSuggestions(data) : Promise.resolve([])),
    [step === 3],
  );
  const visibleSlots = (suggestions.data ?? []).filter((s) => !data.removedSlotIds.includes(s.id));

  // Le meilleur créneau est présélectionné
  useEffect(() => {
    if (step === 3 && data.selectedSlotId === null && visibleSlots.length > 0) {
      const first = visibleSlots[0];
      if (first) dispatch({ type: 'patch', patch: { selectedSlotId: first.id } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, suggestions.data]);

  if (!isAdmin) {
    return (
      <>
        <PageHeader title={fr.contracts.wizard.title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <InlineAlert variant="info" title={fr.common.adminOnlyAlert}>
          {fr.common.adminOnlyBody}
        </InlineAlert>
        <div>
          <ButtonLink to="/contrats">{fr.common.back}</ButtonLink>
        </div>
      </>
    );
  }

  const title =
    mode === 'resubmit'
      ? fr.contracts.wizard.resubmitTitle
      : renewalOf
        ? fr.contracts.wizard.renewTitle
        : fr.contracts.wizard.title;

  if (sourceId && (source.loading || (!source.data && !source.error))) {
    return (
      <>
        <PageHeader title={title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <SkeletonGroup>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Bandeau de progression — posé sur le canevas, pas une carte */}
            <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
              <Skeleton height={18} width={220} radius="var(--radius-md)" />
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-md)',
                  marginTop: 'var(--space-sm)',
                }}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                    <Skeleton height={28} width={28} radius="var(--radius-pill)" />
                    <Skeleton height={12} width={64} radius="var(--radius-pill)" />
                  </div>
                ))}
              </div>
            </div>

            {/* Carte de contenu — l'étape en cours (étape 0 : besoins) */}
            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-lg)',
              }}
            >
              {/* deux RadioGroups */}
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <Skeleton height={14} width={160} radius="var(--radius-md)" />
                  <Skeleton height={20} width={200} radius="var(--radius-pill)" />
                  <Skeleton height={20} width={180} radius="var(--radius-pill)" />
                </div>
              ))}
              {/* fieldset des unités (5 cases à cocher) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <Skeleton height={14} width={220} radius="var(--radius-md)" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height={20} width="50%" radius="var(--radius-pill)" />
                ))}
              </div>
            </div>

            {/* Pied de page — boutons Retour / Suivant */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Skeleton height={40} width={96} radius="var(--radius-md)" />
              <Skeleton height={40} width={120} radius="var(--radius-md)" />
            </div>
          </div>
        </SkeletonGroup>
      </>
    );
  }

  if (sourceId && source.error) {
    return (
      <>
        <PageHeader title={title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }]} />
        <LoadError onRetry={source.retry} />
      </>
    );
  }

  /* ---------- validation par étape (le bouton dit toujours pourquoi) ---------- */

  const stepBlocker = (): string | null => {
    if (step === 0) {
      if (!data.frequency) return fr.contracts.wizard.frequencyError;
      if (!data.sessionType) return fr.contracts.wizard.sessionTypeError;
      if (data.units.length === 0) return fr.contracts.wizard.unitsError;
      if (data.units.includes('AUTRE') && data.otherUnitLabel.trim() === '')
        return fr.contracts.wizard.otherUnitError;
      if (data.units.length > 1 && !data.multiUnitPlanning) return fr.contracts.wizard.multiUnitError;
    }
    if (step === 2) {
      if (!data.startDate) return fr.contracts.wizard.period.startError;
      if (!data.endDate || data.endDate <= data.startDate) return fr.contracts.wizard.period.endError;
    }
    if (step === 3) {
      if (visibleSlots.length > 0 && data.selectedSlotId === null)
        return fr.contracts.wizard.slots.slotError;
    }
    return null;
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const saveDraft = () => {
    void api
      .saveContractDraft({ savedAt: new Date().toISOString(), savedBy: userName, step, data })
      .then(() => showToast({ message: fr.contracts.wizard.draftSaved }));
  };

  const submit = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const contract = await api.submitContract(data, userName, {
        ...(mode === 'resubmit' ? { resubmitOf: resubmitId } : {}),
        ...(renewalOf ? { renewalOf } : {}),
      });
      showToast({ message: fr.contracts.wizard.summary.success, kind: 'neutral' });
      navigate(`/contrats/${contract.id}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    } else {
      void submit();
    }
  };

  /* ---------- contenu des étapes ---------- */

  const unitOptions: UnitType[] = ['UC', 'UP_UHR', 'AIDANTS', 'SOIGNANTS', 'AUTRE'];

  const stepNeeds = (
    <>
      <RadioGroup<Frequency>
        legend={fr.contracts.wizard.frequencyLabel}
        value={data.frequency}
        onChange={(frequency) => dispatch({ type: 'patch', patch: { frequency } })}
        required
        options={(['hebdo', 'bihebdo', 'bimensuel', 'mensuel', 'ponctuel'] as Frequency[]).map(
          (f) => ({ value: f, label: fr.frequency[f] }),
        )}
      />
      <RadioGroup<SessionType>
        legend={fr.contracts.wizard.sessionTypeLabel}
        value={data.sessionType}
        onChange={(sessionType) => dispatch({ type: 'patch', patch: { sessionType } })}
        required
        options={[
          { value: 'collective', label: fr.sessionTypes.collective },
          { value: 'individuelle', label: fr.sessionTypes.individuelle },
        ]}
      />
      <fieldset className={styles.unitsFieldset}>
        <legend className={styles.formLegend}>
          {fr.contracts.wizard.unitsLabel}{' '}
          <span className={styles.legendHint}>({fr.contracts.wizard.unitsHelp.toLowerCase()})</span>
        </legend>
        {unitOptions.map((unit) => (
          <Checkbox
            key={unit}
            label={unitLabel(unit)}
            checked={data.units.includes(unit)}
            onChange={(checked) =>
              dispatch({
                type: 'patch',
                patch: {
                  units: checked ? [...data.units, unit] : data.units.filter((u) => u !== unit),
                },
              })
            }
          />
        ))}
        {data.units.includes('AUTRE') && (
          <div className={styles.otherUnitField}>
            <TextField
              label={fr.contracts.wizard.otherUnitLabel}
              value={data.otherUnitLabel}
              onChange={(otherUnitLabel) => dispatch({ type: 'patch', patch: { otherUnitLabel } })}
              required
            />
          </div>
        )}
      </fieldset>
      {data.units.length > 1 && (
        <RadioGroup<'meme_jour' | 'jours_separes'>
          legend={fr.contracts.wizard.multiUnitLabel}
          value={data.multiUnitPlanning}
          onChange={(multiUnitPlanning) => dispatch({ type: 'patch', patch: { multiUnitPlanning } })}
          required
          options={[
            { value: 'meme_jour', label: fr.contracts.wizard.multiUnit.meme_jour },
            { value: 'jours_separes', label: fr.contracts.wizard.multiUnit.jours_separes },
          ]}
        />
      )}
    </>
  );

  const tomorrow = toIso(addDays(new Date(), 1));
  const applyPreset = (months: number | 'school') => {
    const start = data.startDate ?? tomorrow;
    const startDate = parseDate(start);
    const endDate =
      months === 'school'
        ? new Date(startDate.getMonth() >= 8 ? startDate.getFullYear() + 1 : startDate.getFullYear(), 6, 4)
        : addDays(addMonths(startDate, months), -1);
    dispatch({ type: 'patch', patch: { startDate: start, endDate: toIso(endDate) } });
  };

  const stepPeriod = (
    <>
      <h3 className={styles.summaryTitle}>{fr.contracts.wizard.period.title}</h3>
      <div className={styles.dateGrid}>
        <DatePicker
          label={fr.contracts.wizard.period.start}
          value={data.startDate}
          onChange={(startDate) => dispatch({ type: 'patch', patch: { startDate } })}
          min={tomorrow}
          helper={fr.contracts.wizard.period.startHelp}
          required
        />
        <DatePicker
          label={fr.contracts.wizard.period.end}
          value={data.endDate}
          onChange={(endDate) => dispatch({ type: 'patch', patch: { endDate } })}
          min={data.startDate ? toIso(addDays(parseDate(data.startDate), 1)) : tomorrow}
          required
        />
      </div>
      <div>
        <p className={styles.groupLabel}>
          {fr.contracts.wizard.period.preset}
        </p>
        <div className={styles.presetRow}>
          <Button size="md" onClick={() => applyPreset(6)}>
            {fr.contracts.wizard.period.presets.six}
          </Button>
          <Button size="md" onClick={() => applyPreset(12)}>
            {fr.contracts.wizard.period.presets.twelve}
          </Button>
          <Button size="md" onClick={() => applyPreset('school')}>
            {fr.contracts.wizard.period.presets.school}
          </Button>
        </div>
      </div>
    </>
  );

  const stepSlots = (
    <>
      <h3 className={styles.summaryTitle}>{fr.contracts.wizard.slots.title}</h3>
      <p className={styles.muted}>{fr.contracts.wizard.slots.intro}</p>
      {suggestions.loading && (
        <SkeletonGroup>
          <p className={styles.muted}>{fr.contracts.wizard.slots.loading}</p>
          <div className={styles.skeletonStack}>
            <Skeleton height={76} radius="var(--radius-lg)" />
            <Skeleton height={76} radius="var(--radius-lg)" />
            <Skeleton height={76} radius="var(--radius-lg)" />
          </div>
        </SkeletonGroup>
      )}
      {suggestions.error && <LoadError onRetry={suggestions.retry} />}
      {!suggestions.loading && !suggestions.error && visibleSlots.length === 0 && (
        <EmptyState
          title={fr.contracts.wizard.slots.empty}
          body={fr.contracts.wizard.slots.emptyBody}
        />
      )}
      {visibleSlots.map((slot) => {
        const selected = data.selectedSlotId === slot.id;
        return (
          <div key={slot.id} className={styles.slotCard} data-selected={selected}>
            <p className={styles.slotWhen}>
              {fr.weekdays[slot.weekday]} · {formatTime(slot.time)}
            </p>
            <StatusChip spec={suitabilityChip(slot.suitability)} />
            <p className={styles.slotReason}>{slot.reason}</p>
            <div className={styles.slotActions}>
              <Button
                size="md"
                variant={selected ? 'accent' : 'secondary'}
                onClick={() => dispatch({ type: 'patch', patch: { selectedSlotId: slot.id } })}
                aria-pressed={selected}
              >
                {selected ? fr.contracts.wizard.slots.selected : fr.contracts.wizard.slots.select}
              </Button>
              <Button
                size="md"
                variant="ghost"
                onClick={() => {
                  dispatch({
                    type: 'patch',
                    patch: {
                      removedSlotIds: [...data.removedSlotIds, slot.id],
                      selectedSlotId: data.selectedSlotId === slot.id ? null : data.selectedSlotId,
                    },
                  });
                  showToast({ message: fr.contracts.wizard.slots.removed, kind: 'neutral' });
                }}
              >
                {fr.contracts.wizard.slots.remove}
              </Button>
            </div>
          </div>
        );
      })}
      {data.removedSlotIds.length > 0 && (
        <Button
          size="md"
          variant="ghost"
          onClick={() => dispatch({ type: 'patch', patch: { removedSlotIds: [] } })}
        >
          {fr.contracts.wizard.slots.restore}
        </Button>
      )}
    </>
  );

  const selectedSlot = visibleSlots.find((s) => s.id === data.selectedSlotId);

  const summaryRows: { label: string; value: string }[] = [
    { label: fr.contracts.wizard.frequencyLabel, value: data.frequency ? fr.frequency[data.frequency] : '—' },
    { label: fr.contracts.wizard.sessionTypeLabel, value: data.sessionType ? fr.sessionTypes[data.sessionType] : '—' },
    {
      label: fr.contracts.wizard.unitsLabel,
      value:
        data.units.length > 0
          ? data.units
              .map((u) => (u === 'AUTRE' && data.otherUnitLabel ? `${unitLabel(u)} (${data.otherUnitLabel})` : unitLabel(u)))
              .join(', ')
          : '—',
    },
    ...(data.units.length > 1 && data.multiUnitPlanning
      ? [{ label: fr.contracts.wizard.multiUnitLabel, value: fr.contracts.wizard.multiUnit[data.multiUnitPlanning] }]
      : []),
    {
      label: fr.contracts.wizard.exclusions.weeklyRecap,
      value:
        data.weeklyExclusions.length > 0
          ? data.weeklyExclusions
              .map((e) => `${fr.weekdays[e.weekday]} ${e.part === 'matin' ? fr.contracts.wizard.exclusions.morning.toLowerCase() : fr.contracts.wizard.exclusions.afternoon.toLowerCase()}`)
              .join(' · ')
          : fr.contracts.wizard.exclusions.recapEmpty,
    },
    ...(data.specialPeriods.length > 0
      ? [
          {
            label: fr.contracts.wizard.exclusions.periodsRecap,
            value: data.specialPeriods
              .map((p) => `${p.label} (${formatDate(p.startDate)}${p.endDate ? ` → ${formatDate(p.endDate)}` : ''})`)
              .join(' · '),
          },
        ]
      : []),
    {
      label: fr.contracts.wizard.steps.period,
      value:
        data.startDate && data.endDate
          ? `${capitalize(formatDate(data.startDate))} → ${formatDate(data.endDate)}`
          : '—',
    },
    {
      label: fr.contracts.wizard.steps.slots,
      value: selectedSlot ? `${fr.weekdays[selectedSlot.weekday]} · ${formatTime(selectedSlot.time)}` : '—',
    },
    ...(data.planningNotes.trim()
      ? [{ label: fr.contracts.wizard.exclusions.notesLabel, value: data.planningNotes }]
      : []),
  ];

  const stepSummary = (
    <>
      <h3 className={styles.summaryTitle}>{fr.contracts.wizard.summary.title}</h3>
      <p className={styles.muted}>{fr.contracts.wizard.summary.intro}</p>
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} autoFocus />}
      <dl className={styles.summaryList}>
        {summaryRows.map((row) => (
          <div key={row.label}>
            <dt className={styles.summaryLabel}>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        <div>
          <dt className={styles.summaryLabel}>{fr.contracts.wizard.summary.estimatedRate}</dt>
          <dd>{formatEuro(source.data?.rate ?? 65)}</dd>
        </div>
      </dl>
    </>
  );

  const aside =
    step === 0 ? undefined : (
      <div>
        <p className={styles.asideTitle}>{fr.contracts.wizard.runningSummary}</p>
        <dl className={styles.summaryList}>
          {summaryRows.slice(0, 5).map((row) => (
            <div key={row.label}>
              <dt className={styles.summaryLabel}>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );

  const blocker = stepBlocker();
  const isLast = step === steps.length - 1;

  return (
    <>
      <PageHeader title={title} crumbs={[{ label: fr.contracts.title, to: '/contrats' }, { label: title }]} />

      {mode === 'resubmit' && source.data?.rejectionReason && (
        <InlineAlert variant="warning" title={fr.contracts.wizard.rejectedBanner}>
          {source.data.rejectionReason}
        </InlineAlert>
      )}
      {renewalOf && source.data && (
        <InlineAlert variant="info" title={fr.contracts.wizard.prefilledBanner}>
          {source.data.reference}
        </InlineAlert>
      )}
      {draftBanner && loadedFrom !== 'draft' && (
        <InlineAlert
          variant="info"
          title={fr.contracts.wizard.draftBanner(draftBanner.savedBy, formatTimestamp(draftBanner.savedAt))}
          action={
            <span className={styles.bannerActions}>
              <Button
                size="md"
                onClick={() => {
                  dispatch({ type: 'load', data: draftBanner.data });
                  setStep(draftBanner.step);
                  setLoadedFrom('draft');
                }}
              >
                {fr.contracts.wizard.resumeDraft}
              </Button>
              <Button
                size="md"
                variant="ghost"
                onClick={() => {
                  setDraftBanner(null);
                  void api.discardContractDraft();
                }}
              >
                {fr.contracts.wizard.discardDraft}
              </Button>
            </span>
          }
        />
      )}

      <Wizard
        steps={steps}
        current={step}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={next}
        nextLabel={
          isLast
            ? mode === 'resubmit'
              ? fr.contracts.wizard.summary.resubmit
              : renewalOf
                ? fr.contracts.wizard.summary.submitRenewal
                : fr.contracts.wizard.summary.submit
            : fr.contracts.wizard.next
        }
        nextDisabled={blocker !== null}
        nextDisabledReason={blocker ?? undefined}
        busy={busy}
        onSaveDraft={mode === 'create' && !renewalOf ? saveDraft : undefined}
        summary={aside}
      >
        {step === 0 && stepNeeds}
        {step === 1 && <ExclusionsStep data={data} dispatch={dispatch} />}
        {step === 2 && stepPeriod}
        {step === 3 && stepSlots}
        {step === 4 && stepSummary}
      </Wizard>
    </>
  );
}
