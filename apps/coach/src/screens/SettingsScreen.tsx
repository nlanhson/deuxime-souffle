/**
 * Coach · Settings (C06) — opened from the gear at the top-right of the Profil TAB.
 *
 * The Profil tab itself carries the identity card (photo, name, status) and the level card; this
 * sheet is everything ELSE — presented (like the Notification center) as an iOS pageSheet modal
 * (slides up, swipe-to-dismiss). It is the HUB that gathers everything that isn't the identity,
 * the level, or a day-to-day task:
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
 * Per the client mismatch review (2026-06): gamification is now IN (GAME-01/02 — the
 * Progression & activity section links to Badges & level), alongside report history (SESS-05),
 * facility feedback (SESS-06) and the delete-account request (AUTH-14). Availability follows
 * PLA-08/09: half-day schedule, 10–90 min travel-time slider, Car + Two-wheel vehicle transport,
 * primary + secondary departure addresses. Field lists trace to the brief; the LAYOUT is a
 * reasoned synthesis pending the coach video + approved Figma. UI text comes from ../copy (the
 * localization seam).
 *
 * Surface = coach. Scheme-robust like Séances/Disponibles: reads the scheme off the token and
 * uses only tokens valid in both variants + the palette. Content cards are the dark "ink
 * component"; text inside them is light.
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, ChevronRight, CalendarClock, Clock, Target,
  FileText, ScrollText, ShieldCheck, GraduationCap, User, CalendarCheck, KeyRound,
  CircleHelp, Mail, CheckCircle2, LogOut, ClipboardList, MessageSquare,
  Trash2, Languages, type LucideIcon,
} from '../icons';

import { palette, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { useCopy, useLocale, type Locale } from '../i18n';
import { ActionModal } from '../components/ActionModal';
import { OptionSheet } from '../components/OptionSheet';
import { FieldEditSheet, type EditField, type EditChoice } from '../components/FieldEditSheet';
import { UpdateAvailabilityScreen } from './UpdateAvailabilityScreen';
import { useAvailability, transportLabel } from '../lib/availability';
import { COACH_NAME } from '../lib/coachProfile';
import { ReportHistoryScreen } from './ReportHistoryScreen';
import { FeedbackScreen } from './FeedbackScreen';
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

// Language options shown as endonyms (each in its own language), so they read the same in either
// locale. Values are the i18n Locale codes the toggle persists.
const LANG_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const ON_CARD_3 = palette.neutral[600];

/* On-ink tones (semantic status tokens are tuned for light surfaces — same approach as the
   other coach screens). */
const INK = {
  ok:      { fg: palette.vert[700], bg: 'rgba(47,158,107,0.16)' }, // active / verified / connected
  pending: { fg: palette.or[800], bg: 'rgba(242,194,0,0.13)' },    // document pending / stale nudge
};

const F = {
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

type DocKey = 'cv' | 'urssaf' | 'insurance' | 'diploma';
type DocStatus = 'verified' | 'pending';
type FieldKind = 'rate' | 'target' | 'personal' | 'password';
type SheetKind =
  | 'field' | 'language'
  | 'gcal' | 'doc' | 'logout' | 'about' | 'delete' | 'deleteDone';

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  gcalConnected: boolean;
  deleteRequested: boolean;
  goals: { target: string; flexibility: string; rate: string };
  docs: Record<DocKey, DocStatus>;
};

const INITIAL: ProfileData = {
  name: COACH_NAME,
  email: 'karim.benali@email.com',
  phone: '+33 6 12 34 56 78',
  gcalConnected: true,
  deleteRequested: false,
  goals: { target: '40', flexibility: 'Flexible', rate: '35' },
  docs: { cv: 'verified', urssaf: 'verified', insurance: 'verified', diploma: 'verified' },
};

/* ---------- small building blocks ---------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={st.eyebrow}>{children}</Text>;
}

function Row({
  icon: Icon, label, value, chip, first, onPress, tint,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  chip?: React.ReactNode;
  first?: boolean;
  onPress?: () => void;
  /** Label + icon colour override — the destructive rows (delete account), never colour alone. */
  tint?: string;
}) {
  const a11y = value ? `${label}, ${value}` : label;
  // Read-only rows (no onPress) are display-only: no chevron, no button role — they carry a value
  // the coach can't edit here (e.g. the radius-derived authorized zones, DT-16).
  const interactive = onPress != null;
  const chevron = interactive ? <ChevronRight size={18} color={ON_CARD_3} /> : null;
  const body =
    chip != null ? (
      // Chip rows: the label grows and WRAPS to a 2nd line if long, so it never overlaps the
      // chip; the chip + chevron keep their natural width, pinned right.
      <>
        <Text style={[st.rowLabel, st.rowLabelGrow, tint != null && { color: tint }]} numberOfLines={2}>{label}</Text>
        <View style={st.rowChipRight}>
          {chip}
          {chevron}
        </View>
      </>
    ) : (
      // Value rows: short label; the (often long) value shrinks/ellipsizes on the right.
      <>
        <Text style={[st.rowLabel, tint != null && { color: tint }]} numberOfLines={2}>{label}</Text>
        <View style={st.rowRight}>
          {value ? <Text style={st.rowValue} numberOfLines={1}>{value}</Text> : null}
          {chevron}
        </View>
      </>
    );

  if (!interactive) {
    return (
      <View style={[st.row, !first && st.rowDivider]} accessible accessibilityLabel={a11y}>
        <View style={st.rowIcon}>
          <Icon size={22} color={tint ?? ON_CARD_2} />
        </View>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [st.row, !first && st.rowDivider, pressed && { opacity: 0.85 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <View style={st.rowIcon}>
        <Icon size={22} color={tint ?? ON_CARD_2} />
      </View>
      {body}
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

export function SettingsScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const copy = useCopy();
  const { locale, setLocale } = useLocale();
  const c = copy.profile;
  const { signOut } = useAuth();
  // Log out only AFTER this page-sheet has finished dismissing: signOut() unmounts the whole
  // signed-in branch, and tearing the tree down mid-dismiss leaves the native iOS sheet stuck on
  // screen (so logout appeared to do nothing / landed on a blank screen). On logout we dismiss the
  // sheet first, then sign out — fired by whichever lands first, the Modal's onDismiss or a timeout
  // fallback (onDismiss can be flaky), guarded so it runs exactly once.
  const pendingLogout = React.useRef(false);
  const finishLogout = React.useCallback(() => {
    if (!pendingLogout.current) return;
    pendingLogout.current = false;
    signOut();
  }, [signOut]);

  const [p, setP] = React.useState<ProfileData>(INITIAL);
  const [sheet, setSheet] = React.useState<SheetKind | null>(null);
  const [fieldKind, setFieldKind] = React.useState<FieldKind>('personal');
  const [docKey, setDocKey] = React.useState<DocKey>('cv');
  // Availability & travel (PLA-08) lives in its own dedicated screen (M1), shared via the store so
  // the summary + freshness nudge here stay in sync with edits made anywhere.
  const { av, updatedDaysAgo, stale } = useAvailability();
  const [availOpen, setAvailOpen] = React.useState(false);
  // Activity destinations (SESS-05/06) — full pageSheet modals.
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const loading = useFirstLoad('settings', { active: visible, ms: 550 });

  const close = () => setSheet(null);
  const openField = (f: FieldKind) => { setFieldKind(f); setSheet('field'); };
  const openDoc = (d: DocKey) => { setDocKey(d); setSheet('doc'); };
  // Current app language as a display value for the (now navigable) Langue row.
  const currentLang = LANG_OPTIONS.find((o) => o.value === locale)?.label ?? LANG_OPTIONS[0].label;

  const ago =
    updatedDaysAgo === 0
      ? `${c.availability.updatedPrefix} ${c.availability.justNow}`
      : `${c.availability.updatedPrefix} il y a ${updatedDaysAgo} ${updatedDaysAgo === 1 ? c.availability.dayAgo : c.availability.daysAgo}`;

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

  // Compose the FieldEditSheet props for whichever field row was tapped. Availability fields
  // (schedule / travel / transport / departure / time off) moved to the dedicated screen (M1).
  const e = c.edit;
  const fieldSheet: { title: string; fields: EditField[]; choice?: EditChoice; validate?: (v: Record<string, string>) => string | null; onSave: (v: Record<string, string>, ch?: string) => void } = (() => {
    switch (fieldKind) {
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

  const docStatus = p.docs[docKey];

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      onDismiss={finishLogout}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        {/* ===== Top bar — eyebrow + title left, close right (cream, per request) ===== */}
        <View style={st.topbar}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{c.settingsEyebrow}</Eyebrow>
            <Text style={st.title} numberOfLines={1}>{c.settingsTitle}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.closeBtn} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <Reveal loading={loading} skeleton={<ProfileSkeleton />}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp['2xl'] }} showsVerticalScrollIndicator={false}>
          {/* ===== Availability & travel (C15 / PLA-08) — a summary row opening the dedicated
                  screen (M1); the same row→screen idiom as Reports/Feedback below. The freshness
                  nudge stays here, in the hub. ===== */}
          <View style={st.sectionHead}>
            <Eyebrow>{c.availability.eyebrow}</Eyebrow>
            <Text style={[st.updated, stale && { color: INK.pending.fg }]}>{ago}</Text>
          </View>
          {stale ? (
            <Pressable style={st.nudge} onPress={() => setAvailOpen(true)} accessibilityRole="button" accessibilityLabel={c.availability.staleNudge}>
              <CalendarClock size={16} color={INK.pending.fg} />
              <Text style={st.nudgeTxt}>{c.availability.staleNudge}</Text>
            </Pressable>
          ) : null}
          <Card>
            <Row first icon={CalendarClock} label={c.availability.manage} value={`${transportLabel(av.transport, e.transport)} · ≤ ${av.travelMin} min`} onPress={() => setAvailOpen(true)} />
          </Card>

          {/* ===== Goals (fairness target) ===== */}
          <View style={st.sectionHead}><Eyebrow>{c.goals.eyebrow}</Eyebrow></View>
          <Card>
            <Row first icon={Target} label={c.goals.target} value={`${p.goals.target} séances · ${p.goals.flexibility}`} onPress={() => openField('target')} />
            {/* Default hourly rate row removed (DT-05) — rate is back-office-managed, never shown to the coach. */}
          </Card>

          {/* ===== Activity (SESS-05 · SESS-06) — level & badges moved to the prominent card above
                  (GAME-01/02 / DT-17); this section keeps report history + facility ratings. ===== */}
          <View style={st.sectionHead}><Eyebrow>{c.activity.eyebrow}</Eyebrow></View>
          <Card>
            <Row first icon={ClipboardList} label={c.activity.reports} value={c.activity.reportsValue} onPress={() => setReportsOpen(true)} />
            <Row icon={MessageSquare} label={c.activity.feedback} value={c.activity.feedbackValue} onPress={() => setFeedbackOpen(true)} />
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

          {/* ===== Preferences — app language (FR / EN), persisted across launches. Per the settings
                  restyle, language is a navigable option (current language as the row value) that
                  opens the OptionSheet picker, rather than an inline toggle. ===== */}
          <View style={st.sectionHead}><Eyebrow>{c.preferences.eyebrow}</Eyebrow></View>
          <Card>
            <Row first icon={Languages} label={c.preferences.language} value={currentLang} onPress={() => setSheet('language')} />
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
            {/* Delete account (AUTH-14) — destructive: red icon + label, never colour alone. */}
            <Row
              icon={Trash2}
              label={c.account.deleteAccount}
              tint={palette.rouge[600]}
              chip={p.deleteRequested ? <StatusChip tone="pending" icon={Clock} label={c.account.deleteRequested} /> : undefined}
              onPress={() => setSheet(p.deleteRequested ? 'deleteDone' : 'delete')}
            />
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
            <LogOut size={18} color={palette.rouge[700]} style={{ marginRight: 8 }} />
            <Text style={st.logoutTxt}>{c.logout}</Text>
          </Pressable>
        </ScrollView>
        </Reveal>

        {/* ===== Interactive sheets ===== */}
        {/* Language picker — FR / EN with a check on the current locale (the Langue row's destination). */}
        <OptionSheet
          visible={sheet === 'language'}
          onClose={close}
          title={c.preferences.language}
          help={c.preferences.a11y}
          options={LANG_OPTIONS.map((o) => ({ key: o.value, label: o.label }))}
          selectedKey={locale}
          onSelect={(k) => setLocale(k as Locale)}
          closeA11y={c.common.close}
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
          accentFg={palette.rouge[600]}
          accentBg="rgba(225,50,43,0.16)"
          title={c.logoutConfirm.title}
          body={c.logoutConfirm.body}
          primaryLabel={c.logout}
          primaryTone="danger"
          // Close the confirm sheet + dismiss the profile; signOut fires once the page-sheet is
          // gone — via onDismiss, or a 500ms fallback if onDismiss doesn't land (see finishLogout).
          onPrimary={() => { pendingLogout.current = true; close(); onClose(); setTimeout(finishLogout, 500); }}
          secondaryLabel={c.common.cancel}
          closeA11y={c.common.close}
        />

        <ActionModal
          visible={sheet === 'about'}
          onClose={close}
          Icon={CircleHelp}
          accentFg={ON_CARD}
          accentBg={palette.neutral[200]}
          title={c.about.title}
          body={c.about.body}
          primaryLabel={c.common.close}
          closeA11y={c.common.close}
        />

        {/* Delete account (AUTH-14): confirm the request, then acknowledge it was sent. */}
        <ActionModal
          visible={sheet === 'delete'}
          onClose={close}
          Icon={Trash2}
          accentFg={palette.rouge[600]}
          accentBg="rgba(225,50,43,0.16)"
          title={c.deleteConfirm.title}
          body={c.deleteConfirm.body}
          primaryLabel={c.deleteConfirm.confirm}
          primaryTone="danger"
          onPrimary={() => {
            setP((s) => ({ ...s, deleteRequested: true }));
            // Let this sheet's exit play, then surface the acknowledgement (transport→vehicle idiom).
            setTimeout(() => setSheet('deleteDone'), 260);
          }}
          secondaryLabel={c.common.cancel}
          closeA11y={c.common.close}
        />
        <ActionModal
          visible={sheet === 'deleteDone'}
          onClose={close}
          Icon={Clock}
          accentFg={INK.pending.fg}
          accentBg={INK.pending.bg}
          title={c.deleteConfirm.requestedTitle}
          body={c.deleteConfirm.requestedBody}
          primaryLabel={c.common.close}
          closeA11y={c.common.close}
        />

        {/* Dedicated availability & travel editor (M1 / PLA-08) — opened from the summary row. */}
        <UpdateAvailabilityScreen visible={availOpen} onClose={() => setAvailOpen(false)} />

        {/* Progression & activity destinations (GAME-01/02 · SESS-05 · SESS-06). */}
        <ReportHistoryScreen visible={reportsOpen} onClose={() => setReportsOpen(false)} />
        <FeedbackScreen visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
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

  // First section sits closer to the title (no identity block above it anymore).
  sectionHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: sp.lg, marginBottom: sp.sm,
  },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },
  updated: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2 },
  note: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, marginBottom: sp.sm },

  nudge: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: INK.pending.bg, borderColor: 'rgba(242,194,0,0.35)', borderWidth: 1,
    borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm,
  },
  nudgeTxt: { flex: 1, fontFamily: F.body, fontSize: 16, color: INK.pending.fg },

  card: {
    borderRadius: r.xl, paddingHorizontal: sp.md, // tighter L/R inset than the sp.lg gutter
    backgroundColor: palette.neutral[0],
    borderWidth: 1, borderColor: 'rgba(24,23,21,0.10)',
    // Flat settings cards — no drop shadow; a crisp 10% hairline carries the edge now the shadow's
    // gone (inner row dividers stay lighter at 7%). Settings restyle.
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 60, paddingVertical: sp.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: 'rgba(24,23,21,0.07)' },
  // Borderless leading icon — bare outline glyph in a fixed-width slot (no filled badge), so labels
  // stay aligned while the row reads lighter (settings-list restyle).
  rowIcon: {
    width: 26, alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontFamily: F.bodyS, fontSize: 16, color: ON_CARD },
  rowLabelGrow: { flex: 1, minWidth: 0 }, // chip rows: label takes the slack and wraps if long
  rowRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  rowChipRight: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }, // chip + chevron, natural width
  rowValue: { flexShrink: 1, fontFamily: F.body, fontSize: 14, color: ON_CARD_2, textAlign: 'right' },

  chip: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipTxt: { fontFamily: F.body, fontSize: 13 },

  logout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: 48, borderRadius: r.button, marginTop: sp.xl,
    borderWidth: 1.5, borderColor: 'rgba(225,50,43,0.5)',
  },
  logoutTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: palette.rouge[700] }, // DT-20: AA on light
});
