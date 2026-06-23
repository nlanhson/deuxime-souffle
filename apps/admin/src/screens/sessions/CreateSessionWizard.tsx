import { useState } from 'react';
import {
  Modal,
  Wizard,
  Field,
  TextField,
  FormSelect,
  RadioCards,
  CheckboxCards,
  FieldGrid,
  Pill,
} from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './SessionsScreen.module.css';
import {
  SESSION_TYPE_VALUES,
  SESSION_ORIGIN_VALUES,
  EHPAD_OPTIONS,
  UNIT_VALUES,
  TARIF_VALUES,
  ASSIGN_MODE_VALUES,
} from './data';

export function CreateSessionWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useStrings();
  const w = t.sessions.wizard;

  const STEPS = [w.steps.type, w.steps.establishment, w.steps.details, w.steps.assignment, w.steps.recap];

  // Build option lists from data.ts values + dictionary text.
  const sessionTypes = SESSION_TYPE_VALUES.map((value) => ({ value, ...w.types[value] }));
  const sessionOrigins = SESSION_ORIGIN_VALUES.map((value) => ({ value, label: w.origins[value] }));
  const unitOptions = UNIT_VALUES.map((value) => ({ value, ...w.units[value] }));
  const tarifPresets = TARIF_VALUES.map((value) => ({ value, label: w.tarifs[value] }));
  const assignModes = ASSIGN_MODE_VALUES.map((value) => ({ value, ...w.modes[value] }));

  const [step, setStep] = useState(0);
  const [type, setType] = useState('ponctuelle');
  const [origin, setOrigin] = useState('tel');
  const [ehpad, setEhpad] = useState(EHPAD_OPTIONS[0] ?? '');
  const [date, setDate] = useState('2026-06-22');
  const [time, setTime] = useState('14:00');
  const [count, setCount] = useState('1');
  const [unit, setUnit] = useState('uc');
  const [tarif, setTarif] = useState('150');
  const [markers, setMarkers] = useState<string[]>([]);
  const [mode, setMode] = useState('flex');

  function reset() {
    setStep(0);
  }

  const tarifNum = Number(tarif);
  const coachCost = Math.round(tarifNum * 0.45);

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      size="wide"
      title={w.title}
      subtitle={w.subtitle}
    >
      <Wizard
        steps={STEPS}
        current={step}
        completeLabel={w.complete}
        onCancel={() => {
          onClose();
          reset();
        }}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        onComplete={() => {
          onClose();
          reset();
        }}
      >
        {step === 0 && (
          <>
            <Field label={w.fields.type} required>
              {() => <RadioCards name="type" options={sessionTypes} value={type} onChange={setType} columns={2} />}
            </Field>
            <Field label={w.fields.origin}>
              {(id) => (
                <FormSelect id={id} value={origin} onChange={(e) => setOrigin(e.target.value)} options={sessionOrigins} />
              )}
            </Field>
          </>
        )}

        {step === 1 && (
          <Field label={w.fields.establishment} required hint={w.fields.establishmentHint}>
            {() => (
              <RadioCards
                name="ehpad"
                value={ehpad}
                onChange={setEhpad}
                options={EHPAD_OPTIONS.map((e) => ({ value: e, label: e }))}
              />
            )}
          </Field>
        )}

        {step === 2 && (
          <>
            <FieldGrid>
              <Field label={w.fields.date} required>
                {(id) => <TextField id={id} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
              </Field>
              <Field label={w.fields.startTime} required>
                {(id) => <TextField id={id} type="time" value={time} onChange={(e) => setTime(e.target.value)} />}
              </Field>
            </FieldGrid>
            <Field label={w.fields.chained} hint={w.fields.chainedHint}>
              {() => (
                <RadioCards
                  name="count"
                  columns={2}
                  value={count}
                  onChange={setCount}
                  options={[
                    { value: '1', label: w.count.one },
                    { value: '2', label: w.count.two },
                    { value: '3', label: w.count.three },
                  ]}
                />
              )}
            </Field>
            <Field label={w.fields.unit} required>
              {() => <RadioCards name="unit" options={unitOptions} value={unit} onChange={setUnit} columns={2} />}
            </Field>
            <FieldGrid>
              <Field label={w.fields.tarif}>
                {(id) => <FormSelect id={id} value={tarif} onChange={(e) => setTarif(e.target.value)} options={tarifPresets} />}
              </Field>
              <Field label={w.fields.markers}>
                {() => (
                  <CheckboxCards
                    values={markers}
                    onChange={setMarkers}
                    columns={2}
                    options={[
                      { value: 'cfppa', label: w.markers.cfppa },
                      { value: 'bdc', label: w.markers.bdc },
                    ]}
                  />
                )}
              </Field>
            </FieldGrid>
          </>
        )}

        {step === 3 && (
          <Field label={w.fields.assignMode} required>
            {() => <RadioCards name="mode" options={assignModes} value={mode} onChange={setMode} />}
          </Field>
        )}

        {step === 4 && (
          <div className={styles.recap}>
            <ul className={styles.recapList}>
              <RecapRow label={w.recap.type} value={sessionTypes.find((o) => o.value === type)?.label ?? ''} />
              <RecapRow label={w.recap.establishment} value={ehpad} />
              <RecapRow label={w.recap.dateTime} value={`${date} · ${time}`} />
              <RecapRow
                label={w.recap.format}
                value={`${t.sessions.sessionCount(Number(count))} · ${unitOptions.find((u) => u.value === unit)?.label}`}
              />
              <RecapRow
                label={w.recap.tarif}
                value={tarifNum === 0 ? w.recap.free : `${tarifNum} € HT`}
                extra={markers.length ? markers.map((m) => m.toUpperCase()).join(' · ') : undefined}
              />
              <RecapRow label={w.recap.assignment} value={assignModes.find((o) => o.value === mode)?.label ?? ''} />
            </ul>
            <div className={styles.costCard}>
              <h4 className={styles.costTitle}>{w.cost.title}</h4>
              <div className={styles.costRow}>
                <span>{w.cost.revenue}</span>
                <span className={shared.num}>{tarifNum} €</span>
              </div>
              <div className={styles.costRow}>
                <span>{w.cost.coachCost}</span>
                <span className={shared.num}>{coachCost} €</span>
              </div>
              <div className={`${styles.costRow} ${styles.costTotal}`}>
                <span>{w.cost.margin}</span>
                <span className={shared.num}>{tarifNum - coachCost} €</span>
              </div>
              <p className={styles.costNote}>
                <Pill tone="info">{w.cost.notifLabel}</Pill> {w.cost.notifText}
              </p>
            </div>
          </div>
        )}
      </Wizard>
    </Modal>
  );
}

function RecapRow({ label, value, extra }: { label: string; value: string; extra?: string | undefined }) {
  return (
    <li className={styles.recapRow}>
      <span className={styles.recapLabel}>{label}</span>
      <span className={styles.recapValue}>
        {value}
        {extra ? <span className={shared.cellMuted}> · {extra}</span> : null}
      </span>
    </li>
  );
}
