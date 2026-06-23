import { Fragment, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, CircleCheck, Lightbulb, TriangleAlert } from 'lucide-react';
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
  SpecialPeriod,
  UnitType,
  WizardData,
} from '@/types/models';
import { ExclusionsStep, PROFILE_RANGES, rangeText } from './ExclusionsStep';
import styles from './contracts.module.css';

export const EMPTY_WIZARD: WizardData = {
  frequency: null,
  // DT-E4 — les séances DS sont toujours collectives : type figé, plus de choix.
  sessionType: 'collective',
  units: [],
  otherUnitLabel: '',
  multiUnitPlanning: null,
  weeklyExclusions: [],
  specialPeriods: [],
  planningNotes: '',
  // DT-E3 — profil par défaut EHPAD (ajusté au type d'établissement au chargement).
  availabilityProfile: 'ehpad',
  startDate: null,
  endDate: null,
  // DT-E5 — contrat à durée définie par défaut (12 mois préappliqués à l'étape Période).
  openEnded: false,
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
    availabilityProfile: contract.availabilityProfile ?? 'ehpad',
    startDate: contract.startDate,
    endDate: contract.openEnded ? null : contract.endDate,
    openEnded: contract.openEnded ?? false,
  };
}

type WizardAction =
  | { type: 'patch'; patch: Partial<WizardData> }
  | { type: 'load'; data: WizardData }
  | { type: 'toggleWeekly'; weekday: number; part: 'matin' | 'apres_midi' }
  | { type: 'blockRow'; part: 'matin' | 'apres_midi'; blocked: boolean }
  | { type: 'preset'; preset: 'wednesday' | 'mornings' | 'monfri' }
  | { type: 'resetExclusions' }
  | { type: 'addPeriod'; period: SpecialPeriod }
  | { type: 'updatePeriod'; period: SpecialPeriod }
  | { type: 'removePeriod'; id: string };

/** Jours ouvrés cliquables dans la grille (lun→ven). Les week-ends (5,6) sont
 *  prédéfinis non disponibles — jamais de séance DS le week-end en EHPAD. */
const WORK_DAYS = [0, 1, 2, 3, 4];

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
    case 'blockRow': {
      // Bloque / débloque tout le matin (ou l'après-midi) sur les jours ouvrés.
      const others = data.weeklyExclusions.filter((e) => e.part !== action.part || !WORK_DAYS.includes(e.weekday));
      return {
        ...data,
        weeklyExclusions: action.blocked
          ? [...others, ...WORK_DAYS.map((weekday) => ({ weekday, part: action.part }))]
          : others,
      };
    }
    case 'preset': {
      const add = (list: WizardData['weeklyExclusions'], weekday: number, part: 'matin' | 'apres_midi') =>
        list.some((e) => e.weekday === weekday && e.part === part) ? list : [...list, { weekday, part }];
      let list = data.weeklyExclusions;
      if (action.preset === 'wednesday') {
        list = add(add(list, 2, 'matin'), 2, 'apres_midi');
      } else if (action.preset === 'mornings') {
        for (const d of WORK_DAYS) list = add(list, d, 'matin');
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
  // DT-E3 — type d'établissement, pour choisir le profil de disponibilité par défaut.
  const facilityState = useAsync(() => api.getFacility(), []);

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

  // DT-E3 — création neuve : profil de disponibilité par défaut selon le type
  // d'établissement (EHPAD → créneaux resserrés, autre → journée étendue).
  // En resoumission/renouvellement, le profil vient du contrat source (load).
  useEffect(() => {
    if (mode === 'create' && !sourceId && facilityState.data && loadedFrom === 'none') {
      const isEhpad = /ehpad/i.test(facilityState.data.category);
      dispatch({ type: 'patch', patch: { availabilityProfile: isEhpad ? 'ehpad' : 'etendu' } });
    }
  }, [facilityState.data, loadedFrom, mode, sourceId]);

  // DT-E5 — « 12 mois » est la durée recommandée par défaut : on préremplit la
  // période à l'arrivée sur l'étape 3 si rien n'est encore saisi (création neuve).
  useEffect(() => {
    if (step === 4 && !data.startDate && !data.endDate && !data.openEnded) {
      const start = toIso(addDays(new Date(), 1));
      const end = toIso(addDays(addMonths(parseDate(start), 12), -1));
      dispatch({ type: 'patch', patch: { startDate: start, endDate: end } });
    }
  }, [step, data.startDate, data.endDate, data.openEnded]);

  // 7 étapes internes ; seules les 5 premières (Fréquence → Période) sont des
  // pastilles dans la barre. Créneaux + Récap sont des écrans de continuation
  // (après « Voir les créneaux suggérés »), affichés barre « tout fait ».
  const steps: WizardStepDef[] = [
    { id: 'frequency', title: fr.contracts.wizard.steps.frequency },
    { id: 'units', title: fr.contracts.wizard.steps.units },
    { id: 'consecutivity', title: fr.contracts.wizard.steps.consecutivity },
    { id: 'indispos', title: fr.contracts.wizard.steps.indispos },
    { id: 'period', title: fr.contracts.wizard.steps.period },
    { id: 'slots', title: fr.contracts.wizard.steps.slots },
    { id: 'summary', title: fr.contracts.wizard.steps.summary },
  ];
  const VISIBLE_STEPS = 5;
  const S = { frequency: 0, units: 1, consecutivity: 2, indispos: 3, period: 4, slots: 5, summary: 6 } as const;

  // CON-08 — suggestions chargées à l'entrée de l'étape Créneaux
  const suggestions = useAsync(
    () => (step === S.slots ? api.getSlotSuggestions(data) : Promise.resolve([])),
    [step === S.slots],
  );
  const visibleSlots = (suggestions.data ?? []).filter((s) => !data.removedSlotIds.includes(s.id));

  // Le meilleur créneau est présélectionné
  useEffect(() => {
    if (step === S.slots && data.selectedSlotId === null && visibleSlots.length > 0) {
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
    if (step === S.frequency && !data.frequency) return fr.contracts.wizard.frequencyError;
    if (step === S.units) {
      if (data.units.length === 0) return fr.contracts.wizard.unitsError;
      if (data.units.includes('AUTRE') && data.otherUnitLabel.trim() === '')
        return fr.contracts.wizard.otherUnitError;
    }
    // Enchaînement : requis seulement à partir de 2 unités (sinon rien à enchaîner).
    if (step === S.consecutivity && data.units.length > 1 && !data.multiUnitPlanning) {
      return fr.contracts.wizard.multiUnitError;
    }
    if (step === S.period) {
      if (!data.startDate) return fr.contracts.wizard.period.startError;
      // DT-E5 — contrat sans fin : pas de date de fin à valider.
      if (!data.openEnded && (!data.endDate || data.endDate <= data.startDate))
        return fr.contracts.wizard.period.endError;
    }
    if (step === S.slots && visibleSlots.length > 0 && data.selectedSlotId === null) {
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

  const wiz = fr.contracts.wizard;
  const unitOptions: UnitType[] = ['UC', 'UP_UHR', 'AIDANTS', 'SOIGNANTS', 'AUTRE'];
  const unitShortNames = data.units
    .map((u) => (u === 'AUTRE' && data.otherUnitLabel.trim() ? data.otherUnitLabel.trim() : unitLabel(u)))
    .join(' + ');
  const hasMultiUnits = data.units.length > 1;

  // Étape 1 — Fréquence (cartes radio + sous-libellé « ≈ 4 passages/mois · le plus courant »)
  const stepFrequency = (
    <>
      <h3 className={styles.stepTitle}>{wiz.frequencyTitle}</h3>
      <p className={styles.stepIntro}>{wiz.frequencyIntro}</p>
      <RadioGroup<Frequency>
        legend={wiz.frequencyLabel}
        hideLegend
        value={data.frequency}
        onChange={(frequency) => dispatch({ type: 'patch', patch: { frequency } })}
        appearance="card"
        required
        options={(['hebdo', 'bihebdo', 'bimensuel', 'mensuel', 'ponctuel'] as Frequency[]).map((f) => ({
          value: f,
          label: fr.frequency[f],
          helper: wiz.frequencyHints[f],
        }))}
      />
    </>
  );

  // Étape 2 — Unités (cartes à cocher avec descriptions + contrainte soignants + « Autre »)
  const stepUnits = (
    <>
      <h3 className={styles.stepTitle}>{wiz.unitsTitle}</h3>
      <p className={styles.stepIntro}>{wiz.unitsIntro}</p>
      {data.frequency && (
        <span className={styles.contextChip}>{wiz.chosenLabel} : {fr.frequency[data.frequency]}</span>
      )}
      <fieldset className={styles.unitsFieldset}>
        <legend className="sr-only">{wiz.unitsLabel}</legend>
        {unitOptions.map((unit) => {
          const desc = wiz.unitDescriptions[unit];
          const helper =
            unit === 'SOIGNANTS' ? (
              <span className={styles.unitWarn}>
                <TriangleAlert className={styles.inlineWarnIcon} aria-hidden /> {desc}
              </span>
            ) : (
              desc
            );
          return (
            <Fragment key={unit}>
              <Checkbox
                appearance="card"
                label={unitLabel(unit)}
                helper={helper}
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
              {unit === 'AUTRE' && data.units.includes('AUTRE') && (
                <div className={styles.otherUnitField}>
                  <TextField
                    label={wiz.otherUnitLabel}
                    value={data.otherUnitLabel}
                    onChange={(otherUnitLabel) => dispatch({ type: 'patch', patch: { otherUnitLabel } })}
                    placeholder={wiz.otherUnitPlaceholder}
                    required
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </fieldset>
      {data.units.length > 0 && (
        <InlineAlert variant="info" icon={Lightbulb}>
          {wiz.unitsCountInfo(data.units.length, unitShortNames)}
        </InlineAlert>
      )}
    </>
  );

  // Étape 3 — Enchaînement (conditionnel : seulement à partir de 2 unités)
  const stepConsecutivity = hasMultiUnits ? (
    <>
      <h3 className={styles.stepTitle}>{wiz.consecutivityTitle(data.units.length)}</h3>
      <p className={styles.stepIntro}>{wiz.consecutivityIntro(data.units.length, unitShortNames)}</p>
      {data.frequency && (
        <span className={styles.contextChip}>
          {fr.frequency[data.frequency]} · {unitShortNames}
        </span>
      )}
      <InlineAlert variant="success" icon={Lightbulb}>
        {wiz.consecutivityTip}
      </InlineAlert>
      <RadioGroup<'meme_jour' | 'jours_separes'>
        legend={wiz.multiUnitLabel}
        hideLegend
        value={data.multiUnitPlanning}
        onChange={(multiUnitPlanning) => dispatch({ type: 'patch', patch: { multiUnitPlanning } })}
        appearance="card"
        required
        options={[
          {
            value: 'meme_jour',
            label: wiz.chainSameDay,
            helper: (
              <>
                <span className={styles.chainChips}>
                  {data.units.map((u, i) => (
                    <Fragment key={u}>
                      {i > 0 && <ArrowRight className={styles.chainArrow} aria-hidden />}
                      <span className={styles.chainChip}>
                        {unitLabel(u)} · 1h
                      </span>
                    </Fragment>
                  ))}
                </span>
                <span className={styles.chainBenefit}>{wiz.chainSameDayBenefit}</span>
              </>
            ),
          },
          {
            value: 'jours_separes',
            label: wiz.chainSeparate,
            helper: (
              <>
                <span>{wiz.chainSeparateExample}</span>
                <span className={styles.chainWarn}>
                  <TriangleAlert className={styles.inlineWarnIcon} aria-hidden /> {wiz.chainSeparateWarn}
                </span>
              </>
            ),
          },
        ]}
      />
    </>
  ) : (
    <>
      <h3 className={styles.stepTitle}>{wiz.consecutivitySingleTitle}</h3>
      <InlineAlert variant="info" icon={Lightbulb}>
        {wiz.consecutivitySingleNote}
      </InlineAlert>
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
    // DT-E5 — une durée définie annule l'option « sans échéance ».
    dispatch({ type: 'patch', patch: { startDate: start, endDate: toIso(endDate), openEnded: false } });
  };
  // DT-E5 — contrat sans fin : on garde une date de début, la fin reste vide.
  const applyNoEnd = () => {
    dispatch({
      type: 'patch',
      patch: { startDate: data.startDate ?? tomorrow, endDate: null, openEnded: true },
    });
  };

  const period = fr.contracts.wizard.period;

  // DT-E3 — récap du profil de disponibilité choisi (résumé + panneau latéral).
  const exCopy = fr.contracts.wizard.exclusions;
  const availabilityProfileValue = exCopy.profileSummary(
    data.availabilityProfile === 'ehpad' ? exCopy.profileEhpad : exCopy.profileEtendu,
    data.availabilityProfile === 'ehpad'
      ? `${exCopy.morning} ${rangeText(PROFILE_RANGES.ehpad.morning)} · ${exCopy.afternoon} ${rangeText(PROFILE_RANGES.ehpad.afternoon)}`
      : `${formatTime('09:00')}–${formatTime('19:00')}`,
  );

  // Estimation de séances pour la carte recommandée (≈ passages/mois × 12 mois).
  const perMonth: Record<Frequency, number> = { hebdo: 4, bihebdo: 8, bimensuel: 2, mensuel: 1, ponctuel: 1 };
  const estSessions = data.frequency ? perMonth[data.frequency] * 12 : 48;
  const recoEnd = data.startDate ? toIso(addDays(addMonths(parseDate(data.startDate), 12), -1)) : null;
  // « 12 mois glissants » sélectionné = durée définie collée sur 12 mois pile.
  const is12Months = !data.openEnded && !!data.startDate && data.endDate === recoEnd;

  const stepPeriod = (
    <>
      <h3 className={styles.stepTitle}>{period.title}</h3>
      <p className={styles.stepIntro}>{period.intro}</p>

      {/* Carte « hero » recommandée : 12 mois glissants (sélectionnée par défaut). */}
      <button
        type="button"
        className={styles.recoCard}
        data-selected={is12Months || undefined}
        aria-pressed={is12Months}
        onClick={() => applyPreset(12)}
      >
        <span className={styles.recoMain}>
          <span className={styles.recoHead}>
            <span className={styles.recoTitle}>{period.recommendedTitle}</span>
            <span className={styles.recommendedBadge}>{period.recommended}</span>
          </span>
          {data.startDate && recoEnd && (
            <span className={styles.recoRange}>
              {period.recommendedRange(capitalize(formatDate(data.startDate)), formatDate(recoEnd))}
            </span>
          )}
          <span className={styles.recoDetail}>{period.recommendedDetail(estSessions)}</span>
        </span>
        <CircleCheck className={styles.recoCheck} data-on={is12Months || undefined} aria-hidden />
      </button>

      {/* Dates modifiables */}
      <div className={styles.periodDates}>
        <div className={styles.dateGrid}>
          <DatePicker
            label={period.start}
            value={data.startDate}
            onChange={(startDate) => dispatch({ type: 'patch', patch: { startDate } })}
            min={tomorrow}
            helper={period.startHelp}
            required
          />
          {data.openEnded ? (
            // DT-E5 — pas de date de fin : on l'explique à la place du sélecteur.
            <div className={styles.fixedField}>
              <p className={styles.groupLabel}>{period.end}</p>
              <p className={styles.mutedIntro}>{period.openEndedNote}</p>
            </div>
          ) : (
            <DatePicker
              label={period.end}
              value={data.endDate}
              onChange={(endDate) => dispatch({ type: 'patch', patch: { endDate, openEnded: false } })}
              min={data.startDate ? toIso(addDays(parseDate(data.startDate), 1)) : tomorrow}
              required
            />
          )}
        </div>
        <p className={styles.mutedIntro}>{period.modifiableNote}</p>
      </div>

      {/* Autres options de durée (rare) — repliées par défaut */}
      <details className={styles.otherOptions}>
        <summary className={styles.otherOptionsSummary}>
          <ChevronDown className={styles.otherOptionsChevron} aria-hidden />
          {period.otherOptions}
        </summary>
        <div className={styles.presetRow}>
          <Button size="md" onClick={() => applyPreset(24)}>
            {period.presets.twentyFour}
          </Button>
          <Button size="md" onClick={() => applyPreset('school')}>
            {period.presets.school}
          </Button>
          <Button
            size="md"
            variant={data.openEnded ? 'accent' : 'secondary'}
            onClick={applyNoEnd}
            aria-pressed={data.openEnded}
          >
            {period.presets.noEnd}
          </Button>
        </div>
      </details>
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
    { label: fr.contracts.wizard.exclusions.profileTitle, value: availabilityProfileValue },
    {
      label: fr.contracts.wizard.steps.period,
      value: !data.startDate
        ? '—'
        : data.openEnded
          ? `${capitalize(formatDate(data.startDate))} → ${period.openEndedValue}`
          : data.endDate
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

  // Encart « Besoin d'aide ? » — affiché sous CHAQUE étape (cf. maquette Loïc).
  const helpBox = (
    <InlineAlert variant="info" icon={Lightbulb} title={wiz.help.title}>
      {wiz.help.body}{' '}
      <a href={`mailto:${wiz.help.email}`} className={styles.helpLink}>
        {wiz.help.email}
      </a>
      .
    </InlineAlert>
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
                  // Borne l'index au cas où la structure d'étapes aurait changé depuis l'enregistrement.
                  setStep(Math.min(Math.max(0, draftBanner.step), steps.length - 1));
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
        visibleStepCount={VISIBLE_STEPS}
        help={helpBox}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={next}
        nextLabel={
          isLast
            ? mode === 'resubmit'
              ? fr.contracts.wizard.summary.resubmit
              : renewalOf
                ? fr.contracts.wizard.summary.submitRenewal
                : fr.contracts.wizard.summary.submit
            : step === S.period
              ? period.seeSlots
              : fr.contracts.wizard.next
        }
        nextDisabled={blocker !== null}
        nextDisabledReason={blocker ?? undefined}
        busy={busy}
        onSaveDraft={mode === 'create' && !renewalOf ? saveDraft : undefined}
      >
        {step === S.frequency && stepFrequency}
        {step === S.units && stepUnits}
        {step === S.consecutivity && stepConsecutivity}
        {step === S.indispos && <ExclusionsStep data={data} dispatch={dispatch} />}
        {step === S.period && stepPeriod}
        {step === S.slots && stepSlots}
        {step === S.summary && stepSummary}
      </Wizard>
    </>
  );
}
