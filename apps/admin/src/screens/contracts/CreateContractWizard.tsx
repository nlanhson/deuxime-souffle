import { useState } from 'react';
import { Mail } from 'lucide-react';
import {
  Modal,
  Wizard,
  Field,
  TextField,
  RadioCards,
  CheckboxCards,
  FieldGrid,
  Pill,
} from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './ContractsScreen.module.css';
import {
  CONTRACT_EHPADS,
  FREQ_VALUES,
  UNIT_VALUES,
  CONSECUTIVITY_VALUES,
  EXCLUSION_VALUES,
  PERIOD_VALUES,
  MARKER_VALUES,
} from './data';

export function CreateContractWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useStrings();
  const [step, setStep] = useState(0);
  const [ehpad, setEhpad] = useState(CONTRACT_EHPADS[0] ?? '');
  const [freq, setFreq] = useState('1sem');
  const [units, setUnits] = useState<string[]>(['uc']);
  const [consecutive, setConsecutive] = useState('oui');
  const [exclusions, setExclusions] = useState<string[]>(['weekend']);
  const [period, setPeriod] = useState('12glissants');
  const [rate, setRate] = useState('150');
  const [markers, setMarkers] = useState<string[]>([]);

  const STEPS = t.contracts.wizard.steps;

  /* Merge data.ts values with dictionary label/desc to build displayed options. */
  const freqOptions = FREQ_VALUES.map((value) => ({ value, ...t.contracts.freq[value] }));
  const unitOptions = UNIT_VALUES.map((value) => ({ value, ...t.contracts.units[value] }));
  const consecOptions = CONSECUTIVITY_VALUES.map((value) => ({ value, ...t.contracts.consecutivity[value] }));
  const exclusionOptions = EXCLUSION_VALUES.map((value) => ({ value, label: t.contracts.exclusions[value] }));
  const periodOptions = PERIOD_VALUES.map((value) => ({ value, ...t.contracts.periods[value] }));
  const markerOptions = MARKER_VALUES.map((value) => ({ value, label: t.contracts.markers[value] }));

  const multiUnit = units.length > 1;
  const close = () => {
    onClose();
    setStep(0);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="wide"
      title={t.contracts.wizard.title}
      subtitle={t.contracts.wizard.subtitle}
    >
      <Wizard
        steps={STEPS}
        current={step}
        completeLabel={t.contracts.wizard.completeLabel}
        onCancel={close}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => {
          // Skip "Consécutivité" when a single unit is selected.
          if (step === 1 && !multiUnit) setStep(3);
          else setStep((s) => Math.min(STEPS.length - 1, s + 1));
        }}
        onComplete={close}
      >
        {step === 0 && (
          <>
            <Field label={t.contracts.wizard.establishmentLabel} required>
              {() => (
                <RadioCards
                  name="ehpad"
                  value={ehpad}
                  onChange={setEhpad}
                  options={CONTRACT_EHPADS.map((e) => ({ value: e, label: e }))}
                />
              )}
            </Field>
            <Field label={t.contracts.wizard.freqLabel} required>
              {() => <RadioCards name="freq" options={freqOptions} value={freq} onChange={setFreq} columns={2} />}
            </Field>
          </>
        )}

        {step === 1 && (
          <Field label={t.contracts.wizard.unitsLabel} required hint={t.contracts.wizard.unitsHint}>
            {() => <CheckboxCards options={unitOptions} values={units} onChange={setUnits} columns={2} />}
          </Field>
        )}

        {step === 2 && (
          <Field label={t.contracts.wizard.consecLabel} required>
            {() => (
              <RadioCards name="consec" options={consecOptions} value={consecutive} onChange={setConsecutive} />
            )}
          </Field>
        )}

        {step === 3 && (
          <>
            <Field label={t.contracts.wizard.exclusionsLabel} hint={t.contracts.wizard.exclusionsHint}>
              {() => <CheckboxCards options={exclusionOptions} values={exclusions} onChange={setExclusions} columns={2} />}
            </Field>
            <Field label={t.contracts.wizard.specialPeriodsLabel}>
              {(id) => <TextField id={id} placeholder={t.contracts.wizard.specialPeriodsPlaceholder} />}
            </Field>
          </>
        )}

        {step === 4 && (
          <Field label={t.contracts.wizard.periodLabel} required>
            {() => <RadioCards name="period" options={periodOptions} value={period} onChange={setPeriod} />}
          </Field>
        )}

        {step === 5 && (
          <div className={styles.recap}>
            <div>
              <ul className={styles.recapList}>
                <RecapRow label={t.contracts.wizard.recap.establishment} value={ehpad} />
                <RecapRow label={t.contracts.wizard.recap.frequency} value={freqOptions.find((f) => f.value === freq)?.label ?? ''} />
                <RecapRow label={t.contracts.wizard.recap.units} value={units.map((u) => unitOptions.find((x) => x.value === u)?.label).join(', ')} />
                <RecapRow label={t.contracts.wizard.recap.period} value={periodOptions.find((p) => p.value === period)?.label ?? ''} />
              </ul>
              <FieldGrid>
                <Field label={t.contracts.wizard.rateLabel} required>
                  {(id) => <TextField id={id} type="number" value={rate} onChange={(e) => setRate(e.target.value)} />}
                </Field>
                <Field label={t.contracts.wizard.markersLabel}>
                  {() => (
                    <CheckboxCards
                      values={markers}
                      onChange={setMarkers}
                      columns={1}
                      options={markerOptions}
                    />
                  )}
                </Field>
              </FieldGrid>
            </div>
            <div className={styles.mailCard}>
              <h4 className={styles.mailTitle}>
                <Mail size={16} aria-hidden /> {t.contracts.wizard.mail.title}
              </h4>
              <p className={shared.cellMuted}>
                <strong>{t.contracts.wizard.mail.subjectLabel}</strong> {t.contracts.wizard.mail.subject}
              </p>
              <p className={styles.mailBody}>
                {t.contracts.wizard.mail.bodyLead(units.length, freqOptions.find((f) => f.value === freq)?.label ?? '')}
                <strong>{t.contracts.wizard.mail.bodySessions}</strong>
                {t.contracts.wizard.mail.bodyTail}
              </p>
              <Pill tone="info">{t.contracts.wizard.mail.sessionsPill}</Pill>
            </div>
          </div>
        )}
      </Wizard>
    </Modal>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <li className={styles.recapRow}>
      <span className={styles.recapLabel}>{label}</span>
      <span className={styles.recapValue}>{value}</span>
    </li>
  );
}
