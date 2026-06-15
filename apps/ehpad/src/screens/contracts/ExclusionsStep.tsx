import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useStrings } from '@/i18n';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/format';
import { Button, DatePicker, RadioGroup, Select, Textarea, TextField } from '@/components';
import type { SpecialPeriod, WizardData } from '@/types/models';
import styles from './contracts.module.css';

type Dispatch = (action:
  | { type: 'patch'; patch: Partial<WizardData> }
  | { type: 'toggleWeekly'; weekday: number; part: 'matin' | 'apres_midi' }
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

  return (
    <>
      <h3 className={styles.summaryTitle}>{copy.title}</h3>
      <p className={styles.muted}>{copy.intro}</p>

      {/* Grille hebdomadaire jour × matin/après-midi */}
      <div className={styles.exGrid} role="group" aria-label={copy.gridCaption}>
        <span aria-hidden />
        {fr.weekdaysShort.map((day) => (
          <span key={day} className={styles.exHead} aria-hidden>
            {day}
          </span>
        ))}
        {(['matin', 'apres_midi'] as const).map((part) => (
          <div key={part} className={styles.exRowGroup}>
            <span className={styles.exRowLabel}>
              {part === 'matin' ? copy.morning : copy.afternoon}
            </span>
            {Array.from({ length: 7 }, (_, weekday) => {
              const blocked = isBlocked(weekday, part);
              return (
                <button
                  key={weekday}
                  type="button"
                  className={styles.exCell}
                  aria-pressed={blocked}
                  aria-label={`${fr.weekdays[weekday]} ${part === 'matin' ? copy.morning : copy.afternoon}, ${blocked ? copy.blocked : copy.available}`}
                  onClick={() => dispatch({ type: 'toggleWeekly', weekday, part })}
                >
                  {blocked ? copy.blocked : copy.available}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Raccourcis */}
      <div>
        <p className={styles.groupLabel}>
          {copy.presets}
        </p>
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
        </div>
      </div>

      {/* Périodes spéciales */}
      <div>
        <h4 className={styles.summaryTitle}>{copy.specialTitle}</h4>
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
      </div>

      <Button size="md" variant="ghost" onClick={() => {
        dispatch({ type: 'resetExclusions' });
        showToast({ message: copy.resetDone, kind: 'neutral' });
      }}>
        {copy.resetAll}
      </Button>

      <Textarea
        label={`${copy.notesLabel}`}
        value={data.planningNotes}
        onChange={(planningNotes) => dispatch({ type: 'patch', patch: { planningNotes } })}
        helper={copy.notesHelp}
      />

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
