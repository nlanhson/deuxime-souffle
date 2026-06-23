import { Fragment, useState } from 'react';
import { Check, Clock, Eye, Info, Plus, RefreshCw, X } from 'lucide-react';
import {
  Modal,
  Wizard,
  Field,
  TextField,
  FormSelect,
  CheckboxCards,
  FieldGrid,
  Pill,
  Avatar,
} from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './CoachesScreen.module.css';
import {
  CIVILITY_VALUES,
  LEGAL_STATUS_VALUES,
  ZONES,
  KYC_DOCS,
  SPECIALTY_VALUES,
  TARIF_PRESETS,
  AVAIL_DAYS,
  AVAIL_SLOT_KEYS,
  DEFAULT_AVAIL,
} from './data';

export function CreateCoachWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useStrings();
  const w = t.coaches.wizard;
  const STEPS = [w.steps.identity, w.steps.kyc, w.steps.zone, w.steps.tarif];
  const civilityOptions = CIVILITY_VALUES.map((value) => ({ value, label: w.civilities[value] }));
  const legalStatusOptions = LEGAL_STATUS_VALUES.map((value) => ({ value, label: w.legalStatus[value] }));
  const specialtyOptions = SPECIALTY_VALUES.map((value) => ({ value, label: w.specialties[value] }));
  const availSlots = AVAIL_SLOT_KEYS.map((key) => ({ key, label: w.availSlots[key] }));
  const [step, setStep] = useState(0);
  // Identity
  const [civility, setCivility] = useState('mme');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [siret, setSiret] = useState('');
  const [legal, setLegal] = useState('ae');
  // Zone & availability (transport + max travel time intentionally dropped)
  const [zones, setZones] = useState<string[]>(['75 Paris', '92 Hauts-de-Seine', '94 Val-de-Marne']);
  const [avail, setAvail] = useState<Record<string, boolean>>(DEFAULT_AVAIL);
  // Tariff & invitation
  const [tarif, setTarif] = useState('40');
  const [goal, setGoal] = useState('15');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [invite, setInvite] = useState(true);

  const close = () => {
    onClose();
    setStep(0);
  };

  const fullName = `${firstName} ${lastName}`.trim() || w.recap.newCoach;
  const legalLabel = legalStatusOptions.find((l) => l.value === legal)?.label ?? '';
  const zonesShort = zones.map((z) => z.split(' ')[0]).join(', ');
  const ca = Math.round((Number(tarif) || 0) * (Number(goal) || 0));
  const isPreset = ['35', '40', '50'].includes(tarif);
  const completeLabel = w.completeLabel(firstName.trim() || w.theCoach);

  return (
    <Modal
      open={open}
      onClose={close}
      size="wide"
      title={w.title}
      subtitle={w.subtitle}
    >
      <Wizard
        steps={STEPS}
        current={step}
        completeLabel={completeLabel}
        onCancel={close}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        onComplete={close}
      >
        {/* ===== Step 1 — Identity ===== */}
        {step === 0 && (
          <>
            <FieldGrid>
              <Field label={w.identity.civility}>
                {(id) => <FormSelect id={id} value={civility} onChange={(e) => setCivility(e.target.value)} options={civilityOptions} />}
              </Field>
              <Field label={w.identity.dob}>
                {(id) => <TextField id={id} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />}
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label={w.identity.firstName} required>
                {(id) => <TextField id={id} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marie" />}
              </Field>
              <Field label={w.identity.lastName} required>
                {(id) => <TextField id={id} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dubois" />}
              </Field>
              <Field label={w.identity.email} required>
                {(id) => <TextField id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marie.dubois@coach.fr" />}
              </Field>
              <Field label={w.identity.phone} required>
                {(id) => <TextField id={id} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" />}
              </Field>
            </FieldGrid>
            <Field label={w.identity.address} required hint={w.identity.addressHint}>
              {(id) => <TextField id={id} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 rue Vaugirard, 75015 Paris" />}
            </Field>
            <FieldGrid>
              <Field label={w.identity.siret} required>
                {(id) => <TextField id={id} value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="123 456 789 00012" />}
              </Field>
              <Field label={w.identity.legal}>
                {(id) => <FormSelect id={id} value={legal} onChange={(e) => setLegal(e.target.value)} options={legalStatusOptions} />}
              </Field>
            </FieldGrid>
            <div className={styles.note} data-tone="info">
              <Info size={16} className={styles.noteIcon} aria-hidden />
              <span>
                <strong className={styles.noteStrong}>{w.identity.noteStrong}</strong> {w.identity.noteBody}
              </span>
            </div>
          </>
        )}

        {/* ===== Step 2 — KYC documents ===== */}
        {step === 1 && (
          <>
            <p className={styles.kycIntro}>{w.kyc.intro}</p>
            <ul className={styles.kycList}>
              {KYC_DOCS.map((d) => {
                const copy = w.kycDocs[d.value as keyof typeof w.kycDocs];
                return (
                  <li key={d.value} className={styles.kycItem} data-state={d.status}>
                    <span className={styles.kycMain}>
                      <span className={styles.kycName}>{copy.label}</span>
                      <span className={styles.kycDesc}>{copy.desc}</span>
                    </span>
                    <span className={styles.kycMeta}>
                      <Pill tone={d.mandatory ? 'warning' : 'neutral'}>
                        {d.mandatory ? (d.renew6m ? w.kyc.mandatory6m : w.kyc.mandatory) : w.kyc.optional}
                      </Pill>
                      <span className={styles.kycStatus} data-state={d.status}>
                        {d.status === 'received' && <Check size={14} aria-hidden />}
                        {d.status === 'waiting' && <Clock size={14} aria-hidden />}
                        {w.kyc.docStatus[d.status]}
                      </span>
                      <button type="button" className={styles.kycAction}>
                        {d.status === 'received' ? (
                          <>
                            <Eye size={15} aria-hidden /> {w.kyc.view}
                          </>
                        ) : (
                          <>
                            <Plus size={15} aria-hidden /> {w.kyc.upload}
                          </>
                        )}
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className={styles.note} data-tone="warn">
              <RefreshCw size={16} className={styles.noteIcon} aria-hidden />
              <span>
                <strong className={styles.noteStrong}>{w.kyc.noteStrong}</strong> {w.kyc.noteBody}
              </span>
            </div>
          </>
        )}

        {/* ===== Step 3 — Zone & availability (transport + travel time removed) ===== */}
        {step === 2 && (
          <>
            <Field label={w.zone.zonesLabel} hint={w.zone.zonesHint}>
              {() => (
                <CheckboxCards
                  values={zones}
                  onChange={setZones}
                  columns={2}
                  options={ZONES.map((z) => ({ value: z, label: z }))}
                />
              )}
            </Field>
            <Field label={w.zone.availLabel} hint={w.zone.availHint}>
              {() => (
                <div className={styles.availCard}>
                  <div className={styles.availGrid}>
                    <span aria-hidden />
                    {AVAIL_DAYS.map((d) => (
                      <span key={d} className={styles.availHeadCell}>
                        {d}
                      </span>
                    ))}
                    {availSlots.map((slot) => (
                      <Fragment key={slot.key}>
                        <span className={styles.availRowLabel}>{slot.label}</span>
                        {AVAIL_DAYS.map((day, i) => {
                          const k = `${slot.key}-${i}`;
                          const on = !!avail[k];
                          return (
                            <button
                              key={k}
                              type="button"
                              className={styles.availCell}
                              data-on={on}
                              aria-pressed={on}
                              aria-label={w.zone.cellAria(slot.label, day, on)}
                              onClick={() => setAvail((a) => ({ ...a, [k]: !a[k] }))}
                            >
                              {on ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}
                            </button>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              )}
            </Field>
          </>
        )}

        {/* ===== Step 4 — Tariff & invitation ===== */}
        {step === 3 && (
          <div className={styles.recap}>
            <div className={styles.stepCol}>
              <Field label={w.tarif.rateLabel} hint={w.tarif.rateHint}>
                {(id) => (
                  <>
                    <div className={styles.rateRow}>
                      <div className={styles.rateInputWrap}>
                        <TextField id={id} type="number" min={0} value={tarif} onChange={(e) => setTarif(e.target.value)} />
                      </div>
                      <span className={styles.rateSuffix}>{w.tarif.rateSuffix}</span>
                    </div>
                    <div className={styles.presets}>
                      {TARIF_PRESETS.map((p) => {
                        const preset = w.tarifPresets[p.value as keyof typeof w.tarifPresets];
                        const selected = p.value === 'perso' ? !isPreset : p.value === tarif;
                        return (
                          <button
                            key={p.value}
                            type="button"
                            className={styles.preset}
                            data-selected={selected}
                            onClick={() => setTarif(p.value === 'perso' ? '' : p.value)}
                          >
                            {preset.label}
                            {preset.note ? <span className={styles.presetSub}>· {preset.note}</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </Field>

              <Field label={w.tarif.goalLabel} hint={w.tarif.goalHint}>
                {(id) => (
                  <div className={styles.targetRow}>
                    <div className={styles.rateInputWrap}>
                      <TextField id={id} type="number" min={0} value={goal} onChange={(e) => setGoal(e.target.value)} />
                    </div>
                    <span className={styles.targetHint}>{w.tarif.goalSuffix}</span>
                    <span className={styles.targetCA}>{w.tarif.caEstimate(ca)}</span>
                  </div>
                )}
              </Field>

              <Field label={w.tarif.specialtiesLabel} hint={w.tarif.specialtiesHint}>
                {() => <CheckboxCards options={specialtyOptions} values={specialties} onChange={setSpecialties} columns={2} />}
              </Field>

              <div className={styles.inviteBlock}>
                <span className={styles.blockLabel}>{w.tarif.inviteBlock}</span>
                <div className={styles.checkRow}>
                  <input
                    id="invite-coach"
                    type="checkbox"
                    className={styles.checkbox}
                    checked={invite}
                    onChange={(e) => setInvite(e.target.checked)}
                  />
                  <label htmlFor="invite-coach" className={styles.checkText}>
                    <span className={styles.checkLabel}>{w.tarif.inviteLabel}</span>
                    <span className={styles.checkHint}>{w.tarif.inviteHint}</span>
                  </label>
                </div>
              </div>
            </div>

            <aside className={styles.recapCard}>
              <div className={styles.recapHead}>
                <Avatar firstName={firstName || w.recap.avatarFirst} lastName={lastName || w.recap.avatarLast} size="md" decorative />
                <span className={shared.cellStack}>
                  <span className={styles.recapName}>{fullName}</span>
                  <span className={styles.recapRole}>{legalLabel}</span>
                </span>
              </div>
              <div className={styles.recapRows}>
                <div className={styles.recapRow}>
                  <span className={styles.recapKey}>{w.recap.email}</span>
                  <span className={styles.recapVal}>{email || '—'}</span>
                </div>
                <div className={styles.recapRow}>
                  <span className={styles.recapKey}>{w.recap.phone}</span>
                  <span className={styles.recapVal}>{phone || '—'}</span>
                </div>
                <div className={styles.recapRow}>
                  <span className={styles.recapKey}>{w.recap.zones}</span>
                  <span className={styles.recapVal}>{zonesShort || '—'}</span>
                </div>
                <div className={styles.recapDivider} />
                <div className={`${styles.recapRow} ${styles.recapRowStrong}`}>
                  <span className={styles.recapKey}>{w.recap.rate}</span>
                  <span className={styles.recapVal}>{tarif || '—'} € HT</span>
                </div>
                <div className={`${styles.recapRow} ${styles.recapRowStrong}`}>
                  <span className={styles.recapKey}>{w.recap.goal}</span>
                  <span className={styles.recapVal}>{w.recap.goalValue(goal || '—')}</span>
                </div>
              </div>
              <p className={styles.recapNote}>{w.recap.note(firstName.trim() || w.recap.theCoachCap)}</p>
            </aside>
          </div>
        )}
      </Wizard>
    </Modal>
  );
}
