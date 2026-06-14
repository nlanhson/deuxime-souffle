/**
 * Coach · Post-session report (C25/C26) — the full-page form.
 *
 * Replaces the old "Start report" preview popup: the home banner and the Sessions
 * "Write report" CTA now open THIS straight away, so the coach lands on the real form,
 * not a teaser. Mirrors the WBS report (SESS-01): a participant stepper, an activities
 * multi-choice, three Yes/No questions (two reveal a text field), a 4-emoji participant
 * engagement scale, and a difficulty selector. Submitting validates the session and triggers
 * billing.
 *
 * Surface = coach (ink canvas, dark cards, light text inside them). Report accent = gold,
 * the same "needs attention" colour the home banner uses. UI text comes from ../copy.
 */
import React from 'react';
import {
  Modal, View, Text, ScrollView, Pressable, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Check, Minus, Plus, FileText, CheckCircle2, type LucideIcon } from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';

const S = surfaces.coach;
const CANVAS = S.canvas;                       // ink
const CARD = S.surface;                        // dark card
const FIELD = palette.neutral[900];            // recessed input well (darker than the card)
const DIVIDER = palette.neutral[700];
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];

// Report accent — gold, matching the home report banner. Plus a red "missing answer" tone.
const GOLD = { fg: palette.or[300], bg: 'rgba(242,194,0,0.13)', border: 'rgba(242,194,0,0.40)' };
const MISS = { fg: palette.rouge[300], border: 'rgba(232,82,72,0.55)' };

const F = {
  oswR: 'Oswald_400Regular',
  oswM: 'Oswald_500Medium',
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

const C = copy.report;

type Props = {
  visible: boolean;
  onClose: () => void;
  /** The session being reported — defaults to the mock home banner session. */
  session?: { when?: string; place?: string; participants?: number };
};

/* ---------- building blocks ---------- */

// One numbered question card. `missing` paints the gold number badge red when the
// coach tried to submit without answering — never colour alone (a "Required" word too).
function Question({
  n, label, help, missing, children,
}: {
  n: number; label: string; help?: string; missing?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={[st.q, missing && st.qMissing]}>
      <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.xl }]} pointerEvents="none" />
      <View style={st.qHead}>
        <View style={[st.qNum, missing && { backgroundColor: 'rgba(232,82,72,0.16)' }]}>
          <Text style={[st.qNumTxt, missing && { color: MISS.fg }]}>{n}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.qLabel}>{label}</Text>
          {help ? <Text style={st.qHelp}>{help}</Text> : null}
        </View>
        {missing ? <Text style={st.reqTag}>{C.required}</Text> : null}
      </View>
      <View style={st.qBody}>{children}</View>
    </View>
  );
}

// Yes / No segmented pair. value: true=yes, false=no, null=unanswered.
function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  const opt = (v: boolean, label: string) => {
    const on = value === v;
    return (
      <Pressable
        key={label}
        onPress={() => onChange(v)}
        style={[st.yn, on && st.ynOn]}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        accessibilityLabel={label}
      >
        {on ? <Check size={16} color={palette.neutral[900]} /> : null}
        <Text style={[st.ynTxt, on && st.ynTxtOn]}>{label}</Text>
      </Pressable>
    );
  };
  return <View style={st.ynRow}>{opt(true, C.yes)}{opt(false, C.no)}</View>;
}

// −  [N]  +  stepper. The middle number is also a tappable field: tap it to type a count
// directly. Clamped to >= 1 (a session with zero participants can't be reported).
function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(String(value));

  // Mirror the value into the field whenever it changes from outside (±buttons, form reset)
  // and the user isn't mid-edit, so all three controls always agree.
  React.useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  const step = (delta: number) => onChange(Math.max(1, value + delta));

  // Commit the typed value on blur/submit: empty or < 1 falls back to 1, so the field can
  // never be left invalid.
  const commit = () => {
    const n = parseInt(text, 10);
    const clamped = Number.isNaN(n) ? 1 : Math.max(1, n);
    onChange(clamped);
    setText(String(clamped));
    setEditing(false);
  };

  const Btn = ({ Icon, a11y, delta, disabled }: { Icon: LucideIcon; a11y: string; delta: number; disabled?: boolean }) => (
    <Pressable
      onPress={() => step(delta)}
      disabled={disabled}
      style={[st.stepBtn, disabled && { opacity: 0.4 }]}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      <Icon size={20} color={ON_CARD} />
    </Pressable>
  );

  return (
    <View style={st.stepper}>
      <Btn Icon={Minus} a11y={C.participants.minusA11y} delta={-1} disabled={value <= 1} />
      {/* The number IS the field — tapping the digits focuses it natively and opens the keypad
          (no Pressable wrapper, which would swallow the tap). */}
      <View style={st.stepValue}>
        <TextInput
          value={text}
          onChangeText={(t) => setText(t.replace(/[^0-9]/g, ''))}
          onFocus={() => setEditing(true)}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={3}
          selectTextOnFocus
          style={[st.stepNumInput, editing && st.stepNumInputActive]}
          accessibilityLabel={C.participants.label}
        />
        <Text style={st.stepUnit}>{C.participants.unit}</Text>
      </View>
      <Btn Icon={Plus} a11y={C.participants.plusA11y} delta={1} />
    </View>
  );
}

// Multi-choice chips (activities covered) — tap to toggle each on/off, pick as many as apply.
function Choice({ options, value, onToggle }: { options: readonly string[]; value: readonly string[]; onToggle: (v: string) => void }) {
  return (
    <View style={st.chips}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <Pressable
            key={o}
            onPress={() => onToggle(o)}
            style={[st.chip, on && st.chipOn]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
          >
            {on ? <Check size={15} color={GOLD.fg} style={{ marginRight: 6 }} /> : null}
            <Text style={[st.chipTxt, on && st.chipTxtOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Multiline note field (revealed under a "Yes").
function Note({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={ON_CARD_3}
      multiline
      style={st.input}
      textAlignVertical="top"
    />
  );
}

// Participant engagement (WBS SESS-01) — 4 emoji options, single-select. Each option is a
// card with its emoji + word; the chosen one carries the gold accent (never colour alone — the
// emoji + word + checked state all read it).
function Engagement({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <View style={st.engRow}>
      {C.engagement.levels.map((lvl, i) => {
        const on = value === i;
        return (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            style={[st.engCell, on && st.engCellOn]}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${C.engagement.a11y}: ${lvl.word}`}
          >
            <Text style={st.engEmoji}>{lvl.emoji}</Text>
            <Text style={[st.engWord, on && st.engWordOn]} numberOfLines={2}>{lvl.word}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Perceived session difficulty (WBS SESS-01) — Easy / Standard / Demanding, single-select pills.
function Difficulty({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <View style={st.diffRow}>
      {C.difficulty.options.map((opt, i) => {
        const on = value === i;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(i)}
            style={[st.diffPill, on && st.diffPillOn]}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${C.difficulty.a11y}: ${opt.word}`}
          >
            {on ? <Check size={15} color={GOLD.fg} style={{ marginRight: 6 }} /> : null}
            <Text style={[st.diffTxt, on && st.diffTxtOn]}>{opt.word}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- screen ---------- */

export function ReportScreen({ visible, onClose, session }: Props) {
  const insets = useSafeAreaInsets();

  // form state
  const [participants, setParticipants] = React.useState(session?.participants ?? 8);
  const [activities, setActivities] = React.useState<string[]>([]);
  const [flag, setFlag] = React.useState<boolean | null>(null);
  const [flagText, setFlagText] = React.useState('');
  const [nextNotes, setNextNotes] = React.useState<boolean | null>(null);
  const [nextText, setNextText] = React.useState('');
  const [readiness, setReadiness] = React.useState<boolean | null>(null);
  const [engagement, setEngagement] = React.useState<number | null>(null);
  const [difficulty, setDifficulty] = React.useState<number | null>(null);
  const [showErrors, setShowErrors] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const toggleActivity = (a: string) =>
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  // Required-field map (WBS: all steps required). q2 needs >= 1 activity; q3's text is optional;
  // q4's note is required only when the answer is "Yes" (the conditional reveal).
  const missing = {
    activity: activities.length === 0,
    flag: flag == null,
    nextNotes: nextNotes == null || (nextNotes && nextText.trim() === ''),
    readiness: readiness == null,
    engagement: engagement == null,
    difficulty: difficulty == null,
  };
  const incomplete = Object.values(missing).some(Boolean);

  // Reset everything when the sheet is dismissed, so the next open starts clean.
  const handleClose = () => {
    setParticipants(session?.participants ?? 8);
    setActivities([]); setFlag(null); setFlagText('');
    setNextNotes(null); setNextText(''); setReadiness(null);
    setEngagement(null); setDifficulty(null);
    setShowErrors(false); setSubmitted(false);
    onClose();
  };

  const handleSubmit = () => {
    if (incomplete) { setShowErrors(true); return; }
    setSubmitted(true);
  };

  const err = (k: keyof typeof missing) => showErrors && missing[k];
  const when = session?.when ?? C.session;
  const place = session?.place ?? C.place;

  return (
    <Modal visible={visible} onRequestClose={handleClose} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        {/* header */}
        <View style={st.header}>
          <View style={{ flex: 1 }}>
            <Text style={st.eyebrow}>{C.eyebrow}</Text>
            <Text style={st.title} numberOfLines={1}>{place}</Text>
          </View>
          <Pressable onPress={handleClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={C.closeA11y}>
            <X size={22} color={ON_CARD} />
          </Pressable>
        </View>

        {submitted ? (
          /* ----- confirmation ----- */
          <View style={st.donePad}>
            <View style={st.doneIcon}>
              <CheckCircle2 size={40} color={palette.vert[300]} />
            </View>
            <Text style={st.doneTitle}>{C.done.title}</Text>
            <Text style={st.doneBody}>{C.done.body}</Text>
            <PrimaryButton label={C.done.cta} onPress={handleClose} style={{ alignSelf: 'stretch', marginTop: sp.lg }} />
          </View>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          >
            <ScrollView
              contentContainerStyle={{ padding: sp.lg, paddingBottom: sp.xl }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* intro line */}
              <View style={st.intro}>
                <View style={st.introIcon}><FileText size={18} color={GOLD.fg} /></View>
                <Text style={st.introTxt}>{when} · {C.intro}</Text>
              </View>

              {/* 1 · participants */}
              <Question n={1} label={C.participants.label} help={C.participants.help}>
                <Stepper value={participants} onChange={setParticipants} />
              </Question>

              {/* 2 · activities */}
              <Question n={2} label={C.activities.label} help={C.activities.help} missing={err('activity')}>
                <Choice options={C.activities.options} value={activities} onToggle={toggleActivity} />
              </Question>

              {/* 3 · flag to facility (Yes reveals an optional message) */}
              <Question n={3} label={C.flag.label} help={C.flag.help} missing={err('flag')}>
                <YesNo value={flag} onChange={setFlag} />
                {flag ? <Note value={flagText} onChange={setFlagText} placeholder={C.flag.placeholder} /> : null}
              </Question>

              {/* 4 · notes for next session (Yes reveals a REQUIRED note) */}
              <Question n={4} label={C.nextNotes.label} help={C.nextNotes.help} missing={err('nextNotes')}>
                <YesNo value={nextNotes} onChange={setNextNotes} />
                {nextNotes ? <Note value={nextText} onChange={setNextText} placeholder={C.nextNotes.placeholder} /> : null}
              </Question>

              {/* 5 · facility readiness */}
              <Question n={5} label={C.readiness.label} help={C.readiness.help} missing={err('readiness')}>
                <YesNo value={readiness} onChange={setReadiness} />
              </Question>

              {/* 6 · participant engagement (4 emoji options) */}
              <Question n={6} label={C.engagement.label} help={C.engagement.help} missing={err('engagement')}>
                <Engagement value={engagement} onChange={setEngagement} />
              </Question>

              {/* 7 · perceived session difficulty */}
              <Question n={7} label={C.difficulty.label} help={C.difficulty.help} missing={err('difficulty')}>
                <Difficulty value={difficulty} onChange={setDifficulty} />
              </Question>
            </ScrollView>

            {/* sticky submit bar */}
            <View style={[st.footer, { paddingBottom: Math.max(insets.bottom, sp.md) }]}>
              {showErrors && incomplete ? <Text style={st.footerErr}>{C.incomplete}</Text> : null}
              <PrimaryButton label={C.submit} onPress={handleSubmit} style={{ alignSelf: 'stretch' }} />
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  );
}

/* ---------- styles ---------- */

const st = StyleSheet.create({
  /* header */
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
    borderBottomWidth: 1, borderBottomColor: DIVIDER,
  },
  eyebrow: { fontFamily: F.oswM, fontSize: 12, letterSpacing: 0.8, color: GOLD.fg },
  title: { fontFamily: F.oswS, fontSize: 24, color: ON_CARD, marginTop: 2 },
  close: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[800],
  },

  /* intro */
  intro: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: GOLD.bg, borderColor: GOLD.border, borderWidth: 1,
    borderRadius: r.lg, padding: sp.md, marginBottom: sp.lg,
  },
  introIcon: { width: 28, alignItems: 'center' },
  introTxt: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_CARD_2 },

  /* question card */
  q: {
    backgroundColor: CARD, borderRadius: r.xl, padding: sp.lg, marginBottom: sp.md,
    // shadcn-style hairline by default; the validation highlight overrides borderColor when missing.
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  qMissing: { borderColor: MISS.border },
  qHead: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm },
  qNum: {
    width: 26, height: 26, borderRadius: 999, marginTop: 1,
    backgroundColor: GOLD.bg, alignItems: 'center', justifyContent: 'center',
  },
  qNumTxt: { fontFamily: F.oswS, fontSize: 14, color: GOLD.fg },
  qLabel: { fontFamily: F.oswS, fontSize: 17, color: ON_CARD },
  qHelp: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: ON_CARD_3, marginTop: 2 },
  reqTag: { fontFamily: F.bodyS, fontSize: 11, letterSpacing: 0.6, color: MISS.fg, marginTop: 4 },
  qBody: { marginTop: sp.md },

  /* yes / no */
  ynRow: { flexDirection: 'row', gap: sp.sm },
  yn: {
    flex: 1, minHeight: 48, borderRadius: r.pill, flexDirection: 'row', gap: 6,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  ynOn: { backgroundColor: palette.neutral[50], borderColor: palette.neutral[50] },
  ynTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD },
  ynTxtOn: { color: palette.neutral[900] },

  /* stepper */
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  stepValue: { alignItems: 'center' },
  // The number is an editable field — a subtle underline signals "tap to type", and it
  // brightens to the gold accent while focused (matching the form's other inputs).
  stepNumInput: {
    // No lineHeight: on iOS a TextInput vertically centres single-line text within its
    // height, but a tall lineHeight top-aligns the glyph (the "sitting too high" bug).
    fontFamily: F.oswB, fontSize: 40, color: ON_CARD,
    textAlign: 'center', textAlignVertical: 'center', height: 56,
    minWidth: 96, paddingVertical: 0, paddingHorizontal: sp.sm,
    borderBottomWidth: 1.5, borderBottomColor: palette.neutral[700],
  },
  stepNumInputActive: { borderBottomColor: GOLD.fg },
  stepUnit: { fontFamily: F.body, fontSize: 13, color: ON_CARD_3, marginTop: 4 },

  /* choice chips */
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  chip: {
    minHeight: 44, paddingHorizontal: sp.md, borderRadius: r.pill,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  chipOn: { backgroundColor: GOLD.bg, borderColor: GOLD.fg },
  chipTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  chipTxtOn: { color: GOLD.fg },

  /* note input */
  input: {
    marginTop: sp.sm, minHeight: 88, borderRadius: r.lg, padding: sp.md,
    backgroundColor: FIELD, borderWidth: 1, borderColor: DIVIDER,
    fontFamily: F.body, fontSize: 15, lineHeight: 21, color: ON_CARD,
  },

  /* engagement (4 emoji options) */
  engRow: { flexDirection: 'row', gap: sp.sm },
  engCell: {
    flex: 1, paddingVertical: sp.md, paddingHorizontal: 4, borderRadius: r.lg,
    alignItems: 'center', justifyContent: 'flex-start', gap: 6, minHeight: 92,
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  engCellOn: { backgroundColor: GOLD.bg, borderColor: GOLD.fg },
  engEmoji: { fontSize: 26 },
  engWord: { fontFamily: F.bodyS, fontSize: 12, lineHeight: 16, color: ON_CARD_2, textAlign: 'center' },
  engWordOn: { color: GOLD.fg },

  /* difficulty (3 pills) */
  diffRow: { flexDirection: 'row', gap: sp.sm },
  diffPill: {
    flex: 1, minHeight: 48, borderRadius: r.pill, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[600],
  },
  diffPillOn: { backgroundColor: GOLD.bg, borderColor: GOLD.fg },
  diffTxt: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD_2 },
  diffTxtOn: { color: GOLD.fg },

  /* footer */
  footer: {
    paddingHorizontal: sp.lg, paddingTop: sp.md, gap: sp.sm,
    borderTopWidth: 1, borderTopColor: DIVIDER, backgroundColor: CANVAS,
  },
  footerErr: { fontFamily: F.bodyS, fontSize: 13, color: MISS.fg, textAlign: 'center' },

  /* confirmation */
  donePad: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sp.xl },
  doneIcon: {
    width: 80, height: 80, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(47,158,107,0.16)',
  },
  doneTitle: { fontFamily: F.oswS, fontSize: 26, color: ON_CARD, marginTop: sp.lg },
  doneBody: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CARD_2, textAlign: 'center', marginTop: sp.sm },
});
