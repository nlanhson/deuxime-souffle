import { useState } from 'react';
import { Mail, MessageSquare, Bell, Save, Pencil, UserPlus } from 'lucide-react';
import { PageHeader, CardSection, Button, Pill, Table } from '@/components';
import type { Column } from '@/components';
import { useStrings } from '@/i18n';
import shared from '../screen.module.css';
import styles from './SettingsScreen.module.css';

interface Weight {
  key: string;
  label: string;
  value: number;
}

type Channel = 'email' | 'sms' | 'push';
interface NotifTemplate {
  id: string;
  name: string;
  channel: Channel;
  audience: string;
  active: boolean;
}

const NOTIF_TEMPLATES: Omit<NotifTemplate, 'name' | 'audience'>[] = [
  { id: 'n1', channel: 'push', active: true },
  { id: 'n2', channel: 'push', active: true },
  { id: 'n3', channel: 'sms', active: true },
  { id: 'n4', channel: 'email', active: true },
  { id: 'n5', channel: 'email', active: true },
  { id: 'n6', channel: 'email', active: false },
];

const CHANNEL_ICON: Record<Channel, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
};

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'guest';
  lastLogin: string;
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  { id: 'a1', name: 'Camille Roussel', email: 'camille.roussel@deuxiemesouffle.fr', role: 'admin', lastLogin: 'il y a 5 min' },
  { id: 'a2', name: 'Loïc Pinto', email: 'loic.pinto@deuxiemesouffle.fr', role: 'admin', lastLogin: 'hier' },
  { id: 'a3', name: 'Manon Girard', email: 'manon.girard@deuxiemesouffle.fr', role: 'guest', lastLogin: 'il y a 3 j' },
];

export function SettingsScreen() {
  const t = useStrings();

  const SCORE_DEFAULT: Weight[] = [
    { key: 'auto', label: t.settings.scoreWeights.auto, value: 35 },
    { key: 'fiabilite', label: t.settings.scoreWeights.reliability, value: 30 },
    { key: 'proximite', label: t.settings.scoreWeights.proximity, value: 20 },
    { key: 'equite', label: t.settings.scoreWeights.equity, value: 15 },
  ];

  const TRUST_DEFAULT: Weight[] = [
    { key: 'rating', label: t.settings.trustWeights.rating, value: 40 },
    { key: 'reliability', label: t.settings.trustWeights.reliability, value: 30 },
    { key: 'responsiveness', label: t.settings.trustWeights.responsiveness, value: 20 },
    { key: 'tenure', label: t.settings.trustWeights.tenure, value: 10 },
  ];

  const NOTIF_NAMES: Record<string, { name: string; audience: string }> = {
    n1: { name: t.settings.templates.items.n1.name, audience: t.settings.templates.items.n1.audience },
    n2: { name: t.settings.templates.items.n2.name, audience: t.settings.templates.items.n2.audience },
    n3: { name: t.settings.templates.items.n3.name, audience: t.settings.templates.items.n3.audience },
    n4: { name: t.settings.templates.items.n4.name, audience: t.settings.templates.items.n4.audience },
    n5: { name: t.settings.templates.items.n5.name, audience: t.settings.templates.items.n5.audience },
    n6: { name: t.settings.templates.items.n6.name, audience: t.settings.templates.items.n6.audience },
  };

  const CHANNEL_LABEL: Record<Channel, string> = {
    email: t.settings.channels.email,
    sms: t.settings.channels.sms,
    push: t.settings.channels.push,
  };

  const ROLE_LABEL: Record<AdminAccount['role'], string> = {
    admin: t.settings.accounts.roleAdmin,
    guest: t.settings.accounts.roleGuest,
  };

  const PENALTIES = [
    { key: 'noShow', label: t.settings.penalties.noShow, value: '6' },
    { key: 'lateCancel', label: t.settings.penalties.lateCancel, value: '2' },
    { key: 'refusal', label: t.settings.penalties.refusal, value: '2' },
    { key: 'staleAvail', label: t.settings.penalties.staleAvail, value: '5' },
  ];

  const [score, setScore] = useState(SCORE_DEFAULT);
  const [trust, setTrust] = useState(TRUST_DEFAULT);
  const [autoMode, setAutoMode] = useState(false);
  const [templates, setTemplates] = useState(
    NOTIF_TEMPLATES.map((t) => ({ ...t })),
  );

  const scoreTotal = score.reduce((s, w) => s + w.value, 0);
  const trustTotal = trust.reduce((s, w) => s + w.value, 0);

  const accountCols: Column<AdminAccount>[] = [
    { key: 'name', header: t.settings.accounts.colMember, render: (a) => <span className={shared.cellStrong}>{a.name}</span> },
    { key: 'email', header: t.settings.accounts.colEmail, secondary: true, render: (a) => a.email },
    {
      key: 'role',
      header: t.settings.accounts.colRole,
      render: (a) => <Pill tone={a.role === 'admin' ? 'info' : 'neutral'}>{ROLE_LABEL[a.role]}</Pill>,
    },
    { key: 'last', header: t.settings.accounts.colLastLogin, align: 'end', secondary: true, render: (a) => a.lastLogin },
  ];

  return (
    <div className={shared.stack}>
      <PageHeader
        title={t.settings.title}
        subtitle={t.settings.subtitle}
        actions={<Button icon={Save}>{t.settings.save}</Button>}
      />

      <CardSection
        title={t.settings.autoMode.title}
        actions={<Pill tone={autoMode ? 'progress' : 'neutral'}>{autoMode ? t.settings.autoMode.on : t.settings.autoMode.off}</Pill>}
      >
        <div className={styles.autoRow}>
          <div className={styles.autoText}>
            <p className={styles.note}>{t.settings.autoMode.note}</p>
            <p className={shared.cellMuted}>{t.settings.autoMode.stats}</p>
          </div>
          <button
            type="button"
            className={styles.toggle}
            role="switch"
            aria-checked={autoMode}
            aria-label={t.settings.autoMode.toggleAria}
            data-on={autoMode || undefined}
            onClick={() => setAutoMode((v) => !v)}
          >
            <span className={styles.knob} />
          </button>
        </div>
        <div className={styles.rules}>
          <RuleField label={t.settings.autoMode.thresholdLabel} suffix={t.settings.units.pts} defaultValue="5" />
        </div>
      </CardSection>

      <CardSection
        title={t.settings.scoreWeights.title}
        actions={
          <Pill tone={scoreTotal === 100 ? 'progress' : 'warning'}>{t.settings.total(scoreTotal)}</Pill>
        }
      >
        <p className={styles.note}>{t.settings.scoreWeights.note}</p>
        <div className={styles.sliders}>
          {score.map((w, idx) => (
            <WeightSlider
              key={w.key}
              weight={w}
              onChange={(value) =>
                setScore((prev) => prev.map((x, i) => (i === idx ? { ...x, value } : x)))
              }
            />
          ))}
        </div>
      </CardSection>

      <CardSection title={t.settings.businessRules.title}>
        <div className={styles.rules}>
          <RuleField label={t.settings.businessRules.checkInWindow} suffix={t.settings.units.minBeforeAfter} defaultValue="15" />
          <RuleField label={t.settings.businessRules.geoRadius} suffix={t.settings.units.km} defaultValue="25" />
          <SelectField
            label={t.settings.businessRules.lateNotifyThreshold}
            options={['5 min', '10 min', '30 min']}
            defaultValue="10 min"
          />
          <SelectField
            label={t.settings.businessRules.lateCancelThreshold}
            options={['30 min', '45 min', '60 min']}
            defaultValue="30 min"
          />
          <RuleField label={t.settings.businessRules.cancelNotice} suffix={t.settings.units.h} defaultValue="48" />
          <SelectField
            label={t.settings.businessRules.invoiceGeneration}
            options={[
              t.settings.businessRules.invoiceOptions.day1,
              t.settings.businessRules.invoiceOptions.day5,
              t.settings.businessRules.invoiceOptions.manual,
            ]}
            defaultValue={t.settings.businessRules.invoiceOptions.day1}
          />
        </div>
      </CardSection>

      <CardSection title={t.settings.penalties.title} actions={<Pill tone="neutral">{t.settings.penalties.cap}</Pill>}>
        <p className={styles.note}>{t.settings.penalties.note}</p>
        <div className={styles.rules}>
          {PENALTIES.map((p) => (
            <RuleField key={p.key} label={p.label} suffix={t.settings.units.ptsRemoved} defaultValue={p.value} />
          ))}
        </div>
      </CardSection>

      <CardSection
        title={t.settings.trustWeights.title}
        actions={
          <Pill tone={trustTotal === 100 ? 'progress' : 'warning'}>{t.settings.total(trustTotal)}</Pill>
        }
      >
        <p className={styles.note}>{t.settings.trustWeights.note}</p>
        <div className={styles.sliders}>
          {trust.map((w, idx) => (
            <WeightSlider
              key={w.key}
              weight={w}
              onChange={(value) =>
                setTrust((prev) => prev.map((x, i) => (i === idx ? { ...x, value } : x)))
              }
            />
          ))}
        </div>
      </CardSection>

      <CardSection title={t.settings.templates.title}>
        <ul className={styles.templates}>
          {templates.map((tpl, idx) => {
            const Icon = CHANNEL_ICON[tpl.channel];
            const meta = NOTIF_NAMES[tpl.id]!;
            return (
              <li key={tpl.id} className={styles.template}>
                <span className={styles.templateChannel}>
                  <Icon size={16} aria-hidden />
                </span>
                <span className={shared.cellStack}>
                  <span className={shared.cellStrong}>{meta.name}</span>
                  <span className={shared.cellMuted}>
                    {CHANNEL_LABEL[tpl.channel]} · {meta.audience}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles.toggle}
                  role="switch"
                  aria-checked={tpl.active}
                  aria-label={t.settings.templates.toggleAria(meta.name)}
                  data-on={tpl.active || undefined}
                  onClick={() =>
                    setTemplates((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, active: !x.active } : x)),
                    )
                  }
                >
                  <span className={styles.knob} />
                </button>
                <Button variant="ghost" icon={Pencil} size="md">
                  {t.settings.templates.edit}
                </Button>
              </li>
            );
          })}
        </ul>
      </CardSection>

      <CardSection
        title={t.settings.accounts.title}
        actions={
          <Button variant="secondary" icon={UserPlus} size="md">
            {t.settings.accounts.invite}
          </Button>
        }
      >
        <p className={styles.note}>{t.settings.accounts.note}</p>
        <Table columns={accountCols} rows={ADMIN_ACCOUNTS} getRowKey={(a) => a.id} ariaLabel={t.settings.accounts.title} />
      </CardSection>
    </div>
  );
}

function WeightSlider({ weight, onChange }: { weight: Weight; onChange: (value: number) => void }) {
  return (
    <div className={styles.slider}>
      <div className={styles.sliderHead}>
        <label htmlFor={`w-${weight.key}`} className={styles.sliderLabel}>
          {weight.label}
        </label>
        <span className={styles.sliderValue}>{weight.value} %</span>
      </div>
      <input
        id={`w-${weight.key}`}
        type="range"
        min={0}
        max={100}
        step={5}
        value={weight.value}
        className={styles.range}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function RuleField({
  label,
  suffix,
  defaultValue,
}: {
  label: string;
  suffix: string;
  defaultValue: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.inputWrap}>
        <input type="number" defaultValue={defaultValue} className={styles.input} />
        <span className={styles.suffix}>{suffix}</span>
      </span>
    </label>
  );
}

function SelectField({
  label,
  options,
  defaultValue,
}: {
  label: string;
  options: string[];
  defaultValue: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <select defaultValue={defaultValue} className={styles.select}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
