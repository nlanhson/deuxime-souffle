import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import {
  Modal,
  Wizard,
  Field,
  TextField,
  TextArea,
  FormSelect,
  CheckboxCards,
  RadioCards,
  FieldGrid,
  Button,
} from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './EstablishmentsScreen.module.css';
import { EST_CATEGORIES, GROUP_SELECT, EST_UNITS, EST_TARIFS } from './data';

interface ExtraContact {
  id: number;
  name: string;
  role: string;
  invite: boolean;
}

export function CreateEstablishmentWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useStrings();
  const w = t.establishments.wizard;
  const STEPS = w.steps;
  const categoryOptions = EST_CATEGORIES.map((o) => ({ value: o.value, label: w.categories[o.value]! }));
  const groupOptions = GROUP_SELECT.map((o) => ({ value: o.value, label: w.groups[o.value]! }));
  const unitOptions = EST_UNITS.map((o) => ({ value: o.value, label: w.units[o.value]! }));
  const tarifOptions = EST_TARIFS.map((o) => ({ value: o.value, label: w.tarifs[o.value]! }));
  const markerOptions = [
    { value: 'cfppa', label: w.markers.cfppa },
    { value: 'bdc', label: w.markers.bdc },
  ];
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('public');
  const [group, setGroup] = useState('none');
  const [units, setUnits] = useState<string[]>(['uc']);
  const [billingSame, setBillingSame] = useState(true);
  const [sessionElsewhere, setSessionElsewhere] = useState(false);
  const [tarif, setTarif] = useState('150');
  const [markers, setMarkers] = useState<string[]>([]);
  const [invite, setInvite] = useState(['invite']);
  const [extra, setExtra] = useState<ExtraContact[]>([]);

  const close = () => {
    onClose();
    setStep(0);
  };

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
        completeLabel={w.complete}
        onCancel={close}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        onComplete={close}
      >
        {step === 0 && (
          <>
            <FieldGrid>
              <Field label={w.f.commercialName} required>
                {(id) => <TextField id={id} placeholder="EHPAD Les Tilleuls" />}
              </Field>
              <Field label={w.f.legalName} required>
                {(id) => <TextField id={id} placeholder="SAS Les Tilleuls" />}
              </Field>
              <Field label={w.f.siret} required>
                {(id) => <TextField id={id} placeholder="812 345 678 00021" />}
              </Field>
              <Field label={w.f.vat}>
                {(id) => <TextField id={id} placeholder="FR 32 812345678" />}
              </Field>
            </FieldGrid>
            <FieldGrid>
              <Field label={w.f.category} required>
                {(id) => <FormSelect id={id} value={category} onChange={(e) => setCategory(e.target.value)} options={categoryOptions} />}
              </Field>
              <Field label={w.f.group}>
                {(id) => <FormSelect id={id} value={group} onChange={(e) => setGroup(e.target.value)} options={groupOptions} />}
              </Field>
            </FieldGrid>
            <Field label={w.f.units}>
              {() => <CheckboxCards options={unitOptions} values={units} onChange={setUnits} columns={2} />}
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label={w.f.mainAddress} required hint={w.f.mainAddressHint}>
              {(id) => <TextField id={id} placeholder="12 rue des Lilas, 69100 Villeurbanne" />}
            </Field>
            <CheckboxCards
              options={[{ value: 'billingSame', label: w.f.billingSame }]}
              values={billingSame ? ['billingSame'] : []}
              onChange={(v) => setBillingSame(v.includes('billingSame'))}
              columns={1}
            />
            {!billingSame && (
              <Field label={w.f.billingAddress}>
                {(id) => <TextField id={id} placeholder={w.f.billingAddressPlaceholder} />}
              </Field>
            )}
            <CheckboxCards
              options={[{ value: 'sessionElsewhere', label: w.f.sessionElsewhere }]}
              values={sessionElsewhere ? ['sessionElsewhere'] : []}
              onChange={(v) => setSessionElsewhere(v.includes('sessionElsewhere'))}
              columns={1}
            />
            {sessionElsewhere && (
              <Field label={w.f.sessionAddress}>
                {(id) => <TextField id={id} placeholder={w.f.sessionAddressPlaceholder} />}
              </Field>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h4 className={styles.wizSub}>{w.f.primaryContactTitle}</h4>
            <FieldGrid>
              <Field label={w.f.firstName} required>
                {(id) => <TextField id={id} />}
              </Field>
              <Field label={w.f.lastName} required>
                {(id) => <TextField id={id} />}
              </Field>
              <Field label={w.f.role}>
                {(id) => <TextField id={id} placeholder={w.f.rolePlaceholder} />}
              </Field>
              <Field label={w.f.email} required>
                {(id) => <TextField id={id} type="email" placeholder="referent@ehpad.fr" />}
              </Field>
            </FieldGrid>
            <Field label={w.f.internalComment}>
              {(id) => <TextArea id={id} placeholder={w.f.internalCommentPlaceholder} />}
            </Field>

            <div className={styles.extraHead}>
              <h4 className={styles.wizSub}>{w.f.extraContactsTitle}</h4>
              <Button
                size="md"
                variant="ghost"
                icon={Plus}
                onClick={() => setExtra((p) => [...p, { id: p.length + 1, name: '', role: '', invite: false }])}
              >
                {w.f.addContact}
              </Button>
            </div>
            {extra.map((c) => (
              <div key={c.id} className={styles.extraRow}>
                <TextField placeholder={w.f.extraNamePlaceholder} aria-label={w.f.extraNameAria} />
                <TextField placeholder={w.f.extraRolePlaceholder} aria-label={w.f.extraRoleAria} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={w.f.removeContact}
                  onClick={() => setExtra((p) => p.filter((x) => x.id !== c.id))}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </div>
            ))}
          </>
        )}

        {step === 3 && (
          <div className={styles.recap}>
            <div>
              <FieldGrid>
                <Field label={w.f.defaultTarif}>
                  {(id) => <FormSelect id={id} value={tarif} onChange={(e) => setTarif(e.target.value)} options={tarifOptions} />}
                </Field>
                <Field label={w.f.defaultMarkers}>
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
              <Field label={w.f.invitation}>
                {() => (
                  <RadioCards
                    name="invite"
                    value={invite[0] ?? 'invite'}
                    onChange={(v) => setInvite([v])}
                    options={[
                      { value: 'invite', label: w.invite.send.label, desc: w.invite.send.desc },
                      { value: 'later', label: w.invite.later.label, desc: w.invite.later.desc },
                    ]}
                  />
                )}
              </Field>
            </div>
            <div className={styles.recapCard}>
              <h4 className={styles.recapCardTitle}>{w.recap.title}</h4>
              <p className={shared.cellMuted}>
                {w.categories[category]} · {w.groups[group]}
              </p>
              <p className={shared.cellMuted}>{w.recap.unitsTarif(units.length, tarif)}</p>
              <p className={shared.cellMuted}>
                {markers.length ? markers.map((m) => m.toUpperCase()).join(' · ') : w.recap.noMarker}
              </p>
            </div>
          </div>
        )}
      </Wizard>
    </Modal>
  );
}
