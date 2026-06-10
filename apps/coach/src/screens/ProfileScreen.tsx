/**
 * Coach · Profile (C06) — the coach's personal space.
 *
 * Opened from the header avatar (locked IA: Profil lives top-right, NOT in the bottom nav),
 * so — like the Notification center — it is presented as an iOS pageSheet modal (slides up,
 * swipe-to-dismiss) rather than a tab/route. It is the HUB that gathers everything that isn't
 * a day-to-day task:
 *   · identity + account status (WBS E01 — Active / Pending / Rejected)
 *   · Availability & travel preferences (PLA-08 / S18) — the section the matching algorithm
 *     (E05) depends on; the IA decision moved C15 under Profil, with a staleness nudge here
 *     (and, separately, on Home) when it goes old.
 *   · Goals & rate — desired monthly volume + flexibility, default hourly rate
 *   · My documents — CV, URSSAF certificate, insurance, APA diploma (account-validation set)
 *   · Account — personal info, Google Calendar sync (OAuth2), change password
 *   · Support — help, contact us, app version
 *   · Log out (E01: 30-day session, manual logout)
 *
 * EVERY row is functional: profile data lives in component state, so edits reflect live. Quick
 * choices/confirms use the shared BottomSheet (OptionSheet / ActionModal); multi-field edits use
 * the keyboard-safe FieldEditSheet. Editing or confirming availability resets the staleness clock
 * (the matching-freshness loop). Photo pick + document upload are mocked — no native picker is
 * wired in the prototype (real code adds expo-image-picker / a document picker + the backend).
 *
 * Scope discipline: gamification stays OUT (PRD defers it). Field lists trace to the brief; the
 * LAYOUT is a reasoned synthesis pending the coach video + approved Figma. UI text comes from
 * ../copy (the localization seam).
 *
 * Surface = coach. Scheme-robust like Séances/Disponibles: reads the scheme off the token and
 * uses only tokens valid in both variants + the palette. Content cards are the dark "ink
 * component"; text inside them is light.
 */
import React from 'react';
import { Modal, View, Text, Image, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, ChevronRight, CalendarClock, Clock, Car, Footprints, MapPin, Map, CalendarX, Target, Wallet,
  FileText, ScrollText, ShieldCheck, GraduationCap, User, CalendarCheck, KeyRound,
  CircleHelp, Mail, CheckCircle2, LogOut, Camera, Edit3, type LucideIcon,
} from '../icons';

import { palette, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { ActionModal } from '../components/ActionModal';
import { OptionSheet, type SheetOption } from '../components/OptionSheet';
import { FieldEditSheet, type EditField, type EditChoice } from '../components/FieldEditSheet';
import { MultiSelectSheet } from '../components/MultiSelectSheet';
import { useAuth } from '../auth/AuthContext';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { ProfileSkeleton } from './skeletons';

const S = surfaces.coach;
const isDark = S.colorScheme === 'dark';
const CANVAS = S.canvas;
const SUBTLE = isDark ? palette.neutral[800] : palette.neutral[100];
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];

/* On-ink tones (semantic status tokens are tuned for light surfaces — same approach as the
   other coach screens). */
const INK = {
  ok:      { fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' }, // active / verified / connected
  pending: { fg: palette.or[300], bg: 'rgba(242,194,0,0.13)' },    // document pending / stale nudge
};

const F = {
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

// No native image picker is wired in the prototype, so "Choose a photo" sets this demo portrait.
// Real code replaces this with expo-image-picker → upload → the returned URL (PRD §5 "avatars").
const DEMO_PHOTO = 'https://i.pravatar.cc/300?img=68';

const STALE_AFTER_DAYS = 3;

type DocKey = 'cv' | 'urssaf' | 'insurance' | 'diploma';
type DocStatus = 'verified' | 'pending';
type FieldKind = 'vehicle' | 'departure' | 'areas' | 'unavailability' | 'rate' | 'target' | 'personal' | 'password';
type SheetKind =
  | 'avatar' | 'schedule' | 'transport' | 'travel' | 'field'
  | 'confirmAvail' | 'gcal' | 'doc' | 'logout' | 'about';

// Format the selected weekday keys for the row value (ordered Mon→Sun, joined; empty → "not set").
function formatDays(days: string[], order: readonly string[], notSet: string): string {
  const ordered = order.filter((d) => days.includes(d));
  return ordered.length ? ordered.join(' · ') : notSet;
}

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  gcalConnected: boolean;
  updatedDaysAgo: number;
  av: {
    days: string[];
    travel: string;
    transport: string;
    departure: string;
    areas: string;
    unavailability: string;
  };
  goals: { target: string; flexibility: string; rate: string };
  docs: Record<DocKey, DocStatus>;
};

const INITIAL: ProfileData = {
  name: 'Karim Benali',
  email: 'karim.benali@email.com',
  phone: '+33 6 12 34 56 78',
  photoUrl: null,
  gcalConnected: true,
  updatedDaysAgo: 6,
  av: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    travel: '≤ 45 min',
    transport: 'Car',
    departure: '12 Rue de la République, Lyon 2nd',
    areas: 'Lyon 3rd · 6th · 7th · Villeurbanne',
    unavailability: 'None upcoming',
  },
  goals: { target: '40', flexibility: 'Flexible', rate: '35' },
  docs: { cv: 'verified', urssaf: 'verified', insurance: 'verified', diploma: 'verified' },
};

/* ---------- small building blocks ---------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={st.eyebrow}>{children}</Text>;
}

function Row({
  icon: Icon, label, value, chip, first, onPress,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  chip?: React.ReactNode;
  first?: boolean;
  onPress?: () => void;
}) {
  const a11y = value ? `${label}, ${value}` : label;
  return (
    <Pressable
      style={({ pressed }) => [st.row, !first && st.rowDivider, pressed && { opacity: 0.85 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <View style={st.rowIcon}>
        <Icon size={18} color={ON_CARD_2} />
      </View>
      {chip != null ? (
        // Chip rows: the label grows and WRAPS to a 2nd line if long, so it never overlaps the
        // chip; the chip + chevron keep their natural width, pinned right.
        <>
          <Text style={[st.rowLabel, st.rowLabelGrow]} numberOfLines={2}>{label}</Text>
          <View style={st.rowChipRight}>
            {chip}
            <ChevronRight size={18} color={ON_CARD_3} />
          </View>
        </>
      ) : (
        // Value rows: short label; the (often long) value shrinks/ellipsizes on the right.
        <>
          <Text style={st.rowLabel} numberOfLines={2}>{label}</Text>
          <View style={st.rowRight}>
            {value ? <Text style={st.rowValue} numberOfLines={1}>{value}</Text> : null}
            <ChevronRight size={18} color={ON_CARD_3} />
          </View>
        </>
      )}
    </Pressable>
  );
}

function StatusChip({ tone, icon: Icon, label }: { tone: keyof typeof INK; icon: LucideIcon; label: string }) {
  const t = INK[tone];
  return (
    <View style={[st.chip, { backgroundColor: t.bg }]}>
      <Icon size={12} color={t.fg} />
      {/* No numberOfLines — the chip must measure at full width so the label (not the chip) wraps. */}
      <Text style={[st.chipTxt, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

// Raised gradient card wrapper (the canonical heroCard idiom — gradient overlay + hairline).
function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={st.card}>
      <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.xl }]} pointerEvents="none" />
      {children}
    </View>
  );
}

/* ---------- screen ---------- */

export function ProfileScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = copy.profile;
  const { signOut } = useAuth();

  const [p, setP] = React.useState<ProfileData>(INITIAL);
  const [sheet, setSheet] = React.useState<SheetKind | null>(null);
  const [fieldKind, setFieldKind] = React.useState<FieldKind>('departure');
  const [docKey, setDocKey] = React.useState<DocKey>('cv');
  const loading = useFirstLoad('profile', { active: visible, ms: 550 });

  const close = () => setSheet(null);
  const openField = (f: FieldKind) => { setFieldKind(f); setSheet('field'); };
  const openDoc = (d: DocKey) => { setDocKey(d); setSheet('doc'); };

  // Editing OR confirming availability resets the freshness clock (clears the stale nudge).
  const markFresh = () => setP((s) => ({ ...s, updatedDaysAgo: 0 }));
  const editAv = (patch: Partial<ProfileData['av']>) =>
    setP((s) => ({ ...s, av: { ...s.av, ...patch }, updatedDaysAgo: 0 }));

  const stale = p.updatedDaysAgo > STALE_AFTER_DAYS;
  const ago =
    p.updatedDaysAgo === 0
      ? `${c.availability.updatedPrefix} ${c.availability.justNow}`
      : `${c.availability.updatedPrefix} ${p.updatedDaysAgo} ${p.updatedDaysAgo === 1 ? c.availability.dayAgo : c.availability.daysAgo}`;

  const DOC_META: Record<DocKey, { label: string; Icon: LucideIcon }> = {
    cv: { label: c.documents.cv, Icon: FileText },
    urssaf: { label: c.documents.urssaf, Icon: ScrollText },
    insurance: { label: c.documents.insurance, Icon: ShieldCheck },
    diploma: { label: c.documents.diploma, Icon: GraduationCap },
  };

  const docChip = (k: DocKey) =>
    p.docs[k] === 'verified'
      ? <StatusChip tone="ok" icon={CheckCircle2} label={c.documents.status.verified} />
      : <StatusChip tone="pending" icon={Clock} label={c.documents.status.pending} />;

  // Compose the FieldEditSheet props for whichever field row was tapped.
  const e = c.edit;
  // Transport is a free string: 'Car' / 'Walking', or a custom vehicle typed via "Other".
  const isCustomTransport = p.av.transport !== e.transport.car && p.av.transport !== e.transport.walking;
  const fieldSheet: { title: string; fields: EditField[]; choice?: EditChoice; validate?: (v: Record<string, string>) => string | null; onSave: (v: Record<string, string>, ch?: string) => void } = (() => {
    switch (fieldKind) {
      case 'vehicle':
        return { title: e.vehicle.title, fields: [{ key: 'v', label: e.vehicle.label, value: isCustomTransport ? p.av.transport : '', placeholder: e.vehicle.placeholder, autoCapitalize: 'sentences' }], onSave: (v) => editAv({ transport: v.v.trim() || e.transport.car }) };
      case 'departure':
        return { title: e.departure.title, fields: [{ key: 'v', label: e.departure.label, value: p.av.departure, help: e.departure.help, autoCapitalize: 'words' }], onSave: (v) => editAv({ departure: v.v.trim() || p.av.departure }) };
      case 'areas':
        return { title: e.areas.title, fields: [{ key: 'v', label: e.areas.label, value: p.av.areas, help: e.areas.help, autoCapitalize: 'words' }], onSave: (v) => editAv({ areas: v.v.trim() || p.av.areas }) };
      case 'unavailability':
        return { title: e.unavailability.title, fields: [{ key: 'v', label: e.unavailability.label, value: p.av.unavailability, help: e.unavailability.help, autoCapitalize: 'sentences' }], onSave: (v) => editAv({ unavailability: v.v.trim() || 'None upcoming' }) };
      case 'rate':
        return { title: e.rate.title, fields: [{ key: 'v', label: e.rate.label, value: p.goals.rate, keyboardType: 'number-pad' }], onSave: (v) => setP((s) => ({ ...s, goals: { ...s.goals, rate: v.v.trim() || s.goals.rate } })) };
      case 'target':
        return {
          title: e.target.title,
          fields: [{ key: 'v', label: e.target.label, value: p.goals.target, keyboardType: 'number-pad', help: e.target.help }],
          choice: { label: e.target.flexibilityLabel, options: [e.target.strict, e.target.flexible], value: p.goals.flexibility },
          onSave: (v, ch) => setP((s) => ({ ...s, goals: { ...s.goals, target: v.v.trim() || s.goals.target, flexibility: ch ?? s.goals.flexibility } })),
        };
      case 'personal':
        return {
          title: e.personal.title,
          fields: [
            { key: 'name', label: e.personal.name, value: p.name, autoCapitalize: 'words' },
            { key: 'email', label: e.personal.email, value: p.email, keyboardType: 'email-address', autoCapitalize: 'none' },
            { key: 'phone', label: e.personal.phone, value: p.phone, keyboardType: 'phone-pad' },
          ],
          onSave: (v) => setP((s) => ({ ...s, name: v.name.trim() || s.name, email: v.email.trim() || s.email, phone: v.phone.trim() || s.phone })),
        };
      case 'password':
        return {
          title: c.password.title,
          fields: [
            { key: 'cur', label: c.password.current, value: '', secureTextEntry: true, autoCapitalize: 'none' },
            { key: 'next', label: c.password.next, value: '', secureTextEntry: true, autoCapitalize: 'none', help: c.password.help },
            { key: 'conf', label: c.password.confirm, value: '', secureTextEntry: true, autoCapitalize: 'none' },
          ],
          validate: (v) => {
            if (!v.cur || !v.next || !v.conf) return c.password.missing;
            if (v.next.length < 8) return c.password.tooShort;
            if (v.next !== v.conf) return c.password.mismatch;
            return null;
          },
          onSave: () => {}, // prototype: no backend — validation + close is the feedback
        };
    }
  })();

  // Contact / help open the device's mail app / browser (RN Linking, like openDirections).
  const openHelp = () => { Linking.openURL(c.links.helpUrl).catch(() => {}); };
  const openContact = () => {
    const url = `mailto:${c.links.contactEmail}?subject=${encodeURIComponent(c.links.contactSubject)}`;
    Linking.openURL(url).catch(() => {});
  };

  const avatarOptions: SheetOption[] = [
    { key: 'choose', label: c.avatarSheet.choose, icon: Camera },
    ...(p.photoUrl ? [{ key: 'remove', label: c.avatarSheet.remove, icon: X, destructive: true } as SheetOption] : []),
  ];

  const docStatus = p.docs[docKey];

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        {/* ===== Top bar — eyebrow + title left, close right ===== */}
        <View style={st.topbar}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <Text style={st.title} numberOfLines={1}>{c.title}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.closeBtn} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <Reveal loading={loading} skeleton={<ProfileSkeleton />}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp['2xl'] }} showsVerticalScrollIndicator={false}>
          {/* ===== Identity — photo or the shared ProfileAvatar glyph; camera badge = editable ===== */}
          <View style={st.identity}>
            <Pressable
              style={st.avatarWrap}
              onPress={() => setSheet('avatar')}
              accessibilityRole="button"
              accessibilityLabel={`${c.editPhotoA11y}, ${p.name}`}
            >
              {p.photoUrl ? (
                <Image source={{ uri: p.photoUrl }} style={st.avatar} />
              ) : (
                <ProfileAvatar size={84} />
              )}
              <View style={st.camBadge}>
                <Camera size={15} color={ON_CARD} />
              </View>
            </Pressable>
            <Text style={st.name} numberOfLines={1}>{p.name}</Text>
            <Text style={st.role}>{c.role}</Text>
            <View style={st.statusWrap}>
              <StatusChip tone="ok" icon={CheckCircle2} label={c.status.active} />
            </View>
          </View>

          {/* ===== Availability & travel preferences (C15 / PLA-08) ===== */}
          <View style={st.sectionHead}>
            <Eyebrow>{c.availability.eyebrow}</Eyebrow>
            <Text style={[st.updated, stale && { color: INK.pending.fg }]}>{ago}</Text>
          </View>
          {stale ? (
            <Pressable style={st.nudge} onPress={() => setSheet('confirmAvail')} accessibilityRole="button" accessibilityLabel={c.availability.staleNudge}>
              <CalendarClock size={16} color={INK.pending.fg} />
              <Text style={st.nudgeTxt}>{c.availability.staleNudge}</Text>
            </Pressable>
          ) : null}
          <Card>
            <Row first icon={CalendarClock} label={c.availability.schedule} value={formatDays(p.av.days, e.schedule.weekdays, e.schedule.notSet)} onPress={() => setSheet('schedule')} />
            <Row icon={Clock} label={c.availability.travel} value={p.av.travel} onPress={() => setSheet('travel')} />
            <Row icon={Car} label={c.availability.transport} value={p.av.transport} onPress={() => setSheet('transport')} />
            <Row icon={MapPin} label={c.availability.departure} value={p.av.departure} onPress={() => openField('departure')} />
            <Row icon={Map} label={c.availability.areas} value={p.av.areas} onPress={() => openField('areas')} />
            <Row icon={CalendarX} label={c.availability.unavailability} value={p.av.unavailability} onPress={() => openField('unavailability')} />
          </Card>
          <PrimaryButton label={c.availability.cta} style={st.cta} onPress={() => setSheet('confirmAvail')} accessibilityLabel={c.availability.cta} />

          {/* ===== Goals & rate ===== */}
          <View style={st.sectionHead}><Eyebrow>{c.goals.eyebrow}</Eyebrow></View>
          <Card>
            <Row first icon={Target} label={c.goals.target} value={`${p.goals.target} sessions · ${p.goals.flexibility}`} onPress={() => openField('target')} />
            <Row icon={Wallet} label={c.goals.rate} value={`${p.goals.rate} € / hour`} onPress={() => openField('rate')} />
          </Card>

          {/* ===== My documents ===== */}
          <View style={st.sectionHead}><Eyebrow>{c.documents.eyebrow}</Eyebrow></View>
          <Text style={st.note}>{c.documents.note}</Text>
          <Card>
            <Row first icon={DOC_META.cv.Icon} label={c.documents.cv} chip={docChip('cv')} onPress={() => openDoc('cv')} />
            <Row icon={DOC_META.urssaf.Icon} label={c.documents.urssaf} chip={docChip('urssaf')} onPress={() => openDoc('urssaf')} />
            <Row icon={DOC_META.insurance.Icon} label={c.documents.insurance} chip={docChip('insurance')} onPress={() => openDoc('insurance')} />
            <Row icon={DOC_META.diploma.Icon} label={c.documents.diploma} chip={docChip('diploma')} onPress={() => openDoc('diploma')} />
          </Card>

          {/* ===== Account ===== */}
          <View style={st.sectionHead}><Eyebrow>{c.account.eyebrow}</Eyebrow></View>
          <Card>
            <Row first icon={User} label={c.account.personal} value={p.email} onPress={() => openField('personal')} />
            <Row
              icon={CalendarCheck}
              label={c.account.calendar}
              value={p.gcalConnected ? undefined : c.calendar.disconnected}
              chip={p.gcalConnected ? <StatusChip tone="ok" icon={CheckCircle2} label={c.account.connected} /> : undefined}
              onPress={() => setSheet('gcal')}
            />
            <Row icon={KeyRound} label={c.account.password} onPress={() => openField('password')} />
          </Card>

          {/* ===== Support ===== */}
          <View style={st.sectionHead}><Eyebrow>{c.support.eyebrow}</Eyebrow></View>
          <Card>
            <Row first icon={CircleHelp} label={c.support.help} onPress={openHelp} />
            <Row icon={Mail} label={c.support.contact} onPress={openContact} />
            <Row icon={FileText} label={c.support.version} value="0.1.0" onPress={() => setSheet('about')} />
          </Card>

          {/* ===== Log out — destructive, outline + icon + label (never colour alone) ===== */}
          <Pressable
            style={({ pressed }) => [st.logout, pressed && { opacity: 0.8 }]}
            onPress={() => setSheet('logout')}
            accessibilityRole="button"
            accessibilityLabel={c.logoutA11y}
          >
            <LogOut size={18} color={palette.rouge[300]} style={{ marginRight: 8 }} />
            <Text style={st.logoutTxt}>{c.logout}</Text>
          </Pressable>
        </ScrollView>
        </Reveal>

        {/* ===== Interactive sheets ===== */}
        <OptionSheet
          visible={sheet === 'avatar'}
          onClose={close}
          title={c.avatarSheet.title}
          help={c.avatarSheet.help}
          options={avatarOptions}
          closeA11y={c.avatarSheet.closeA11y}
          onSelect={(k) => setP((s) => ({ ...s, photoUrl: k === 'choose' ? DEMO_PHOTO : null }))}
        />

        {/* Weekly schedule — multiple-choice day picker (multi-select, commit on Save). */}
        <MultiSelectSheet
          visible={sheet === 'schedule'}
          onClose={close}
          title={e.schedule.title}
          help={e.schedule.help}
          options={e.schedule.weekdays.map((d) => ({ key: d, label: d }))}
          selected={p.av.days}
          onSave={(days) => editAv({ days })}
          saveLabel={c.common.save}
          cancelLabel={c.common.cancel}
        />

        <OptionSheet
          visible={sheet === 'transport'}
          onClose={close}
          title={e.transport.title}
          selectedKey={isCustomTransport ? 'other' : p.av.transport}
          options={[
            { key: e.transport.car, label: e.transport.car, icon: Car },
            { key: e.transport.walking, label: e.transport.walking, icon: Footprints },
            { key: 'other', label: isCustomTransport ? `${e.transport.other} · ${p.av.transport}` : e.transport.other, icon: Edit3 },
          ]}
          onSelect={(k) => {
            // "Other" → let this sheet close, then open the free-text vehicle editor.
            if (k === 'other') setTimeout(() => openField('vehicle'), 220);
            else editAv({ transport: k });
          }}
        />

        <OptionSheet
          visible={sheet === 'travel'}
          onClose={close}
          title={c.edit.travel.title}
          help={c.edit.travel.help}
          selectedKey={p.av.travel}
          options={c.travelOptions.map((t) => ({ key: t, label: t }))}
          onSelect={(k) => editAv({ travel: k })}
        />

        <FieldEditSheet
          visible={sheet === 'field'}
          onClose={close}
          title={fieldSheet.title}
          fields={fieldSheet.fields}
          choice={fieldSheet.choice}
          validate={fieldSheet.validate}
          onSave={fieldSheet.onSave}
          saveLabel={c.common.save}
          cancelLabel={c.common.cancel}
        />

        <ActionModal
          visible={sheet === 'confirmAvail'}
          onClose={close}
          Icon={CalendarClock}
          accentFg={INK.pending.fg}
          accentBg={INK.pending.bg}
          title={c.confirmAvail.title}
          body={c.confirmAvail.body}
          note={`${p.av.transport} · ${p.av.travel}`}
          primaryLabel={c.confirmAvail.primary}
          onPrimary={markFresh}
          secondaryLabel={c.confirmAvail.secondary}
          closeA11y={c.common.close}
        />

        <ActionModal
          visible={sheet === 'gcal'}
          onClose={close}
          Icon={CalendarCheck}
          accentFg={INK.ok.fg}
          accentBg={INK.ok.bg}
          title={p.gcalConnected ? c.calendar.disconnectTitle : c.calendar.connectTitle}
          body={p.gcalConnected ? c.calendar.disconnectBody : c.calendar.connectBody}
          primaryLabel={p.gcalConnected ? c.calendar.disconnect : c.calendar.connect}
          onPrimary={() => setP((s) => ({ ...s, gcalConnected: !s.gcalConnected }))}
          secondaryLabel={c.common.cancel}
          closeA11y={c.common.close}
        />

        <ActionModal
          visible={sheet === 'doc'}
          onClose={close}
          Icon={DOC_META[docKey].Icon}
          accentFg={docStatus === 'verified' ? INK.ok.fg : INK.pending.fg}
          accentBg={docStatus === 'verified' ? INK.ok.bg : INK.pending.bg}
          title={DOC_META[docKey].label}
          body={c.documentSheet.body}
          note={docStatus === 'pending' ? c.documentSheet.pendingNote : undefined}
          primaryLabel={c.documentSheet.replace}
          onPrimary={() => setP((s) => ({ ...s, docs: { ...s.docs, [docKey]: 'pending' } }))}
          secondaryLabel={c.common.close}
          closeA11y={c.common.close}
        />

        <ActionModal
          visible={sheet === 'logout'}
          onClose={close}
          Icon={LogOut}
          accentFg={palette.rouge[300]}
          accentBg="rgba(225,50,43,0.16)"
          title={c.logoutConfirm.title}
          body={c.logoutConfirm.body}
          primaryLabel={c.logout}
          onPrimary={() => { onClose(); signOut(); }}
          secondaryLabel={c.common.cancel}
          closeA11y={c.common.close}
        />

        <ActionModal
          visible={sheet === 'about'}
          onClose={close}
          Icon={CircleHelp}
          accentFg={ON_CARD}
          accentBg={palette.neutral[700]}
          title={c.about.title}
          body={c.about.body}
          primaryLabel={c.common.close}
          closeA11y={c.common.close}
        />
      </View>
    </Modal>
  );
}

/* ---------- styles ----------
   Polarity legend:
   · on the CANVAS        -> ON_CANVAS / ON_CANVAS_2
   · inside the dark CARD  -> ON_CARD / ON_CARD_2 / ON_CARD_3 (light)
*/
const st = StyleSheet.create({
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  title: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: ON_CANVAS, marginTop: 2 },
  closeBtn: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },

  identity: { alignItems: 'center', paddingTop: sp.sm, paddingBottom: sp.sm },
  avatarWrap: { width: 84, height: 84 },
  avatar: { width: 84, height: 84, borderRadius: 999 },
  camBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[700], borderWidth: 2, borderColor: CANVAS,
  },
  name: { fontFamily: F.oswS, fontSize: 24, color: ON_CANVAS, marginTop: sp.md },
  role: { fontFamily: F.body, fontSize: 15, color: ON_CANVAS_2, marginTop: 2 },
  statusWrap: { marginTop: sp.sm },

  sectionHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: sp.xl, marginBottom: sp.sm,
  },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },
  updated: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2 },
  note: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, marginBottom: sp.sm },

  nudge: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: INK.pending.bg, borderColor: 'rgba(242,194,0,0.35)', borderWidth: 1,
    borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm,
  },
  nudgeTxt: { flex: 1, fontFamily: F.body, fontSize: 14, color: INK.pending.fg },

  card: {
    borderRadius: r.xl, paddingHorizontal: sp.md, // tighter L/R inset than the sp.lg gutter
    backgroundColor: palette.neutral[800],
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 56, paddingVertical: sp.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  rowIcon: {
    width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[700],
  },
  rowLabel: { fontFamily: F.bodyS, fontSize: 16, color: ON_CARD },
  rowLabelGrow: { flex: 1, minWidth: 0 }, // chip rows: label takes the slack and wraps if long
  rowRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  rowChipRight: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }, // chip + chevron, natural width
  rowValue: { flexShrink: 1, fontFamily: F.body, fontSize: 14, color: ON_CARD_2, textAlign: 'right' },

  cta: { marginTop: sp.md },

  chip: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipTxt: { fontFamily: F.body, fontSize: 12 },

  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: 48, borderRadius: r.pill, marginTop: sp.xl,
    borderWidth: 1.5, borderColor: 'rgba(225,50,43,0.5)',
  },
  logoutTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: palette.rouge[300] },
});
