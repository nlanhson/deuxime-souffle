/**
 * Coach · Séances ("Sessions") — the Sessions tab. The coach's backbone:
 * assigned sessions (C21/C22/C23) → check-in (C16) → 6-step report (C25/C26).
 *
 * This v0.1 slice builds the LIST + status model + the contextual entry points. The
 * check-in flow and the report form are their own screens (deferred slices); here their
 * CTAs are the loops Accueil opens — "Start check-in" on the live session, "Write report"
 * on a finished one. The check-in session and the report-due session deliberately match
 * Accueil's hero + banner, so the two screens tell one continuous story.
 *
 * Surface = coach: LIGHT app (cream canvas) with DARK ink cards — per client PDF p.11.
 * Two text polarities (same as AccueilScreen): ON_CANVAS (dark, on cream) vs ON_CARD
 * (cream, inside the dark cards). UI text comes from ../copy (the localization seam).
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { MapPin, AlertTriangle, Check, CheckCircle2, Navigation, Edit3, Users, Bell, Clock, User, X, ChevronDown, ChevronUp, ChevronRight, Ban, CalendarX, StickyNote, Send, Activity, Smile, Wallet, Copy, type LucideIcon } from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { NotificationCenter } from '../components/NotificationCenter';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { COACH_PHOTO } from '../lib/coachProfile';
import { Segmented } from '../components/segmented';
import { ActionModal } from '../components/ActionModal';
import { OptionSheet } from '../components/OptionSheet';
import { CheckInModal } from '../components/CheckInModal';
import { AbsenceModal } from '../components/AbsenceModal';
import { openDirections } from '../lib/openDirections';
import { ProfileScreen } from './ProfileScreen';
import { ReportScreen } from './ReportScreen';
import { useTabBarInset } from '../navigation/tabBarInsets';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { SeancesSkeleton } from './skeletons';

const S = surfaces.coach;
/* The coach colour scheme is mid-migration (light cream-canvas ↔ dark ink-canvas, the
   decision is being reworked upstream). This screen reads the scheme off the token
   (`S.colorScheme`) and uses only tokens present in BOTH variants + the palette, so it
   compiles and renders correctly whichever way it settles. Invariants that hold in both:
   the content cards are always the dark "ink component", and text inside them is light. */
const isDark = S.colorScheme === 'dark';
const CANVAS = S.canvas;                                            // ink (dark) | cream (light)
const CARD = S.surface;                                             // the dark ink card in both schemes
const CARD_LIFT = isDark ? palette.neutral[700] : S.surfaceRaised;  // lifted cell inside a card
const SUBTLE = isDark ? palette.neutral[800] : palette.neutral[100]; // subtle container on the canvas
const ON_CANVAS = S.textPrimary;                                   // on-canvas text — adapts per scheme
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[50];                              // light text inside the dark card
const ON_CARD_2 = palette.neutral[300];
const MOVEMENT = [palette.rouge[500], palette.or[500]] as const;  // signature gradient, 135°

/* Status colours used INSIDE the dark cards — tuned for the ink surface (the global ramp,
   since the semantic status tokens are calibrated for light surfaces). Same approach as
   AccueilScreen; SPEC §4 proposes promoting these to coach-theme tokens. */
const INK = {
  ok:      { fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' },     // confirmed / done
  pending: { fg: palette.or[300], bg: 'rgba(242,194,0,0.13)' },        // report due
  info:    { fg: palette.bleu[200], bg: 'rgba(166,183,219,0.14)' },    // check-in open
  neutral: { fg: palette.neutral[400], bg: 'rgba(156,156,156,0.16)' }, // report sent / muted
};

const F = {
  display: 'Anton_400Regular',
  oswR: 'Oswald_400Regular',
  oswM: 'Oswald_500Medium',
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

/* ---------- data model ---------- */

type Status = 'checkin' | 'confirmed' | 'checkedIn' | 'reportDue' | 'reportSent';
// `rate` = the coach's hourly rate on this session (PLA-14 — mock; real code reads the
// assignment's agreed rate).
type Session = { id: string; time: string; end: string; place: string; addr: string; detail: string; contact: string; status: Status; rate: number };
type Group = { label: string; items: Session[] };

// Duration shown on the card's time rail (ClassPass idiom: start time over duration, not end time).
// Times are "HH:MM" 24h; the full start→end range stays available in the detail sheet.
function durationLabel(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  if (mins < 60) return `${mins} min`;
  return mins % 60 === 0 ? `${mins / 60}h` : `${Math.floor(mins / 60)}h ${mins % 60}`;
}

// Mock data — placeholder content (real code formats weekday/distance/time from data + locale).
// "The Lindens @ 14:30" mirrors the Accueil hero; "Bellevue, yesterday" mirrors its report banner.
const UPCOMING: Group[] = [
  {
    label: 'Aujourd’hui',
    items: [
      { id: 'u1', time: '14:30', end: '15:30', place: 'Résidence Les Tilleuls', addr: '12 rue des Lilas, Lyon 3e · 2.4 km', detail: 'Groupe · 8 résidents', contact: 'Demandez Marie Laurent · Coordinatrice', status: 'checkin', rate: 35 },
      { id: 'u2', time: '17:00', end: '18:00', place: 'Résidence du Parc', addr: '8 rue Léon Blum, Villeurbanne · 3.1 km', detail: 'Individuel · 1 résident', contact: 'Demandez Thomas Petit · Responsable des animations', status: 'confirmed', rate: 35 },
    ],
  },
  {
    label: 'Demain',
    items: [
      { id: 'u3', time: '10:00', end: '11:00', place: 'Résidence Les Cèdres', addr: '5 avenue Jean Jaurès, Lyon 7e · 4.8 km', detail: 'Groupe · 6 résidents', contact: 'Demandez Sophie Marchand · Coordinatrice', status: 'confirmed', rate: 40 },
    ],
  },
  {
    label: 'Jeu · 11 juin',
    items: [
      { id: 'u4', time: '11:00', end: '12:00', place: 'Résidence Les Érables', addr: '27 cours Gambetta, Lyon 6e · 1.9 km', detail: 'Groupe · 10 résidents', contact: 'Demandez Claire Dubois · Responsable de soins', status: 'confirmed', rate: 35 },
    ],
  },
];

const PAST: Group[] = [
  {
    label: 'Hier',
    items: [
      { id: 'p1', time: '15:00', end: '16:00', place: 'Résidence Bellevue', addr: '3 rue Bellecombe, Lyon 6e · 1.9 km', detail: 'Groupe · 10 résidents', contact: 'Demandez Julien Moreau · Coordinateur', status: 'reportDue', rate: 35 },
      { id: 'p2', time: '09:30', end: '10:30', place: 'Résidence des Berges', addr: '14 quai Rambaud, Lyon 7e · 4.1 km', detail: 'Individuel · 1 résident', contact: 'Demandez Amélie Roche · Responsable des animations', status: 'reportSent', rate: 35 },
    ],
  },
  {
    label: 'Lun · 8 juin',
    items: [
      { id: 'p3', time: '14:00', end: '15:00', place: 'Résidence Les Chênes', addr: '19 montée des Soldats, Caluire · 5.2 km', detail: 'Groupe · 7 résidents', contact: 'Demandez Luc Girard · Coordinateur', status: 'reportSent', rate: 35 },
    ],
  },
];

/* ---------- small building blocks ---------- */

const STATUS_META: Record<Status, { tone: keyof typeof INK; label: string; icon?: LucideIcon }> = {
  checkin:    { tone: 'info', label: copy.sessions.status.checkinOpen, icon: MapPin },
  confirmed:  { tone: 'ok', label: copy.sessions.status.confirmed },
  checkedIn:  { tone: 'ok', label: copy.sessions.status.checkedIn, icon: CheckCircle2 },
  reportDue:  { tone: 'pending', label: copy.sessions.status.reportDue, icon: AlertTriangle },
  reportSent: { tone: 'neutral', label: copy.sessions.status.reportSent, icon: Check },
};

// Status chip — never colour alone: every tone carries an icon (or a dot) AND a word.
function StatusChip({ status }: { status: Status }) {
  const m = STATUS_META[status];
  const c = INK[m.tone];
  const Icon = m.icon;
  return (
    <View style={[st.chip, { backgroundColor: c.bg }]}>
      {Icon ? <Icon size={13} color={c.fg} /> : <View style={[st.dot, { backgroundColor: c.fg }]} />}
      <Text style={[st.chipTxt, { color: c.fg }]} numberOfLines={1}>{m.label}</Text>
    </View>
  );
}

// The contextual action(s) per status — this is where the screen's loops live. The two real
// loops are wired up from the screen: `onCheckIn` (C16 geolocated check-in) and `onWriteReport`
// (C25 6-step report form). Directions / view-report stay visual stubs for now.
type CtaHandlers = { onCheckIn?: () => void; onWriteReport?: () => void; onDirections?: () => void; onViewReport?: () => void };

function SessionCta({ status, onCheckIn, onWriteReport, onDirections, onViewReport }: { status: Status } & CtaHandlers) {
  if (status === 'checkin') {
    return (
      <View style={st.ctaRow}>
        <Pressable style={st.secondaryBtn} onPress={onDirections} accessibilityRole="button" accessibilityLabel={copy.sessions.action.directions}>
          <Text style={st.secondaryTxt}>{copy.sessions.action.directions}</Text>
        </Pressable>
        <PrimaryButton label={copy.sessions.action.checkin} onPress={onCheckIn} style={{ flex: 1 }} />
      </View>
    );
  }
  if (status === 'confirmed') {
    return (
      <View style={st.ctaRow}>
        <Pressable style={[st.secondaryBtn, { flex: 1 }]} onPress={onDirections} accessibilityRole="button" accessibilityLabel={copy.sessions.action.directions}>
          <Navigation size={15} color={ON_CARD} style={{ marginRight: 6 }} />
          <Text style={st.secondaryTxt}>{copy.sessions.action.directions}</Text>
        </Pressable>
      </View>
    );
  }
  if (status === 'checkedIn') {
    // on site — a quiet, non-interactive confirmation (the report loop opens later, once finished)
    return (
      <View style={st.ctaRow}>
        <View style={st.checkedInBadge}>
          <CheckCircle2 size={16} color={INK.ok.fg} style={{ marginRight: 6 }} />
          <Text style={st.checkedInTxt}>{copy.sessions.status.checkedIn}</Text>
        </View>
      </View>
    );
  }
  if (status === 'reportDue') {
    return (
      <View style={st.ctaRow}>
        <Pressable style={st.reportBtn} onPress={onWriteReport} accessibilityRole="button" accessibilityLabel={copy.sessions.action.writeReport}>
          <Edit3 size={15} color={palette.neutral[900]} style={{ marginRight: 6 }} />
          <Text style={st.reportTxt}>{copy.sessions.action.writeReport}</Text>
        </Pressable>
      </View>
    );
  }
  // reportSent — done; opens the submitted report read-only (C27).
  return (
    <View style={st.ctaRow}>
      <Pressable style={st.viewBtn} onPress={onViewReport} accessibilityRole="button" accessibilityLabel={copy.sessions.action.viewReport}>
        <Text style={st.viewTxt}>{copy.sessions.action.viewReport}</Text>
      </Pressable>
    </View>
  );
}

type OpenSession = Session & { day: string };

function SessionCard({ s, day, first, onOpen, onCheckIn, onWriteReport, onViewReport }: { s: Session; day: string; first: boolean; onOpen: (d: OpenSession) => void; onCheckIn: (d: OpenSession) => void; onWriteReport: (d: OpenSession) => void; onViewReport: (d: OpenSession) => void }) {
  const [expanded, setExpanded] = React.useState(false);
  const open: OpenSession = { ...s, day };
  return (
    <View style={[st.card, !first && st.cardDivider]}>
      <View style={st.cardTop}>
        {/* collapsed header — tap opens the full detail page */}
        <Pressable
          style={({ pressed }) => [st.headerTap, pressed && { opacity: 0.9 }]}
          onPress={() => onOpen(open)}
          accessibilityRole="button"
          accessibilityLabel={`${s.place}, ${s.time} to ${s.end}, ${STATUS_META[s.status].label}. View details.`}
        >
          {/* time rail — start time over duration (ClassPass idiom) */}
          <View style={st.timeRail}>
            <Text style={st.railTime} numberOfLines={1}>{s.time}</Text>
            <Text style={st.railEnd}>{durationLabel(s.time, s.end)}</Text>
          </View>

          {/* thin connector rule between the rail and the content */}
          <View style={st.railRule} />

          {/* title · tag · address */}
          <View style={st.cardBody}>
            <Text style={st.place} numberOfLines={1}>{s.place}</Text>
            <View style={st.tagRow}>
              <StatusChip status={s.status} />
            </View>
            <Text style={st.addr} numberOfLines={2}>{s.addr}</Text>
          </View>
        </Pressable>

        {/* dropdown — expands the card in place */}
        <Pressable
          style={st.chevBtn}
          onPress={() => setExpanded((v) => !v)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? copy.sessions.collapseA11y : copy.sessions.expandA11y}
        >
          {expanded ? <ChevronUp size={22} color={ON_CARD_2} /> : <ChevronDown size={22} color={ON_CARD_2} />}
        </Pressable>
      </View>

      {/* expanded — extra detail + the contextual actions */}
      {expanded ? (
        <View style={st.expandWrap}>
          <View style={st.metaRow}>
            <Users size={14} color={ON_CARD_2} />
            <Text style={st.meta}>{s.detail}</Text>
          </View>
          <View style={st.metaRow}>
            <User size={14} color={ON_CARD_2} />
            <Text style={st.meta}>{s.contact}</Text>
          </View>
          <SessionCta
            status={s.status}
            onCheckIn={() => onCheckIn(open)}
            onWriteReport={() => onWriteReport(open)}
            onDirections={() => openDirections(open.addr)}
            onViewReport={() => onViewReport(open)}
          />
        </View>
      ) : null}
    </View>
  );
}

type Seg = 'upcoming' | 'past' | 'applications';

const SEG_OPTIONS = [
  { value: 'upcoming' as const, label: copy.sessions.seg.upcoming },
  { value: 'past' as const, label: copy.sessions.seg.past },
  { value: 'applications' as const, label: copy.sessions.seg.applications },
];

/* ---------- applications (C13) — cross-session list: the sessions you've applied for and
   where each one stands. A separate status vocabulary from the session list. ---------- */

type AppStatus = 'pending' | 'accepted' | 'rejected';
type Application = { place: string; addr: string; when: string; status: AppStatus; format: string; contact: string; applied: string };

const APPLICATIONS: Application[] = [
  { place: 'Résidence Saint-Joseph', addr: '21 rue de la Part-Dieu, Lyon 3e · 1.2 km', when: 'Ven · 12 juin · 10:00 → 11:00', status: 'pending', format: 'Groupe · 8 résidents', contact: 'Demandez Nadia Berger · Coordinatrice', applied: '7 juin' },
  { place: 'Résidence Les Tilleuls', addr: '6 rue des Docks, Lyon 9e · 6.4 km', when: 'Sam · 13 juin · 15:00 → 16:00', status: 'accepted', format: 'Individuel · 1 résident', contact: 'Demandez Paul Mercier · Responsable des animations', applied: '6 juin' },
  { place: 'Résidence Bellecour', addr: '2 place Bellecour, Lyon 2e · 3.0 km', when: 'Lun · 8 juin · 11:00 → 12:00', status: 'rejected', format: 'Groupe · 6 résidents', contact: 'Demandez Hélène Faure · Coordinatrice', applied: '4 juin' },
];

const APP_META: Record<AppStatus, { tone: keyof typeof INK; label: string; icon: LucideIcon }> = {
  pending:  { tone: 'pending', label: copy.sessions.appStatus.pending, icon: Clock },
  accepted: { tone: 'ok', label: copy.sessions.appStatus.accepted, icon: Check },
  rejected: { tone: 'neutral', label: copy.sessions.appStatus.rejected, icon: X },
};

function ApplicationChip({ status }: { status: AppStatus }) {
  const m = APP_META[status];
  const c = INK[m.tone];
  const Icon = m.icon;
  return (
    <View style={[st.chip, { backgroundColor: c.bg }]}>
      <Icon size={13} color={c.fg} />
      <Text style={[st.chipTxt, { color: c.fg }]} numberOfLines={1}>{m.label}</Text>
    </View>
  );
}

function ApplicationCard({ a, first, onOpen }: { a: Application; first: boolean; onOpen: (a: Application) => void }) {
  return (
    <Pressable
      style={({ pressed }) => [st.card, !first && st.cardDivider, pressed && { opacity: 0.9 }]}
      onPress={() => onOpen(a)}
      accessibilityRole="button"
      accessibilityLabel={`${a.place}, ${a.when}, ${APP_META[a.status].label}. View application.`}
    >
      <View style={st.appHead}>
        <Text style={st.place} numberOfLines={1}>{a.place}</Text>
        <ApplicationChip status={a.status} />
      </View>
      <View style={[st.metaRow, { marginTop: 6 }]}>
        <Clock size={14} color={ON_CARD_2} />
        <Text style={st.meta}>{a.when}</Text>
      </View>
      <View style={st.metaRow}>
        <MapPin size={14} color={ON_CARD_2} />
        <Text style={st.meta} numberOfLines={1}>{a.addr}</Text>
      </View>
    </Pressable>
  );
}

/* ---------- application detail (C13) — pageSheet, opened by tapping an application row ---------- */

function ApplicationDetail({ detail, onClose, onWithdraw }: { detail: Application | null; onClose: () => void; onWithdraw: (a: Application) => void }) {
  const a = detail;
  return (
    <Modal visible={!!a} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        <View style={st.dHeader}>
          <Text style={st.dHeaderTitle}>{copy.sessions.appDetail.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.dClose} accessibilityRole="button" accessibilityLabel={copy.sessions.appDetail.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        {a ? (
          <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: sp.xl }} showsVerticalScrollIndicator={false}>
            {/* hero — place + status */}
            <Text style={st.dPlace}>{a.place}</Text>
            <View style={{ alignSelf: 'flex-start', marginTop: sp.sm }}>
              <ApplicationChip status={a.status} />
            </View>

            {/* plain-language status explainer */}
            <Text style={st.appNote}>{copy.sessions.appDetail.note[a.status]}</Text>

            {/* facts */}
            <View style={st.dCard}>
              <DetailRow Icon={Clock} label={copy.sessions.appDetail.when} value={a.when} first />
              <DetailRow Icon={MapPin} label={copy.sessions.appDetail.where} value={a.addr} />
              <DetailRow Icon={Users} label={copy.sessions.appDetail.format} value={a.format} />
              <DetailRow Icon={User} label={copy.sessions.appDetail.contact} value={a.contact} />
              <DetailRow Icon={Send} label={copy.sessions.appDetail.applied} value={a.applied} />
            </View>

            {/* withdraw (C14) — only while Pending; an accepted/declined application can't be withdrawn */}
            {a.status === 'pending' ? (
              <>
                <Text style={st.manageTitle}>{copy.sessions.appDetail.manageTitle}</Text>
                <View style={st.manageCard}>
                  <ManageRow Icon={Ban} label={copy.sessions.appDetail.withdraw} danger first onPress={() => onWithdraw(a)} />
                </View>
              </>
            ) : null}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

/* Per-session management actions (C24 cancel · C20 absence · C28 notes) — live INSIDE the
   session detail sheet, where there's a session in context. Built per-session in SessionDetail. */
function ManageRow({ Icon, label, danger, onPress }: { Icon: LucideIcon; label: string; danger?: boolean; first?: boolean; onPress?: () => void }) {
  const tint = danger ? palette.rouge[300] : ON_CARD;
  return (
    <Pressable
      style={({ pressed }) => [st.manageRow, pressed && { opacity: 0.6 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={st.rowIcon}>
        <Icon size={18} color={danger ? palette.rouge[300] : ON_CARD_2} />
      </View>
      <Text style={[st.manageLabel, { color: tint }]}>{label}</Text>
      <ChevronRight size={18} color={ON_CARD_2} />
    </Pressable>
  );
}

/* ---------- transmission notes (C28) — per-session continuity log shared between coaches ---------- */

type NoteEntry = { author: string; date: string; text: string };

// Seed: prior notes (by other coaches / earlier sessions), keyed by session id. Unlisted = empty.
const SEED_NOTES: Record<string, NoteEntry[]> = {
  u1: [
    { author: 'Sophie Marchand', date: '28 mai', text: 'M. Lambert préfère les exercices assis à cause d’un problème de genou. Gardez l’échauffement court ; le groupe réagit bien à la musique.' },
  ],
  p1: [
    { author: copy.sessions.notesModal.you, date: '8 juin', text: 'Deux nouveaux résidents ont rejoint le groupe. Pensez à apporter des élastiques supplémentaires la prochaine fois.' },
  ],
};

function TransmissionNotesModal({ session, notes, onClose, onAdd }: {
  session: OpenSession | null;
  notes: NoteEntry[];
  onClose: () => void;
  onAdd: (text: string) => void;
}) {
  const [draft, setDraft] = React.useState('');
  const c = copy.sessions.notesModal;
  // Clear the draft whenever a different session's notes open.
  React.useEffect(() => { if (session) setDraft(''); }, [session?.id]);
  const canSave = draft.trim().length > 0;
  const save = () => { if (canSave) { onAdd(draft.trim()); setDraft(''); } };

  return (
    <Modal visible={!!session} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        <View style={st.dHeader}>
          <Text style={st.dHeaderTitle}>{c.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.dClose} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: sp.lg }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
            {session ? <Text style={st.notesPlace}>{session.place}</Text> : null}
            <Text style={st.notesIntro}>{c.body}</Text>

            {notes.length ? (
              notes.map((n, i) => (
                <View key={i} style={st.noteCard}>
                  <View style={st.noteHead}>
                    <Text style={st.noteAuthor}>{n.author}</Text>
                    <Text style={st.noteDate}>{n.date}</Text>
                  </View>
                  <Text style={st.noteText}>{n.text}</Text>
                </View>
              ))
            ) : (
              <Text style={st.empty}>{c.empty}</Text>
            )}
          </ScrollView>

          {/* add a note */}
          <View style={st.inputBar}>
            <TextInput
              style={st.noteInput}
              value={draft}
              onChangeText={setDraft}
              placeholder={c.placeholder}
              placeholderTextColor={palette.neutral[500]}
              multiline
              accessibilityLabel={c.title}
            />
            <Pressable
              style={({ pressed }) => [st.saveBtn, !canSave && st.saveBtnDisabled, pressed && canSave && { opacity: 0.9 }]}
              onPress={save}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
            >
              <Text style={st.saveTxt}>{c.save}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ---------- view report (C27) — read-only view of a submitted report + its review status ---------- */

type ReviewStatus = 'pending' | 'validated' | 'changes';
type SubmittedReport = {
  submitted: string;       // submission date (mock)
  review: ReviewStatus;    // where the report stands in validation
  participants: number;
  activities: string[];
  flag?: string;           // facility flag note (undefined = nothing flagged)
  nextNotes?: string;      // notes for the next session
  ready: boolean;          // facility readiness
  engagement: number;      // 0–3 index into copy.report.engagement.levels (SESS-01)
  difficulty: number;      // 0–2 index into copy.report.difficulty.options (SESS-01)
};

// Mock submitted reports, keyed by the session id of each `reportSent` session.
const REPORTS: Record<string, SubmittedReport> = {
  p2: { submitted: '8 juin', review: 'validated', participants: 1, activities: ['Mobilité & équilibre', 'Souplesse'], ready: true, engagement: 2, difficulty: 0, nextNotes: 'Conserver la routine assise ; le résident a bien réagi.' },
  p3: { submitted: '8 juin', review: 'pending', participants: 7, activities: ['Renforcement', 'Cardio', 'Coordination'], flag: 'Le chauffage était coupé dans la salle d’activité, il faisait donc assez froid.', ready: false, engagement: 3, difficulty: 2 },
};

const REVIEW_META: Record<ReviewStatus, { tone: keyof typeof INK; label: string; icon: LucideIcon }> = {
  pending:   { tone: 'info', label: copy.sessions.reportView.reviewStatus.pending, icon: Clock },
  validated: { tone: 'ok', label: copy.sessions.reportView.reviewStatus.validated, icon: CheckCircle2 },
  changes:   { tone: 'pending', label: copy.sessions.reportView.reviewStatus.changes, icon: AlertTriangle },
};

function ReviewChip({ review }: { review: ReviewStatus }) {
  const m = REVIEW_META[review];
  const c = INK[m.tone];
  const Icon = m.icon;
  return (
    <View style={[st.chip, { backgroundColor: c.bg }]}>
      <Icon size={13} color={c.fg} />
      <Text style={[st.chipTxt, { color: c.fg }]} numberOfLines={1}>{m.label}</Text>
    </View>
  );
}

function ReportView({ session, onClose }: { session: OpenSession | null; onClose: () => void }) {
  const rep = session ? REPORTS[session.id] : undefined;
  const v = copy.sessions.reportView;
  const rc = copy.report;
  const level = rep ? rc.engagement.levels[rep.engagement] : undefined;
  const diff = rep ? rc.difficulty.options[rep.difficulty] : undefined;
  return (
    <Modal visible={!!session} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        <View style={st.dHeader}>
          <Text style={st.dHeaderTitle}>{v.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.dClose} accessibilityRole="button" accessibilityLabel={v.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        {session && rep && level && diff ? (
          <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: sp.xl }} showsVerticalScrollIndicator={false}>
            {/* hero — place + review status */}
            <Text style={st.dPlace}>{session.place}</Text>
            <View style={{ alignSelf: 'flex-start', marginTop: sp.sm }}>
              <ReviewChip review={rep.review} />
            </View>
            <Text style={st.appNote}>{v.reviewNote[rep.review]}</Text>

            {/* the submitted answers, read-only */}
            <View style={st.dCard}>
              <DetailRow Icon={Clock} label={v.submittedLabel} value={`${session.day} · ${rep.submitted}`} first />
              <DetailRow Icon={Users} label={rc.participants.label} value={`${rep.participants} ${rc.participants.unit}`} />
              <DetailRow Icon={Activity} label={rc.activities.label} value={rep.activities.join(' · ')} />
              <DetailRow Icon={AlertTriangle} label={rc.flag.label} value={rep.flag ?? v.flagNone} />
              <DetailRow Icon={StickyNote} label={rc.nextNotes.label} value={rep.nextNotes ?? v.nextNone} />
              <DetailRow Icon={Check} label={rc.readiness.label} value={rep.ready ? v.readyYes : v.readyNo} />
              <DetailRow Icon={Smile} label={rc.engagement.label} value={`${level.emoji}  ${level.word}`} />
              <DetailRow Icon={Activity} label={rc.difficulty.label} value={diff.word} />
            </View>
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

/* ---------- session detail (C22) — pageSheet modal, opened by tapping a card ---------- */

function DetailRow({ Icon, label, value, onCopy, copyA11y, copied, copiedLabel }: {
  Icon: LucideIcon; label: string; value: string; first?: boolean;
  /** Copy-to-clipboard affordance (PLA-02 — the Where row). `copied` swaps in the confirmation. */
  onCopy?: () => void; copyA11y?: string; copied?: boolean; copiedLabel?: string;
}) {
  return (
    <View style={st.dRow}>
      <View style={st.rowIcon}><Icon size={18} color={ON_CARD_2} /></View>
      <View style={{ flex: 1 }}>
        <Text style={st.dRowLabel}>{label}</Text>
        <Text style={st.dRowValue}>{value}</Text>
      </View>
      {onCopy ? (
        <Pressable
          onPress={onCopy}
          hitSlop={10}
          style={({ pressed }) => [st.dCopyBtn, pressed && { opacity: 0.55 }]}
          accessibilityRole="button"
          accessibilityLabel={copyA11y}
          accessibilityLiveRegion="polite"
        >
          {copied ? (
            <>
              <Check size={16} color={INK.ok.fg} />
              {copiedLabel ? <Text style={st.dCopiedTxt}>{copiedLabel}</Text> : null}
            </>
          ) : (
            <Copy size={18} color={ON_CARD_2} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

/* Action-required banner (Fresha idiom) — a tinted strip explaining what the coach must do next.
   Only the two action-required states show it; the pinned footer button is the actual action. */
const BANNER_META: Partial<Record<Status, { tone: keyof typeof INK; icon: LucideIcon; text: string }>> = {
  checkin:   { tone: 'info', icon: MapPin, text: copy.sessions.detail.banner.checkin },
  reportDue: { tone: 'pending', icon: AlertTriangle, text: copy.sessions.detail.banner.reportDue },
};
function DetailBanner({ status }: { status: Status }) {
  const m = BANNER_META[status];
  if (!m) return null;
  const c = INK[m.tone];
  const Icon = m.icon;
  return (
    <View style={[st.banner, { backgroundColor: c.bg }]}>
      <Icon size={18} color={c.fg} />
      <Text style={[st.bannerTxt, { color: c.fg }]}>{m.text}</Text>
    </View>
  );
}

/* Pinned footer (CVS idiom) — the contextual action(s), kept on screen below the scroll. Reuses
   the card's SessionCta so the vocabulary matches: Directions on checkin/confirmed, Check in,
   Write report, View report, or the checked-in confirmation. */
function SheetFooter({ s, onCheckIn, onWriteReport, onViewReport }: { s: OpenSession; onCheckIn: () => void; onWriteReport: () => void; onViewReport: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[st.footerBar, { paddingBottom: sp.md + insets.bottom }]}>
      <SessionCta
        status={s.status}
        onCheckIn={onCheckIn}
        onWriteReport={onWriteReport}
        onDirections={() => openDirections(s.addr)}
        onViewReport={onViewReport}
      />
    </View>
  );
}

function SessionDetail({ detail, onClose, onCheckIn, onWriteReport, onCancel, onAbsence, onLate, onNotes, onViewReport }: { detail: OpenSession | null; onClose: () => void; onCheckIn: (d: OpenSession) => void; onWriteReport: (d: OpenSession) => void; onCancel: (d: OpenSession) => void; onAbsence: (d: OpenSession) => void; onLate: (d: OpenSession) => void; onNotes: (d: OpenSession) => void; onViewReport: (d: OpenSession) => void }) {
  const s = detail;
  // Copy address (PLA-02) — flashes a short inline confirmation, reset per session.
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => { setCopied(false); }, [s?.id]);
  const copyAddress = async () => {
    if (!s) return;
    await Clipboard.setStringAsync(s.addr);
    setCopied(true);
  };
  // Cancel / absence / late only make sense before you've checked in or it's already done.
  const cancellable = s?.status === 'confirmed' || s?.status === 'checkin';
  const manageRows: { icon: LucideIcon; label: string; danger?: boolean; onPress?: () => void }[] = s ? [
    ...(cancellable ? [
      { icon: Ban, label: copy.sessions.manage.cancelParticipation, danger: true, onPress: () => onCancel(s) },
      { icon: CalendarX, label: copy.sessions.manage.declareAbsence, onPress: () => onAbsence(s) },
      { icon: Clock, label: copy.sessions.manage.late, onPress: () => onLate(s) },
    ] : []),
    { icon: StickyNote, label: copy.sessions.manage.transmissionNotes, onPress: () => onNotes(s) },
  ] : [];
  return (
    <Modal visible={!!s} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        {/* header */}
        <View style={st.dHeader}>
          <Text style={st.dHeaderTitle}>{copy.sessions.detail.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.dClose} accessibilityRole="button" accessibilityLabel={copy.sessions.detail.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        {s ? (
        <>
          <ScrollView contentContainerStyle={{ padding: sp.lg, paddingBottom: sp.xl }} showsVerticalScrollIndicator={false}>
            {/* hero — place + status */}
            <Text style={st.dPlace}>{s.place}</Text>
            <View style={{ alignSelf: 'flex-start', marginTop: sp.sm }}>
              <StatusChip status={s.status} />
            </View>

            {/* action-required banner — only on the states that need the coach to act next */}
            <DetailBanner status={s.status} />

            {/* facts — a plain info list (no card box), divided by hairlines */}
            <View style={st.factList}>
              <DetailRow Icon={Clock} label={copy.sessions.detail.when} value={`${s.day} · ${s.time} → ${s.end}`} first />
              <DetailRow
                Icon={MapPin}
                label={copy.sessions.detail.where}
                value={s.addr}
                onCopy={copyAddress}
                copyA11y={copy.sessions.detail.copyA11y}
                copied={copied}
                copiedLabel={copy.sessions.detail.copied}
              />
              <DetailRow Icon={Users} label={copy.sessions.detail.format} value={s.detail} />
              <DetailRow Icon={User} label={copy.sessions.detail.contact} value={s.contact} />
              {/* Coach hourly rate (PLA-14) */}
              <DetailRow Icon={Wallet} label={copy.sessions.detail.rate} value={`${s.rate} ${copy.sessions.detail.rateUnit}`} />
            </View>

            {/* manage — per-session actions, kept as a boxed card (the "setting" stack).
                Cancel participation (C24) is wired; declare absence (C20) and transmission
                notes (C28) are placed but not yet built. */}
            <Text style={st.manageTitle}>{copy.sessions.manage.title}</Text>
            <View style={st.manageCard}>
              {manageRows.map((it, i) => (
                <ManageRow key={it.label} Icon={it.icon} label={it.label} danger={it.danger} first={i === 0} onPress={it.onPress} />
              ))}
            </View>
          </ScrollView>

          {/* pinned primary action (CVS idiom) */}
          <SheetFooter
            s={s}
            onCheckIn={() => onCheckIn(s)}
            onWriteReport={() => onWriteReport(s)}
            onViewReport={() => onViewReport(s)}
          />
        </>
        ) : null}
      </View>
    </Modal>
  );
}

/* ---------- screen ---------- */

export function SeancesScreen() {
  const [seg, setSeg] = React.useState<Seg>('upcoming');
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<OpenSession | null>(null);
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);  // C13 application detail
  const [applications, setApplications] = React.useState<Application[]>(APPLICATIONS); // mutable so withdraw can remove
  const [withdrawFor, setWithdrawFor] = React.useState<Application | null>(null);  // C14 withdraw confirm
  const [checkInFor, setCheckInFor] = React.useState<OpenSession | null>(null);   // C16 check-in flow
  const [reportFor, setReportFor] = React.useState<OpenSession | null>(null);     // C25 6-step report
  const [cancelFor, setCancelFor] = React.useState<OpenSession | null>(null);     // C24 cancel confirm
  const [absenceFor, setAbsenceFor] = React.useState<OpenSession | null>(null);   // C20 declare absence
  const [lateFor, setLateFor] = React.useState<OpenSession | null>(null);         // PLA-14 declare delay
  const [lateDone, setLateDone] = React.useState<OpenSession | null>(null);       //   …its acknowledgement
  const [notesFor, setNotesFor] = React.useState<OpenSession | null>(null);       // C28 transmission notes
  const [notesBySession, setNotesBySession] = React.useState<Record<string, NoteEntry[]>>(SEED_NOTES);
  const [reportViewFor, setReportViewFor] = React.useState<OpenSession | null>(null); // C27 view submitted report
  const [upcoming, setUpcoming] = React.useState<Group[]>(UPCOMING);              // mutable so check-in / cancel can mutate
  const groups = seg === 'past' ? PAST : upcoming;
  const isEmpty = groups.every((g) => g.items.length === 0);
  const tabBarInset = useTabBarInset();
  const loading = useFirstLoad('seances');

  // The two real loops. Both close the detail sheet first so a single pageSheet is on screen.
  const handleCheckIn = (o: OpenSession) => { setSelected(null); setCheckInFor(o); };
  const handleWriteReport = (o: OpenSession) => { setSelected(null); setReportFor(o); };

  // C16 — on a successful (or late) check-in, flip the matching session to "Checked in".
  const markCheckedIn = (id: string) => {
    setUpcoming((prev) => prev.map((g) => ({ ...g, items: g.items.map((it) => (it.id === id ? { ...it, status: 'checkedIn' as const } : it)) })));
  };

  // C14 — withdraw a pending application: confirm, then drop it from the list and close the detail.
  const confirmWithdraw = () => {
    if (withdrawFor) setApplications((prev) => prev.filter((x) => x !== withdrawFor));
    setWithdrawFor(null);
    setSelectedApp(null);
  };

  // Drop a session (and any now-empty day group) from the upcoming list — shared by cancel + absence.
  const removeUpcoming = (id: string) => {
    setUpcoming((prev) => prev
      .map((g) => ({ ...g, items: g.items.filter((it) => it.id !== id) }))
      .filter((g) => g.items.length > 0));
  };

  // C24 — cancel participation: open the confirm from the detail sheet, then drop the session.
  const handleCancel = (o: OpenSession) => { setSelected(null); setCancelFor(o); };
  const confirmCancel = () => { if (cancelFor) removeUpcoming(cancelFor.id); setCancelFor(null); };

  // C20 / PLA-11 — declare absence: the 3-step form, then drop the session (real app persists
  // the reason + message).
  const handleDeclareAbsence = (o: OpenSession) => { setSelected(null); setAbsenceFor(o); };
  const confirmAbsence = () => { if (absenceFor) removeUpcoming(absenceFor.id); setAbsenceFor(null); };

  // PLA-14 — declare a delay ("Late"): pick a rough delay, then acknowledge. The session stays
  // scheduled (unlike absence) — the real app just notifies the care home.
  const handleLate = (o: OpenSession) => { setSelected(null); setLateFor(o); };
  const confirmLate = () => {
    const s = lateFor;
    setLateFor(null);
    // Let the option sheet's exit play before the acknowledgement (transport→vehicle idiom).
    if (s) setTimeout(() => setLateDone(s), 260);
  };

  // C27 — view the submitted report (read-only) + its review status.
  const handleViewReport = (o: OpenSession) => { setSelected(null); setReportViewFor(o); };

  // C28 — transmission notes: open the per-session note thread; adding appends a "You · just now" note.
  const handleNotes = (o: OpenSession) => { setSelected(null); setNotesFor(o); };
  const addNote = (text: string) => {
    if (!notesFor) return;
    const entry: NoteEntry = { author: copy.sessions.notesModal.you, date: copy.sessions.notesModal.justNow, text };
    setNotesBySession((prev) => ({ ...prev, [notesFor.id]: [...(prev[notesFor.id] ?? []), entry] }));
  };

  // Parse the participant count out of the mock "Group · 8 residents" string for the report form.
  const reportParticipants = reportFor ? Number(reportFor.detail.match(/\d+/)?.[0]) : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANVAS }} edges={['top', 'left', 'right']}>
      <Reveal loading={loading} skeleton={<SeancesSkeleton />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp.xl + tabBarInset }}
      >
        {/* ===== Header — title left, notifications + profile right (per the locked IA) ===== */}
        <View style={st.appbar}>
          <View style={{ flex: 1 }}>
            <Text style={st.eyebrow}>{copy.sessions.eyebrow}</Text>
            <Text style={st.title} numberOfLines={1}>{copy.sessions.title}</Text>
          </View>
          <Pressable style={st.iconBtn} hitSlop={6} onPress={() => setNotifOpen(true)} accessibilityLabel={copy.header.notificationsA11y}>
            <Bell size={22} color={ON_CANVAS} fill={ON_CANVAS} />
            <View style={st.badgeDot} />
          </Pressable>
          <Pressable style={st.avatarWrap} hitSlop={6} onPress={() => setProfileOpen(true)} accessibilityLabel={copy.header.profileA11y}>
            <ProfileAvatar size={42} uri={COACH_PHOTO} />
          </Pressable>
        </View>

        {/* ===== Confirmed / Past / Applications ===== */}
        <Segmented
          value={seg}
          onChange={setSeg}
          options={SEG_OPTIONS}
          theme={{ track: SUBTLE, selected: palette.neutral[700] }}
          style={{ marginTop: sp.md }}
        />

        {seg === 'applications' ? (
          /* ===== Applications list (C13) — your applied-for sessions + their status ===== */
          <View style={st.group}>
            {applications.length ? (
              applications.map((a, i) => <ApplicationCard key={`${a.place}-${a.when}`} a={a} first={i === 0} onOpen={setSelectedApp} />)
            ) : (
              <Text style={st.empty}>{copy.sessions.emptyApplications}</Text>
            )}
          </View>
        ) : isEmpty ? (
          /* ===== Empty state — no Confirmed / Past sessions ===== */
          <View style={st.group}>
            <Text style={st.empty}>{seg === 'past' ? copy.sessions.emptyPast : copy.sessions.emptyUpcoming}</Text>
          </View>
        ) : (
          /* ===== Grouped session list ===== */
          groups.map((g) => (
            <View key={g.label} style={st.group}>
              <View style={st.dayPill}>
                <Text style={st.dayPillTxt}>{g.label}</Text>
                <Text style={st.dayPillCount}>{g.items.length}</Text>
              </View>
              {g.items.map((s, i) => (
                <SessionCard
                  key={`${g.label}-${s.time}-${s.place}`}
                  s={s}
                  day={g.label}
                  first={i === 0}
                  onOpen={setSelected}
                  onCheckIn={handleCheckIn}
                  onWriteReport={handleWriteReport}
                  onViewReport={handleViewReport}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
      </Reveal>

      <SessionDetail
        detail={selected}
        onClose={() => setSelected(null)}
        onCheckIn={handleCheckIn}
        onWriteReport={handleWriteReport}
        onCancel={handleCancel}
        onAbsence={handleDeclareAbsence}
        onLate={handleLate}
        onNotes={handleNotes}
        onViewReport={handleViewReport}
      />

      {/* PLA-14 — declare a delay ("Late"): pick a rough delay → acknowledgement. */}
      <OptionSheet
        visible={!!lateFor}
        onClose={() => setLateFor(null)}
        title={copy.sessions.lateModal.title}
        help={copy.sessions.lateModal.help}
        options={(Object.keys(copy.sessions.lateModal.options) as (keyof typeof copy.sessions.lateModal.options)[]).map((k) => ({
          key: k,
          label: copy.sessions.lateModal.options[k],
          icon: Clock,
        }))}
        onSelect={confirmLate}
        closeA11y={copy.sessions.lateModal.closeA11y}
      />
      <ActionModal
        visible={!!lateDone}
        onClose={() => setLateDone(null)}
        Icon={Clock}
        accentFg={INK.pending.fg}
        accentBg={INK.pending.bg}
        eyebrow={lateDone ? `${lateDone.place} · ${lateDone.day} · ${lateDone.time}` : undefined}
        title={copy.sessions.lateModal.doneTitle}
        body={copy.sessions.lateModal.doneBody}
        primaryLabel={copy.profile.common.done}
        closeA11y={copy.sessions.lateModal.closeA11y}
      />

      {/* C27 — read-only view of a submitted report + its review status */}
      <ReportView session={reportViewFor} onClose={() => setReportViewFor(null)} />

      {/* C28 — transmission notes (read prior notes · add your own) */}
      <TransmissionNotesModal
        session={notesFor}
        notes={notesFor ? (notesBySession[notesFor.id] ?? []) : []}
        onClose={() => setNotesFor(null)}
        onAdd={addNote}
      />

      {/* C20 — declare absence (pick a reason → removed from the upcoming list) */}
      <AbsenceModal
        visible={!!absenceFor}
        session={absenceFor ? { place: absenceFor.place, time: absenceFor.time, day: absenceFor.day } : null}
        onClose={() => setAbsenceFor(null)}
        onConfirm={confirmAbsence}
      />

      {/* C24 — cancel participation (confirm → removed from the upcoming list) */}
      <ActionModal
        visible={!!cancelFor}
        onClose={() => setCancelFor(null)}
        Icon={Ban}
        accentFg={palette.rouge[300]}
        accentBg="rgba(225,50,43,0.14)"
        eyebrow={cancelFor ? `${cancelFor.place} · ${cancelFor.day} · ${cancelFor.time}` : undefined}
        title={copy.sessions.cancelConfirm.title}
        body={copy.sessions.cancelConfirm.body}
        primaryLabel={copy.sessions.cancelConfirm.confirm}
        onPrimary={confirmCancel}
        secondaryLabel={copy.sessions.cancelConfirm.cancel}
        closeA11y={copy.sessions.cancelConfirm.closeA11y}
      />

      <ApplicationDetail detail={selectedApp} onClose={() => setSelectedApp(null)} onWithdraw={setWithdrawFor} />

      {/* C14 — withdraw a pending application (confirm → removed from the list) */}
      <ActionModal
        visible={!!withdrawFor}
        onClose={() => setWithdrawFor(null)}
        Icon={Ban}
        accentFg={palette.rouge[300]}
        accentBg="rgba(225,50,43,0.14)"
        eyebrow={withdrawFor ? `${withdrawFor.place} · ${withdrawFor.when}` : undefined}
        title={copy.sessions.appDetail.withdrawConfirm.title}
        body={copy.sessions.appDetail.withdrawConfirm.body}
        primaryLabel={copy.sessions.appDetail.withdrawConfirm.confirm}
        onPrimary={confirmWithdraw}
        secondaryLabel={copy.sessions.appDetail.withdrawConfirm.cancel}
        closeA11y={copy.sessions.appDetail.closeA11y}
      />

      {/* C16 — the geolocated check-in flow (intro → locating → outcome). On success/late it
          flips the session card to "Checked in". */}
      <CheckInModal
        visible={!!checkInFor}
        session={checkInFor ? { place: checkInFor.place, time: checkInFor.time, addr: checkInFor.addr } : null}
        onClose={() => setCheckInFor(null)}
        onConfirmed={() => { if (checkInFor) markCheckedIn(checkInFor.id); }}
      />

      {/* C25 — the real 6-step post-session report form, seeded with the tapped session */}
      <ReportScreen
        visible={!!reportFor}
        onClose={() => setReportFor(null)}
        session={reportFor ? {
          when: `${reportFor.day} · ${reportFor.time} → ${reportFor.end}`,
          place: reportFor.place,
          participants: Number.isFinite(reportParticipants) ? reportParticipants : undefined,
        } : undefined}
      />

      <NotificationCenter visible={notifOpen} onClose={() => setNotifOpen(false)} />
      <ProfileScreen visible={profileOpen} onClose={() => setProfileOpen(false)} />
    </SafeAreaView>
  );
}

/* ---------- styles ----------
   Polarity legend:
   · on the cream CANVAS  -> ON_CANVAS / ON_CANVAS_2 (dark)
   · inside the dark CARD  -> ON_CARD / ON_CARD_2 (light)
*/

const st = StyleSheet.create({
  /* header */
  appbar: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingTop: sp.sm, paddingBottom: sp.sm },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },
  title: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: ON_CANVAS, marginTop: 2 },
  // No background — the bell sits directly on the canvas; keep 44×44 for the tap target.
  iconBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 999,
    backgroundColor: color.action, borderWidth: 2, borderColor: CANVAS,
  },
  avatarWrap: {
    shadowColor: palette.bleu[300], shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: F.oswB, fontSize: 17, color: color.onAction },

  /* groups */
  group: { marginTop: sp.lg },
  // Day-pill header (ClassPass idiom) — a compact chip marking each day, with a session count.
  dayPill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: SUBTLE, borderRadius: r.pill, paddingVertical: 5, paddingHorizontal: 12,
    marginBottom: sp.sm,
  },
  dayPillTxt: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.6, color: ON_CANVAS },
  dayPillCount: { fontFamily: F.bodyB, fontSize: 12, color: ON_CANVAS_2 },

  /* session card — dark "component" on the cream canvas */
  // Flat session rows on the canvas — a light hairline divider separates consecutive entries.
  card: { paddingVertical: sp.md },
  cardDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  // tappable collapsed header: time rail · connector rule · (title / tag / address)
  headerTap: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm },

  /* time rail — fixed-width column: start time bold over the muted duration. */
  timeRail: { width: 50, alignItems: 'flex-start', paddingTop: 1 },
  railTime: { fontFamily: F.oswB, fontSize: 18, color: ON_CARD },
  railEnd: { fontFamily: F.body, fontSize: 12, color: palette.neutral[400], marginTop: 1 },
  // hairline connector tying the time rail to the session content
  railRule: { width: 2, borderRadius: 1, alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.09)', marginLeft: 2 },

  /* card content — title, status tag, then address (the collapsed default) */
  cardBody: { flex: 1 },
  place: { fontFamily: F.bodyS, fontSize: 18, color: ON_CARD },
  tagRow: { flexDirection: 'row', marginTop: 6, marginBottom: 6 },
  addr: { fontFamily: F.body, fontSize: 14, color: ON_CARD_2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  meta: { fontFamily: F.body, fontSize: 14, color: ON_CARD_2 },

  /* dropdown chevron + the expanded section it reveals */
  chevBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  expandWrap: { marginTop: sp.md },

  /* chips */
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipTxt: { fontFamily: F.body, fontSize: 12 },
  dot: { width: 8, height: 8, borderRadius: 999 },

  /* CTAs — shared vocabulary with Accueil: the gradient primary now comes from the reusable
     <PrimaryButton/> (gradient reserved for check-in); outline secondary, the gold report
     action, and a quiet "view" ghost stay local. */
  ctaRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.md },
  secondaryBtn: {
    flex: 1, minHeight: 44, borderRadius: r.pill, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  secondaryTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD },
  reportBtn: {
    flex: 1, minHeight: 44, borderRadius: r.pill, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', backgroundColor: palette.or[400],
  },
  reportTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: palette.neutral[900] },
  viewBtn: {
    flex: 1, minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: CARD_LIFT,
  },
  viewTxt: { fontFamily: F.bodyS, fontSize: 14, letterSpacing: 0.2, color: ON_CARD_2 },
  // checked-in confirmation — non-interactive, green-tinted to echo the status chip
  checkedInBadge: {
    flex: 1, minHeight: 44, borderRadius: r.pill, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,158,107,0.16)',
  },
  checkedInTxt: { fontFamily: F.bodyS, fontSize: 15, letterSpacing: 0.2, color: palette.vert[300] },

  /* ----- session detail (pageSheet) ----- */
  dHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  dHeaderTitle: { fontFamily: F.oswS, fontSize: 22, color: ON_CANVAS },
  dClose: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  dPlace: { fontFamily: F.bodyB, fontSize: 26, color: ON_CANVAS },
  // Flat info container — no box; rows sit directly on the surface.
  dCard: { marginTop: sp.lg },
  dRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: 10 },
  // Plain icon column (no chip background) — shared by the info rows and the manage rows.
  rowIcon: { width: 24, alignItems: 'center' },
  dRowLabel: { fontFamily: F.body, fontSize: 12, color: palette.neutral[500] },
  dRowValue: { fontFamily: F.bodyB, fontSize: 16, color: ON_CARD, marginTop: 2 },
  // Copy-address affordance on the Where row (PLA-02) — 44px target, inline "Copied" swap.
  dCopyBtn: {
    minWidth: 44, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingHorizontal: sp.xs,
  },
  dCopiedTxt: { fontFamily: F.bodyS, fontSize: 12, color: palette.vert[300] },

  /* action-required banner (Fresha idiom) */
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    marginTop: sp.md, paddingVertical: sp.md, paddingHorizontal: sp.md, borderRadius: r.lg,
  },
  bannerTxt: { flex: 1, fontFamily: F.bodyS, fontSize: 14, lineHeight: 19 },

  /* flat info list — no box, no dividers, rows sitting on the canvas */
  factList: { marginTop: sp.lg },

  /* pinned footer (CVS idiom) — the contextual primary action, kept below the scroll */
  footerBar: {
    // Block container (NOT a row) so SessionCta's own row stretches full-width and its
    // flex:1 buttons size correctly. SessionCta carries its own top margin; paddingBottom
    // is applied inline with the safe-area inset.
    paddingHorizontal: sp.lg, paddingTop: sp.xs,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', backgroundColor: CANVAS,
  },

  /* ----- manage group (per-session actions inside the detail sheet) ----- */
  manageTitle: {
    fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2,
    marginTop: sp.xl, marginBottom: sp.sm,
  },
  // Flat manage container — no box; rows sit directly on the surface.
  manageCard: {},
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: 10 },
  manageLabel: { flex: 1, fontFamily: F.bodyS, fontSize: 15 },

  /* ----- applications list + detail (C13) ----- */
  appHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm },
  empty: { fontFamily: F.body, fontSize: 14, color: ON_CANVAS_2, marginTop: sp.sm },
  appNote: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CANVAS_2, marginTop: sp.md },

  /* ----- transmission notes (C28) ----- */
  notesPlace: { fontFamily: F.bodyB, fontSize: 22, color: ON_CANVAS },
  notesIntro: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_CANVAS_2, marginTop: 4, marginBottom: sp.md },
  noteCard: {
    backgroundColor: CARD, borderRadius: r.xl, padding: sp.md, marginTop: sp.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  noteHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  noteAuthor: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD },
  noteDate: { fontFamily: F.body, fontSize: 12, color: palette.neutral[500] },
  noteText: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_CARD_2 },
  // composer pinned under the thread
  inputBar: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.md, gap: sp.sm,
  },
  noteInput: {
    minHeight: 48, maxHeight: 120, backgroundColor: CARD, borderRadius: r.lg,
    paddingHorizontal: sp.md, paddingTop: sp.sm, paddingBottom: sp.sm,
    fontFamily: F.body, fontSize: 15, color: ON_CARD,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  saveBtn: {
    minHeight: 44, borderRadius: r.pill, backgroundColor: color.action,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
});
