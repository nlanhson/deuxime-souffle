import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks/useAsync';
import { unitLabel, ALL_UNIT_TYPES } from '@/lib/status';
import {
  Button,
  ButtonLink,
  CardSection,
  Checkbox,
  InlineAlert,
  LoadError,
  MultiSelect,
  PageHeader,
  Select,
  Skeleton,
  SkeletonGroup,
  TextField,
  TimePicker,
} from '@/components';
import type { Address, Facility, StandardSession, UnitType } from '@/types/models';
import styles from './facility.module.css';

let standardSeq = 0;

interface AddressFieldsProps {
  legend: string;
  value: Address;
  onChange: (address: Address) => void;
  errors?: Record<string, string | null> | undefined;
}

function AddressFields({ legend, value, onChange, errors }: AddressFieldsProps) {
  const fr = useStrings();
  return (
    <div>
      <p className={styles.fieldLabel} style={{ marginBottom: 'var(--space-sm)' }}>
        {legend}
      </p>
      <div className={styles.formGrid}>
        <TextField
          label={fr.facility.edit.addLine1}
          value={value.line1}
          onChange={(line1) => onChange({ ...value, line1 })}
          error={errors?.line1 ?? null}
          required
        />
        <TextField
          label={fr.facility.edit.addPostal}
          value={value.postalCode}
          onChange={(postalCode) => onChange({ ...value, postalCode })}
          error={errors?.postalCode ?? null}
          required
        />
        <TextField
          label={fr.facility.edit.addCity}
          value={value.city}
          onChange={(city) => onChange({ ...value, city })}
          error={errors?.city ?? null}
          required
        />
      </div>
    </div>
  );
}

/** AUTH-11 — modifier l'établissement (Admin uniquement). Le champ « Groupe »
 *  reste en lecture seule : le rattachement est géré par l'équipe DS (EST-09). */
export default function FacilityEditScreen() {
  const fr = useStrings();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const state = useAsync(() => api.getFacility(), []);
  const facility = state.data ?? null;

  const [form, setForm] = useState<Facility | null>(null);
  const [sessionDifferent, setSessionDifferent] = useState(false);
  const [markersText, setMarkersText] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (facility && !form) {
      setForm(structuredClone(facility));
      setSessionDifferent(Boolean(facility.addresses.sessionLocation));
      setMarkersText(facility.markers.join(', '));
    }
  }, [facility, form]);

  if (!isAdmin) {
    return (
      <>
        <PageHeader
          title={fr.facility.edit.title}
          crumbs={[{ label: fr.facility.title, to: '/etablissement' }, { label: fr.facility.edit.title }]}
        />
        <InlineAlert variant="info" title={fr.common.adminOnlyAlert}>
          {fr.common.adminOnlyBody}
        </InlineAlert>
        <div>
          <ButtonLink to="/etablissement">{fr.common.back}</ButtonLink>
        </div>
      </>
    );
  }

  if (state.loading || !form) {
    if (state.error) {
      return (
        <>
          <PageHeader title={fr.facility.edit.title} crumbs={[{ label: fr.facility.title, to: '/etablissement' }]} />
          <LoadError onRetry={state.retry} />
        </>
      );
    }
    return (
      <>
        <PageHeader title={fr.facility.edit.title} crumbs={[{ label: fr.facility.title, to: '/etablissement' }]} />
        <SkeletonGroup>
          <Skeleton height={420} radius="var(--radius-xl)" />
        </SkeletonGroup>
      </>
    );
  }

  const setField = <K extends keyof Facility>(key: K, value: Facility[K]) =>
    setForm((current) => (current ? { ...current, [key]: value } : current));

  const updateStandard = (id: string, patch: Partial<StandardSession>) => {
    setForm((current) =>
      current
        ? {
            ...current,
            standardSessions: current.standardSessions.map((s) =>
              s.id === id ? { ...s, ...patch } : s,
            ),
          }
        : current,
    );
  };

  const submit = async () => {
    if (!facility) return;
    const nextErrors: Record<string, string | null> = {
      tradeName: form.tradeName.trim() ? null : fr.common.requiredField,
      companyName: form.companyName.trim() ? null : fr.common.requiredField,
      siret: form.siret.trim() ? null : fr.common.requiredField,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some((e) => e !== null)) return;

    const markers = markersText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const addresses = {
      main: form.addresses.main,
      billing: form.addresses.billing,
      ...(sessionDifferent && form.addresses.sessionLocation
        ? { sessionLocation: form.addresses.sessionLocation }
        : {}),
    };
    const patch = {
      tradeName: form.tradeName.trim(),
      companyName: form.companyName.trim(),
      siret: form.siret.trim(),
      vatNumber: form.vatNumber.trim(),
      category: form.category.trim(),
      units: form.units,
      addresses,
      defaultSessionRate: form.defaultSessionRate,
      markers,
      standardSessions: form.standardSessions,
    };

    const unchanged =
      JSON.stringify(patch) ===
      JSON.stringify({
        tradeName: facility.tradeName,
        companyName: facility.companyName,
        siret: facility.siret,
        vatNumber: facility.vatNumber,
        category: facility.category,
        units: facility.units,
        addresses: facility.addresses,
        defaultSessionRate: facility.defaultSessionRate,
        markers: facility.markers,
        standardSessions: facility.standardSessions,
      });
    if (unchanged) {
      showToast({ message: fr.common.noChange, kind: 'neutral' });
      return;
    }

    setBusy(true);
    setFailed(false);
    try {
      await api.updateFacility(
        patch,
        user ? `${user.firstName} ${user.lastName}` : '',
        fr.facility.edit.title,
      );
      showToast({ message: fr.facility.edit.saved });
      navigate('/etablissement');
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  const emptyAddress: Address = { line1: '', postalCode: '', city: '' };

  return (
    <>
      <PageHeader
        title={fr.facility.edit.title}
        crumbs={[{ label: fr.facility.title, to: '/etablissement' }, { label: fr.facility.edit.title }]}
      />
      {failed && <InlineAlert variant="danger" title={fr.common.genericError} />}

      <div className={styles.formStack}>
        <CardSection title={fr.facility.general}>
          <div className={styles.formGrid}>
            <TextField
              label={fr.facility.tradeName}
              value={form.tradeName}
              onChange={(v) => setField('tradeName', v)}
              error={errors.tradeName ?? null}
              required
            />
            <TextField
              label={fr.facility.companyName}
              value={form.companyName}
              onChange={(v) => setField('companyName', v)}
              error={errors.companyName ?? null}
              required
            />
            <TextField
              label={fr.facility.siret}
              value={form.siret}
              onChange={(v) => setField('siret', v)}
              error={errors.siret ?? null}
              required
            />
            <TextField label={fr.facility.vat} value={form.vatNumber} onChange={(v) => setField('vatNumber', v)} />
            <TextField label={fr.facility.category} value={form.category} onChange={(v) => setField('category', v)} />
            <TextField
              label={fr.facility.group}
              value={form.group?.name ?? fr.facility.groupNone}
              onChange={() => undefined}
              readOnly
              helper={fr.facility.groupHelp}
            />
          </div>
          <div style={{ marginTop: 'var(--space-md)', maxWidth: 420 }}>
            <MultiSelect
              label={fr.facility.unitsLabel}
              values={form.units}
              onChange={(units) => setField('units', units as UnitType[])}
              options={ALL_UNIT_TYPES.map((unit) => ({ value: unit, label: unitLabel(unit) }))}
            />
          </div>
        </CardSection>

        <CardSection title={fr.facility.addresses}>
          <div className={styles.formStack}>
            <AddressFields
              legend={fr.facility.mainAddress}
              value={form.addresses.main}
              onChange={(main) => setField('addresses', { ...form.addresses, main })}
            />
            <AddressFields
              legend={fr.facility.billingAddress}
              value={form.addresses.billing}
              onChange={(billing) => setField('addresses', { ...form.addresses, billing })}
            />
            <Checkbox
              label={fr.facility.edit.sessionDifferent}
              checked={sessionDifferent}
              onChange={(checked) => {
                setSessionDifferent(checked);
                if (checked && !form.addresses.sessionLocation) {
                  setField('addresses', { ...form.addresses, sessionLocation: emptyAddress });
                }
              }}
            />
            {sessionDifferent && (
              <AddressFields
                legend={fr.facility.sessionAddress}
                value={form.addresses.sessionLocation ?? emptyAddress}
                onChange={(sessionLocation) => setField('addresses', { ...form.addresses, sessionLocation })}
              />
            )}
          </div>
        </CardSection>

        <CardSection title={fr.facility.standardSessions}>
          <div className={styles.formStack}>
            {form.standardSessions.map((session) => (
              <div key={session.id} className={styles.standardRow}>
                <TextField
                  label={fr.facility.edit.labelLabel}
                  value={session.label}
                  onChange={(label) => updateStandard(session.id, { label })}
                />
                <Select
                  label={fr.facility.edit.dayLabel}
                  value={String(session.weekday)}
                  onChange={(weekday) => updateStandard(session.id, { weekday: Number(weekday) })}
                  options={fr.weekdays.map((day, index) => ({ value: String(index), label: day }))}
                />
                <TimePicker
                  label={fr.facility.edit.timeLabel}
                  value={session.time}
                  onChange={(time) => updateStandard(session.id, { time })}
                />
                <TextField
                  label={fr.facility.edit.durationLabel}
                  type="number"
                  inputMode="numeric"
                  value={String(session.durationMin)}
                  onChange={(value) => updateStandard(session.id, { durationMin: Number(value) || 0 })}
                />
                <Select
                  label={fr.facility.edit.unitLabel}
                  value={session.unitType}
                  onChange={(unit) => updateStandard(session.id, { unitType: unit as UnitType })}
                  options={ALL_UNIT_TYPES.map((unit) => ({ value: unit, label: unitLabel(unit) }))}
                />
                <Button
                  size="md"
                  variant="ghost"
                  icon={Trash2}
                  onClick={() =>
                    setField(
                      'standardSessions',
                      form.standardSessions.filter((s) => s.id !== session.id),
                    )
                  }
                >
                  {fr.facility.edit.removeStandard}
                </Button>
              </div>
            ))}
            <div>
              <Button
                size="md"
                icon={Plus}
                onClick={() =>
                  setField('standardSessions', [
                    ...form.standardSessions,
                    {
                      id: `ss-nouvelle-${(standardSeq += 1)}`,
                      label: '',
                      weekday: 0,
                      time: '10:00',
                      durationMin: 60,
                      unitType: form.units[0] ?? 'UC',
                    },
                  ])
                }
              >
                {fr.facility.edit.addStandard}
              </Button>
            </div>
          </div>
        </CardSection>

        <CardSection title={fr.facility.pricing}>
          <div className={styles.formGrid}>
            <TextField
              label={fr.facility.edit.rateLabel}
              type="number"
              inputMode="numeric"
              value={String(form.defaultSessionRate)}
              onChange={(value) => setField('defaultSessionRate', Number(value) || 0)}
            />
            <TextField
              label={fr.facility.edit.markersLabel}
              value={markersText}
              onChange={setMarkersText}
            />
          </div>
        </CardSection>

        <div className={styles.formActions}>
          <ButtonLink to="/etablissement" variant="ghost">
            {fr.common.cancel}
          </ButtonLink>
          <Button variant="primary" onClick={() => void submit()} loading={busy}>
            {fr.common.save}
          </Button>
        </div>
      </div>
    </>
  );
}
