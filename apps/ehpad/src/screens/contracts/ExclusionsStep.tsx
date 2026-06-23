import { useState } from 'react';
import { Check, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useStrings } from '@/i18n';
import { useToast } from '@/context/ToastContext';
import { formatDate, formatTime } from '@/lib/format';
import { Button, DatePicker, RadioGroup, Select, Textarea, TextField } from '@/components';
import type { AvailabilityProfile, SpecialPeriod, WizardData } from '@/types/models';
import styles from './contracts.module.css';

/** Jours ouvrés cliquables (lun→ven) ; les week-ends sont prédéfinis indisponibles. */
const WORK_DAYS = [0, 1, 2, 3, 4];

/** DT-E3 — créneaux de séance par type d'établissement. EHPAD : matin court +
 *  après-midi resserré ; structures souples : journée étendue. Heures brutes
 *  rendues via `formatTime` (12 h am/pm, comme tout l'app EHPAD). */
export const PROFILE_RANGES: Record<
  AvailabilityProfile,
  { morning: [string, string]; afternoon: [string, string] }
> = {
  ehpad: { morning: ['11:00', '12:00'], afternoon: ['14:00', '17:00'] },
  etendu: { morning: ['09:00', '13:00'], afternoon: ['13:00', '19:00'] },
};
export const rangeText = (r: [string, string]) => `${formatTime(r[0])}–${formatTime(r[1])}`;

type Dispatch = (action:
  | { type: 'patch'; patch: Partial<WizardData> }
  | { type: 'toggleWeekly'; weekday: number; part: 'matin' | 'apres_midi' }
  | { type: 'blockRow'; part: 'matin' | 'apres_midi'; blocked: boolean }
  | { type: 'preset'; preset: 'wednesday' | 'mornings' | 'monfri' }
  | { type: 'resetExclusions' }
  | { type: 'addPeriod'; period: SpecialPeriod }
  | { type: 'updatePeriod'; period: SpecialPeriod }
  | { type: 'removePeriod'; id: string }) => void;

let periodSeq = 0;

/** CON-02 — étape Disponibilités : grille jour × demi-journée, raccourcis,
 *  périodes spéciales modifiables, réinitialisation, notes, récapitulatif. */
export function ExclusionsStep({ data, dispatch }: { data: WizardData; dispatch: Dispatch }) {
  const fr = useStrings();
  const { showToast } = useToast();
  const copy = fr.contracts.wizard.exclusions;
  const [editing, setEditing] = useState<SpecialPeriod | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const isBlocked = (weekday: number, part: 'matin' | 'apres_midi') =>
    data.weeklyExclusions.some((e) => e.weekday === weekday && e.part === part);

  const openNew = () => {
    setEditing({
      id: `periode-${(periodSeq += 1)}-${Date.now()}`,
      kind: 'fermeture',
      label: '',
      startDate: '',
      part: 'journee',
    });
    setFormOpen(true);
  };

  const savePeriod = () => {
    if (!editing || editing.label.trim() === '' || editing.startDate === '') return;
    const exists = data.specialPeriods.some((p) => p.id === editing.id);
    dispatch(exists ? { type: 'updatePeriod', period: editing } : { type: 'addPeriod', period: editing });
    setFormOpen(false);
    setEditing(null);
    showToast({ message: copy.periodSaved });
  };

  const ranges = PROFILE_RANGES[data.availabilityProfile];

  return (
    <>
      <h3 className={styles.stepTitle}>{fr.contracts.wizard.indisposTitle}</h3>
      <p className={styles.stepIntro}>{fr.contracts.wizard.indisposIntro}</p>

      {/* 1 — Plage horaire de l'établissement (DT-E3) : les créneaux de la grille en découlent. */}
      <section className={styles.indisposSection}>
        <h4 className={styles.sectionNumTitle}>{copy.section1}</h4>
        <div className={styles.profileBlock}>
          <RadioGroup<AvailabilityProfile>
            legend={copy.profileTitle}
            value={data.availabilityProfile}
            onChange={(availabilityProfile) =>
              dispatch({ type: 'patch', patch: { availabilityProfile } })
            }
            options={[
              {
                value: 'ehpad',
                label: `${copy.profileEhpad} · ${copy.morning} ${rangeText(PROFILE_RANGES.ehpad.morning)} · ${copy.afternoon} ${rangeText(PROFILE_RANGES.ehpad.afternoon)}`,
              },
              {
                value: 'etendu',
                label: `${copy.profileEtendu} · ${formatTime('09:00')}–${formatTime('19:00')}`,
              },
            ]}
          />
          <p className={styles.mutedIntro}>{copy.profileIntro}</p>
        </div>
      </section>

      {/* 2 — Jours et demi-journées indisponibles : grille verte ✓ / rouge ✗,
          week-ends prédéfinis, raccourcis (dont réinitialiser). */}
      <section className={styles.indisposSection}>
        <h4 className={styles.sectionNumTitle}>{copy.section2}</h4>
        <p className={styles.mutedIntro}>{copy.section2Hint}</p>

        <div className={styles.presetRow}>
          <Button size="md" onClick={() => dispatch({ type: 'preset', preset: 'wednesday' })}>
            {copy.presetWednesday}
          </Button>
          <Button size="md" onClick={() => dispatch({ type: 'preset', preset: 'mornings' })}>
            {copy.presetMornings}
          </Button>
          <Button size="md" onClick={() => dispatch({ type: 'preset', preset: 'monfri' })}>
            {copy.presetMonFri}
          </Button>
          <Button
            size="md"
            variant="ghost"
            icon={RotateCcw}
            onClick={() => {
              dispatch({ type: 'resetExclusions' });
              showToast({ message: copy.resetDone, kind: 'neutral' });
            }}
          >
            {copy.presetReset}
          </Button>
        </div>

        <div className={styles.exGrid} role="group" aria-label={copy.gridCaption}>
          <span aria-hidden />
          {fr.weekdaysShort.map((day) => (
            <span key={day} className={styles.exHead} aria-hidden>
              {day}
            </span>
          ))}
          {(['matin', 'apres_midi'] as const).map((part) => {
            const partLabel = part === 'matin' ? copy.morning : copy.afternoon;
            const allBlocked = WORK_DAYS.every((d) => isBlocked(d, part));
            return (
              <div key={part} className={styles.exRowGroup}>
                <span className={styles.exRowLabel}>
                  {/* Coche « tout bloquer » de la rangée (matin / après-midi des jours ouvrés). */}
                  <label className={styles.blockRowCheck}>
                    <input
                      type="checkbox"
                      className={styles.blockRowInput}
                      checked={allBlocked}
                      onChange={(e) => dispatch({ type: 'blockRow', part, blocked: e.target.checked })}
                      aria-label={copy.blockRowAria(partLabel.toLowerCase())}
                    />
                    <span className={styles.blockRowBox} aria-hidden>
                      <Check size={13} />
                    </span>
                  </label>
                  <span className={styles.exRowLabelText}>
                    {partLabel}
                    <span className={styles.exRowRange}>
                      {rangeText(part === 'matin' ? ranges.morning : ranges.afternoon)}
                    </span>
                  </span>
                </span>
                {Array.from({ length: 7 }, (_, weekday) => {
                  if (!WORK_DAYS.includes(weekday)) {
                    // Week-end : prédéfini indisponible, non interactif.
                    return (
                      <span
                        key={weekday}
                        className={styles.exCell}
                        data-weekend
                        role="img"
                        title={copy.weekend}
                        aria-label={`${fr.weekdays[weekday]} ${partLabel}, ${copy.weekend}`}
                      >
                        <X className={styles.exCellIcon} aria-hidden />
                      </span>
                    );
                  }
                  const blocked = isBlocked(weekday, part);
                  return (
                    <button
                      key={weekday}
                      type="button"
                      className={styles.exCell}
                      data-blocked={blocked || undefined}
                      aria-pressed={blocked}
                      aria-label={`${fr.weekdays[weekday]} ${partLabel}, ${blocked ? copy.blocked : copy.available}`}
                      onClick={() => dispatch({ type: 'toggleWeekly', weekday, part })}
                    >
                      {blocked ? (
                        <X className={styles.exCellIcon} aria-hidden />
                      ) : (
                        <Check className={styles.exCellIcon} aria-hidden />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p className={styles.blockRowHint}>{copy.blockRowHint}</p>
      </section>

      {/* Note libre (facultatif) — placée entre la grille et les périodes (maquette). */}
      <Textarea
        label={copy.notesLabel}
        value={data.planningNotes}
        onChange={(planningNotes) => dispatch({ type: 'patch', patch: { planningNotes } })}
        helper={copy.notesHelp}
      />

      {/* 3 — Périodes spéciales sur 12 mois (facultatif) */}
      <section className={styles.indisposSection}>
        <h4 className={styles.sectionNumTitle}>{copy.section3}</h4>
        <p className={styles.mutedIntro}>{copy.specialIntro}</p>
        {data.specialPeriods.map((period) => (
          <div key={period.id} className={styles.periodRow}>
            <span>
              <strong>{period.label}</strong> · {fr.contracts.wizard.exclusions.kinds[period.kind]} ·{' '}
              {formatDate(period.startDate)}
              {period.endDate ? ` → ${formatDate(period.endDate)}` : ''} · {fr.dayParts[period.part]}
            </span>
            <span className={styles.rowActions}>
              <Button
                size="md"
                variant="ghost"
                icon={Pencil}
                onClick={() => {
                  setEditing(period);
                  setFormOpen(true);
                }}
              >
                {copy.editPeriod}
              </Button>
              <Button
                size="md"
                variant="ghost"
                icon={Trash2}
                onClick={() => {
                  dispatch({ type: 'removePeriod', id: period.id });
                  showToast({ message: copy.periodDeleted, kind: 'neutral' });
                }}
              >
                {copy.deletePeriod}
              </Button>
            </span>
          </div>
        ))}

        {!formOpen && (
          <Button size="md" icon={Plus} onClick={openNew}>
            {copy.addPeriod}
          </Button>
        )}

        {formOpen && editing && (
          <div className={styles.periodForm}>
            <Select
              label={copy.periodKind}
              value={editing.kind}
              onChange={(kind) =>
                setEditing({ ...editing, kind: kind as SpecialPeriod['kind'] })
              }
              options={[
                { value: 'fermeture', label: copy.kinds.fermeture },
                { value: 'jour_unique', label: copy.kinds.jour_unique },
                { value: 'recurrent', label: copy.kinds.recurrent },
              ]}
            />
            <TextField
              label={copy.periodLabel}
              value={editing.label}
              onChange={(label) => setEditing({ ...editing, label })}
              placeholder={copy.periodLabelPlaceholder}
              required
            />
            <div className={styles.dateGrid}>
              <DatePicker
                label={editing.kind === 'jour_unique' ? copy.periodDay : copy.periodStart}
                value={editing.startDate || null}
                onChange={(startDate) => setEditing({ ...editing, startDate })}
                required
              />
              {editing.kind !== 'jour_unique' && (
                <DatePicker
                  label={copy.periodEnd}
                  value={editing.endDate ?? null}
                  onChange={(endDate) => setEditing({ ...editing, endDate })}
                  min={editing.startDate || undefined}
                />
              )}
            </div>
            <RadioGroup<SpecialPeriod['part']>
              legend={copy.periodPart}
              value={editing.part}
              onChange={(part) => setEditing({ ...editing, part })}
              options={[
                { value: 'journee', label: fr.dayParts.journee },
                { value: 'matin', label: fr.dayParts.matin },
                { value: 'apres_midi', label: fr.dayParts.apres_midi },
              ]}
            />
            <div className={styles.actionRow}>
              <Button
                size="md"
                variant="ghost"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              >
                {fr.common.cancel}
              </Button>
              <Button
                size="md"
                variant="accent"
                onClick={savePeriod}
                disabled={!editing.label.trim() || !editing.startDate}
                disabledReason={fr.common.requiredField}
              >
                {fr.common.save}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Récapitulatif avant de continuer */}
      <div>
        <h4 className={styles.summaryTitle}>{copy.recap}</h4>
        {data.weeklyExclusions.length === 0 && data.specialPeriods.length === 0 ? (
          <p className={styles.muted}>{copy.recapEmpty}</p>
        ) : (
          <dl className={styles.summaryList}>
            {data.weeklyExclusions.length > 0 && (
              <div>
                <dt className={styles.summaryLabel}>{copy.weeklyRecap}</dt>
                <dd>
                  {data.weeklyExclusions
                    .map((e) =>
                      copy.labelFor(
                        fr.weekdays[e.weekday] ?? '',
                        e.part === 'matin' ? copy.morning.toLowerCase() : copy.afternoon.toLowerCase(),
                      ),
                    )
                    .join(' · ')}
                </dd>
              </div>
            )}
            {data.specialPeriods.length > 0 && (
              <div>
                <dt className={styles.summaryLabel}>{copy.periodsRecap}</dt>
                <dd>
                  {data.specialPeriods
                    .map((p) => `${p.label} (${formatDate(p.startDate)}${p.endDate ? ` → ${formatDate(p.endDate)}` : ''})`)
                    .join(' · ')}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </>
  );
}
