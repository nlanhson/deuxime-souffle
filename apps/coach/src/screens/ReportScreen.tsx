/**
 * Coach · Post-session report (C25/C26 · WBS SESS-01) — the full 3-step form.
 *
 * Built to the WBS "SESS-01 revised" story + the client mockup, which specify a THREE-STEP report:
 *   Step 1 — Résumé: participant count (default 8, count only), activities, facility readiness,
 *            participant dynamism (4 emoji), perceived difficulty (3 levels), and an overall
 *            "bilan" — ✓ Rien à signaler / ⚠ Point de vigilance (the field that triggers the admin
 *            alert; a drawback reveals a required detail). A 48h speed-bonus reminder rides here.
 *   Step 2 — À transmettre: the THREE distinct, optional, confidential recipients, each a toggle +
 *            a 200-char message — 🏥 EHPAD coordinator (EHPAD-only) · 👥 DS team (DS-only, never the
 *            EHPAD) · 📝 next coach (handover). Each names who can see it.
 *   Step 3 — Confirmation: validated + billing, the "✓ Bonus rapidité obtenu" box, and a routing
 *            recap of who received what.
 *
 * Replaces the old single-scroll form. Opened from the Sessions "Write report" CTA / session detail.
 * Surface = coach (paper canvas, white cards, dark text). Report accent = gold (the "needs attention"
 * colour the home report banner uses) + a red "missing answer" tone. Step transitions are instant
 * content swaps (no slide) — nothing to suppress under reduced motion. UI text comes from ../copy
 * (FR; this screen isn't translated yet — copy.en has no `report` block, same as before).
 */
import React from 'react';
import {
  Modal, View, Text, ScrollView, Pressable, TextInput, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardInset } from '../lib/useKeyboardInset';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, Check, Minus, Plus, CheckCircle2, AlertTriangle, Clock, Building2, ShieldCheck, StickyNote,
  type LucideIcon,
} from '../icons';

import { palette, color, spacing as sp, radius as r, cardShape, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { PrimaryButton } from '../components/PrimaryButton';
import { recordSessionCompleted } from '../lib/badgeCelebration';

const S = surfaces.coach;
const CANVAS = S.canvas;                       // paper
const CARD = S.surface;                        // white card
const FIELD = palette.neutral[100];            // recessed input well
const DIVIDER = palette.neutral[200];
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const ON_CARD_3 = palette.neutral[600];

// Report accent — gold, matching the home report banner. Plus a red "missing answer" tone and a
// green "good / done" tone (confirmation + the speed-bonus-earned box).
const GOLD = { fg: palette.or[800], bg: 'rgba(242,194,0,0.13)', border: 'rgba(242,194,0,0.40)' };
const MISS = { fg: palette.rouge[600], border: 'rgba(232,82,72,0.55)' };
const OK = { fg: palette.vert[700], bg: 'rgba(47,158,107,0.16)' };

const F = {
  oswR: 'Oswald_400Regular',
  oswM: 'Oswald_500Medium',
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

const C = copy.report;

const STEPS = ['summary', 'recipients', 'confirm'] as const;
type Step = (typeof STEPS)[number];

type Props = {
  visible: boolean;
  onClose: () => void;
  /** The session being reported — defaults to the mock home banner session. */
  session?: { when?: string; place?: string; participants?: number };
};

/* ---------- building blocks ---------- */

// One numbered question card. `missing` paints the gold number badge red when the coach tried to
// submit without answering — never colour alone (a "Required" word too).
function Question({
  n, label, help, missing, children,
}: {
  n: number; label: string; help?: string; missing?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={[st.q, missing && st.qMissing]}>
      <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, cardShape]} pointerEvents="none" />
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
        {on ? <Check size={16} color={palette.neutral[0]} /> : null}
        <Text style={[st.ynTxt, on && st.ynTxtOn]}>{label}</Text>
      </Pressable>
    );
  };
  return <View style={st.ynRow}>{opt(true, C.yes)}{opt(false, C.no)}</View>;
}

// −  [N]  +  stepper. The middle number is also a tappable field: tap to type a count directly.
// Clamped to >= 1 (a session with zero participants can't be reported).
function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [editing, setEditing] = React.useState(false);
  const [text, setText] = React.useState(String(value));

  React.useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);

  const step = (delta: number) => onChange(Math.max(1, value + delta));

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

// Multiline note field (e.g. the drawback detail). Plain — no character cap.
function Note({ value, onChange, placeholder, a11y }: { value: string; onChange: (v: string) => void; placeholder: string; a11y?: string }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={ON_CARD_3}
      multiline
      style={st.input}
      textAlignVertical="top"
      accessibilityLabel={a11y}
    />
  );
}

// Participant dynamism / engagement (SESS-01) — 4 emoji options, single-select. The chosen one
// carries the gold accent (never colour alone — the emoji + word + checked state all read it).
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

// Perceived session difficulty (SESS-01) — Easy / Standard / Demanding, single-select pills.
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

// Overall "bilan" (SESS-01 Step 1 Q4) — the binary that triggers the admin alert: ✓ Rien à signaler
// / ⚠ Point de vigilance. Green for OK, red for vigilance (icon + word, never colour alone).
function Bilan({ value, onChange }: { value: 'ok' | 'issue' | null; onChange: (v: 'ok' | 'issue') => void }) {
  const cell = (v: 'ok' | 'issue', label: string, Icon: LucideIcon, tone: { fg: string; bg: string; border: string }) => {
    const on = value === v;
    return (
      <Pressable
        onPress={() => onChange(v)}
        style={[st.bilanCell, on && { backgroundColor: tone.bg, borderColor: tone.border }]}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        accessibilityLabel={label}
      >
        <Icon size={18} color={on ? tone.fg : ON_CARD_2} />
        <Text style={[st.bilanTxt, on && { color: tone.fg }]}>{label}</Text>
      </Pressable>
    );
  };
  return (
    <View style={st.bilanRow}>
      {cell('ok', C.bilan.ok, Check, { fg: OK.fg, bg: OK.bg, border: 'rgba(47,158,107,0.5)' })}
      {cell('issue', C.bilan.issue, AlertTriangle, { fg: palette.rouge[600], bg: 'rgba(232,82,72,0.12)', border: MISS.border })}
    </View>
  );
}

// On/off switch (SESS-01 Step 2 toggles). State reads by KNOB POSITION + accessibility role, not
// colour alone. Instant — no knob animation, so nothing to suppress under reduced motion.
function Toggle({ on, onChange, a11y }: { on: boolean; onChange: (v: boolean) => void; a11y: string }) {
  return (
    <Pressable
      onPress={() => onChange(!on)}
      hitSlop={8}
      style={[st.track, on && st.trackOn]}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={a11y}
    >
      <View style={[st.knob, on && st.knobOn]} />
    </Pressable>
  );
}

// One confidential recipient (SESS-01 Step 2): header (icon · title · who-sees-it) + a toggle that
// reveals a 200-char message with a live counter. `missing` flags an enabled-but-empty message.
function Recipient({
  Icon, title, audience, help, placeholder, max, on, value, onToggle, onChange, missing, missingMsg, toggleA11y,
}: {
  Icon: LucideIcon; title: string; audience: string; help: string; placeholder: string; max: number;
  on: boolean; value: string; onToggle: (v: boolean) => void; onChange: (v: string) => void;
  missing?: boolean; missingMsg: string; toggleA11y: string;
}) {
  const len = value.length;
  return (
    <View style={[st.rcCard, missing && st.qMissing]}>
      <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, cardShape]} pointerEvents="none" />
      <View style={st.rcHead}>
        <View style={st.rcIcon}><Icon size={18} color={ON_CARD_2} /></View>
        <View style={{ flex: 1 }}>
          <Text style={st.rcTitle}>{title}</Text>
          <Text style={st.rcAudience}>{audience}</Text>
        </View>
        <Toggle on={on} onChange={onToggle} a11y={toggleA11y} />
      </View>
      {on ? (
        <View style={st.rcBody}>
          <Text style={st.rcHelp}>{help}</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={ON_CARD_3}
            multiline
            maxLength={max}
            style={st.input}
            textAlignVertical="top"
            accessibilityLabel={title}
          />
          <View style={st.rcFootRow}>
            {missing ? <Text style={st.rcMissing}>{missingMsg}</Text> : <View style={{ flex: 1 }} />}
            <Text style={[st.rcCounter, len >= max && { color: MISS.fg }]}>{`${len} / ${max}`}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

// Step indicator — progress dots + a spoken "Étape N sur 3 : Label" line (mirrors AbsenceModal).
function StepHeader({ index }: { index: number }) {
  return (
    <View style={st.stepHead} accessibilityLiveRegion="polite">
      <View style={st.dots}>
        {STEPS.map((s, i) => (
          <View key={s} style={[st.stepDot, i <= index && st.stepDotOn]} />
        ))}
      </View>
      <Text style={st.stepTxt}>
        {`${C.stepPrefix} ${index + 1} ${C.stepOf} ${STEPS.length} : ${C.steps[STEPS[index]]}`}
      </Text>
    </View>
  );
}

/* ---------- screen ---------- */

export function ReportScreen({ visible, onClose, session }: Props) {
  const insets = useSafeAreaInsets();
  const kb = useKeyboardInset();

  const [step, setStep] = React.useState<Step>('summary');

  // Step 1 — résumé
  const [participants, setParticipants] = React.useState(session?.participants ?? 8);
  const [activities, setActivities] = React.useState<string[]>([]);
  const [ready, setReady] = React.useState<boolean | null>(null);
  const [engagement, setEngagement] = React.useState<number | null>(null);
  const [difficulty, setDifficulty] = React.useState<number | null>(null);
  const [bilan, setBilan] = React.useState<'ok' | 'issue' | null>(null);
  const [bilanDetail, setBilanDetail] = React.useState('');

  // Step 2 — recipients (each optional)
  const [coordOn, setCoordOn] = React.useState(false);
  const [coordMsg, setCoordMsg] = React.useState('');
  const [dsOn, setDsOn] = React.useState(false);
  const [dsMsg, setDsMsg] = React.useState('');
  const [nextOn, setNextOn] = React.useState(false);
  const [nextMsg, setNextMsg] = React.useState('');

  const [showErrors, setShowErrors] = React.useState(false);

  const toggleActivity = (a: string) =>
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const MAX = C.recipients.max;

  // Per-step required maps. Step 1: all questions required; the bilan detail is required only when
  // "point de vigilance" is chosen (the conditional reveal). Step 2: an enabled toggle must carry
  // a non-empty message (else turn it off) — everything is otherwise optional.
  const missingSummary = {
    activity: activities.length === 0,
    ready: ready == null,
    engagement: engagement == null,
    difficulty: difficulty == null,
    bilan: bilan == null,
    bilanDetail: bilan === 'issue' && bilanDetail.trim() === '',
  };
  const missingRecipients = {
    coord: coordOn && coordMsg.trim() === '',
    ds: dsOn && dsMsg.trim() === '',
    next: nextOn && nextMsg.trim() === '',
  };
  const summaryIncomplete = Object.values(missingSummary).some(Boolean);
  const recipientsIncomplete = Object.values(missingRecipients).some(Boolean);

  const reset = () => {
    setStep('summary');
    setParticipants(session?.participants ?? 8);
    setActivities([]); setReady(null); setEngagement(null); setDifficulty(null);
    setBilan(null); setBilanDetail('');
    setCoordOn(false); setCoordMsg(''); setDsOn(false); setDsMsg(''); setNextOn(false); setNextMsg('');
    setShowErrors(false);
  };

  const handleClose = () => {
    // A report that reached the confirmation step was actually sent → it's one completed session.
    // (Closing from an earlier step is an abandoned draft and earns nothing.) Recording it grows the
    // lifetime count and, when this is the coach's 100th session, queues the badge celebration —
    // which surfaces once this sheet has slid away.
    if (step === 'confirm') void recordSessionCompleted();
    reset();
    onClose();
  };

  // Continue / send / back. Advancing validates the current step; the final send moves to the
  // confirmation step.
  const onPrimary = () => {
    if (step === 'summary') {
      if (summaryIncomplete) { setShowErrors(true); return; }
      setShowErrors(false);
      setStep('recipients');
    } else if (step === 'recipients') {
      if (recipientsIncomplete) { setShowErrors(true); return; }
      setShowErrors(false);
      setStep('confirm');
    }
  };
  const onBack = () => {
    setShowErrors(false);
    if (step === 'recipients') setStep('summary');
  };

  const errS = (k: keyof typeof missingSummary) => showErrors && missingSummary[k];
  const place = session?.place ?? C.place;
  const when = session?.when ?? C.session;
  const stepIndex = STEPS.indexOf(step);

  // Which recipients actually received a message — drives the confirmation routing recap.
  const sentCoord = coordOn && coordMsg.trim() !== '';
  const sentDs = dsOn && dsMsg.trim() !== '';
  const sentNext = nextOn && nextMsg.trim() !== '';
  const anyRouting = sentCoord || sentDs || sentNext;

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

        {step === 'confirm' ? (
          /* ===== Step 3 · confirmation ===== */
          <ScrollView contentContainerStyle={st.donePad} showsVerticalScrollIndicator={false}>
            <View style={st.doneIcon}>
              <CheckCircle2 size={40} color={palette.vert[700]} />
            </View>
            <Text style={st.doneTitle}>{C.done.title}</Text>
            <Text style={st.doneBody}>{C.done.body}</Text>

            {/* Speed-bonus-earned box (prototype: always within 48h). */}
            <View style={st.bonusBox}>
              <View style={st.bonusIcon}><Clock size={18} color={OK.fg} /></View>
              <View style={{ flex: 1 }}>
                <Text style={st.bonusTitle}>{C.done.bonusTitle}</Text>
                <Text style={st.bonusBody}>{C.done.bonusBody}</Text>
              </View>
            </View>

            {/* Routing recap — who received what (only the recipients actually messaged). */}
            {anyRouting ? (
              <View style={st.routing}>
                <Text style={st.routingTitle}>{C.done.routingTitle}</Text>
                {sentCoord ? <RouteRow Icon={Building2} text={C.done.routing.coordinator} /> : null}
                {sentDs ? <RouteRow Icon={ShieldCheck} text={C.done.routing.ds} /> : null}
                {sentNext ? <RouteRow Icon={StickyNote} text={C.done.routing.nextCoach} /> : null}
              </View>
            ) : null}

            <PrimaryButton label={C.done.cta} onPress={handleClose} style={{ alignSelf: 'stretch', marginTop: sp.xl }} />
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingBottom: kb }}>
            <ScrollView
              contentContainerStyle={{ padding: sp.lg, paddingBottom: sp.xl }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <StepHeader index={stepIndex} />

              {step === 'summary' ? (
                <>
                  <Text style={st.intro}>{when} · {C.intro}</Text>

                  {/* 48h speed-bonus reminder (SESS-01) */}
                  <View style={st.bonusBanner}>
                    <View style={st.bonusBannerIcon}><Clock size={18} color={GOLD.fg} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.bonusBannerTitle}>{C.speedBonus.title}</Text>
                      <Text style={st.bonusBannerBody}>{C.speedBonus.body} {C.speedBonus.remaining}</Text>
                    </View>
                  </View>

                  <Question n={1} label={C.participants.label} help={C.participants.help}>
                    <Stepper value={participants} onChange={setParticipants} />
                  </Question>

                  <Question n={2} label={C.activities.label} help={C.activities.help} missing={errS('activity')}>
                    <Choice options={C.activities.options} value={activities} onToggle={toggleActivity} />
                  </Question>

                  <Question n={3} label={C.readiness.label} help={C.readiness.help} missing={errS('ready')}>
                    <YesNo value={ready} onChange={setReady} />
                  </Question>

                  <Question n={4} label={C.engagement.label} help={C.engagement.help} missing={errS('engagement')}>
                    <Engagement value={engagement} onChange={setEngagement} />
                  </Question>

                  <Question n={5} label={C.difficulty.label} help={C.difficulty.help} missing={errS('difficulty')}>
                    <Difficulty value={difficulty} onChange={setDifficulty} />
                  </Question>

                  {/* 6 · overall bilan (alert trigger); a vigilance reveals a required detail */}
                  <Question n={6} label={C.bilan.label} help={C.bilan.help} missing={errS('bilan') || errS('bilanDetail')}>
                    <Bilan value={bilan} onChange={setBilan} />
                    {bilan === 'issue' ? (
                      <Note value={bilanDetail} onChange={setBilanDetail} placeholder={C.bilan.detailPlaceholder} a11y={C.bilan.detailLabel} />
                    ) : null}
                  </Question>
                </>
              ) : (
                /* ===== Step 2 · à transmettre (3 confidential recipients) ===== */
                <>
                  <Text style={st.intro}>{C.recipients.intro}</Text>

                  <Recipient
                    Icon={Building2}
                    title={C.recipients.coordinator.title}
                    audience={C.recipients.coordinator.audience}
                    help={C.recipients.coordinator.help}
                    placeholder={C.recipients.coordinator.placeholder}
                    toggleA11y={C.recipients.coordinator.toggleA11y}
                    max={MAX}
                    on={coordOn} value={coordMsg}
                    onToggle={(v) => { setCoordOn(v); if (showErrors) setShowErrors(false); }}
                    onChange={setCoordMsg}
                    missing={showErrors && missingRecipients.coord}
                    missingMsg={C.recipients.emptyEnabled}
                  />
                  <Recipient
                    Icon={ShieldCheck}
                    title={C.recipients.ds.title}
                    audience={C.recipients.ds.audience}
                    help={C.recipients.ds.help}
                    placeholder={C.recipients.ds.placeholder}
                    toggleA11y={C.recipients.ds.toggleA11y}
                    max={MAX}
                    on={dsOn} value={dsMsg}
                    onToggle={(v) => { setDsOn(v); if (showErrors) setShowErrors(false); }}
                    onChange={setDsMsg}
                    missing={showErrors && missingRecipients.ds}
                    missingMsg={C.recipients.emptyEnabled}
                  />
                  <Recipient
                    Icon={StickyNote}
                    title={C.recipients.nextCoach.title}
                    audience={C.recipients.nextCoach.audience}
                    help={C.recipients.nextCoach.help}
                    placeholder={C.recipients.nextCoach.placeholder}
                    toggleA11y={C.recipients.nextCoach.toggleA11y}
                    max={MAX}
                    on={nextOn} value={nextMsg}
                    onToggle={(v) => { setNextOn(v); if (showErrors) setShowErrors(false); }}
                    onChange={setNextMsg}
                    missing={showErrors && missingRecipients.next}
                    missingMsg={C.recipients.emptyEnabled}
                  />
                </>
              )}
            </ScrollView>

            {/* footer — back (from step 2) + continue / send */}
            <View style={[st.footer, { paddingBottom: Math.max(insets.bottom, sp.md) }]}>
              {showErrors && (step === 'summary' ? summaryIncomplete : recipientsIncomplete) ? (
                <Text style={st.footerErr}>{C.incomplete}</Text>
              ) : null}
              <View style={st.footerRow}>
                {step === 'recipients' ? (
                  <Pressable style={({ pressed }) => [st.backBtn, pressed && { opacity: 0.7 }]} onPress={onBack} accessibilityRole="button">
                    <Text style={st.backTxt}>{C.back}</Text>
                  </Pressable>
                ) : null}
                <PrimaryButton
                  label={step === 'recipients' ? C.submit : C.continue}
                  onPress={onPrimary}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

function RouteRow({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <View style={st.routeRow}>
      <Icon size={16} color={ON_CARD_2} />
      <Text style={st.routeTxt}>{text}</Text>
    </View>
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
  eyebrow: { fontFamily: F.oswM, fontSize: 13, letterSpacing: 0.8, color: GOLD.fg },
  title: { fontFamily: F.oswS, fontSize: 24, color: ON_CARD, marginTop: 2 },
  close: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100],
  },

  /* step header */
  stepHead: { marginBottom: sp.md },
  dots: { flexDirection: 'row', gap: 6 },
  stepDot: { flex: 1, height: 4, borderRadius: 999, backgroundColor: palette.neutral[200] },
  stepDotOn: { backgroundColor: GOLD.fg },
  stepTxt: { fontFamily: F.oswS, fontSize: 14, letterSpacing: 0.3, color: ON_CARD, marginTop: sp.sm },

  /* intro */
  intro: { fontFamily: F.body, fontSize: 16, lineHeight: 20, color: ON_CARD_2, marginBottom: sp.md },

  /* speed-bonus banner (step 1) */
  bonusBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm,
    backgroundColor: GOLD.bg, borderColor: GOLD.border, borderWidth: 1,
    ...cardShape, padding: sp.md, marginBottom: sp.lg,
  },
  bonusBannerIcon: { width: 28, alignItems: 'center', marginTop: 1 },
  bonusBannerTitle: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD },
  bonusBannerBody: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CARD_2, marginTop: 2 },

  /* question card */
  q: {
    backgroundColor: CARD, ...cardShape, padding: sp.lg, marginBottom: sp.md,
    borderWidth: 1, borderColor: 'rgba(24,23,21,0.07)',
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
  reqTag: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.6, color: MISS.fg, marginTop: 4 },
  qBody: { marginTop: sp.md },

  /* yes / no */
  ynRow: { flexDirection: 'row', gap: sp.sm },
  yn: {
    flex: 1, minHeight: 48, borderRadius: r.button, flexDirection: 'row', gap: 6,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[200],
  },
  ynOn: { backgroundColor: palette.neutral[900], borderColor: palette.neutral[900] },
  ynTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD },
  ynTxtOn: { color: palette.neutral[0] },

  /* stepper */
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[200],
  },
  stepValue: { alignItems: 'center' },
  stepNumInput: {
    fontFamily: F.oswB, fontSize: 40, color: ON_CARD,
    textAlign: 'center', textAlignVertical: 'center', height: 56,
    minWidth: 96, paddingVertical: 0, paddingHorizontal: sp.sm,
    borderBottomWidth: 1.5, borderBottomColor: palette.neutral[200],
  },
  stepNumInputActive: { borderBottomColor: GOLD.fg },
  stepUnit: { fontFamily: F.body, fontSize: 13, color: ON_CARD_3, marginTop: 4 },

  /* choice chips */
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  chip: {
    minHeight: 44, paddingHorizontal: sp.md, borderRadius: r.button,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[200],
  },
  chipOn: { backgroundColor: GOLD.bg, borderColor: GOLD.fg },
  chipTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  chipTxtOn: { color: GOLD.fg },

  /* note / message input */
  input: {
    marginTop: sp.sm, minHeight: 88, borderRadius: r.lg, padding: sp.md,
    backgroundColor: FIELD, borderWidth: 1, borderColor: DIVIDER,
    fontFamily: F.body, fontSize: 16, lineHeight: 21, color: ON_CARD,
  },

  /* engagement (4 emoji options) */
  engRow: { flexDirection: 'row', gap: sp.sm },
  engCell: {
    flex: 1, paddingVertical: sp.md, paddingHorizontal: 4, borderRadius: r.lg,
    alignItems: 'center', justifyContent: 'flex-start', gap: 6, minHeight: 92,
    borderWidth: 1.5, borderColor: palette.neutral[200],
  },
  engCellOn: { backgroundColor: GOLD.bg, borderColor: GOLD.fg },
  engEmoji: { fontSize: 26 },
  engWord: { fontFamily: F.bodyS, fontSize: 13, lineHeight: 16, color: ON_CARD_2, textAlign: 'center' },
  engWordOn: { color: GOLD.fg },

  /* difficulty (3 pills) */
  diffRow: { flexDirection: 'row', gap: sp.sm },
  diffPill: {
    flex: 1, minHeight: 48, borderRadius: r.button, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[200],
  },
  diffPillOn: { backgroundColor: GOLD.bg, borderColor: GOLD.fg },
  diffTxt: { fontFamily: F.bodyS, fontSize: 16, color: ON_CARD_2 },
  diffTxtOn: { color: GOLD.fg },

  /* bilan (ok / vigilance) */
  bilanRow: { flexDirection: 'row', gap: sp.sm },
  bilanCell: {
    flex: 1, minHeight: 56, borderRadius: r.lg, flexDirection: 'row', gap: 8,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: sp.sm,
    borderWidth: 1.5, borderColor: palette.neutral[200],
  },
  bilanTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2, textAlign: 'center' },

  /* recipient card (step 2) */
  rcCard: {
    backgroundColor: CARD, ...cardShape, padding: sp.lg, marginBottom: sp.md,
    borderWidth: 1, borderColor: 'rgba(24,23,21,0.07)',
  },
  rcHead: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  rcIcon: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[100],
  },
  rcTitle: { fontFamily: F.oswS, fontSize: 16, color: ON_CARD },
  rcAudience: { fontFamily: F.body, fontSize: 13, lineHeight: 16, color: ON_CARD_3, marginTop: 2 },
  rcBody: { marginTop: sp.md },
  rcHelp: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: ON_CARD_3 },
  rcFootRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: 6 },
  rcMissing: { flex: 1, fontFamily: F.bodyS, fontSize: 13, color: MISS.fg },
  rcCounter: { fontFamily: F.body, fontSize: 13, color: ON_CARD_3, marginLeft: 'auto' },

  /* toggle switch */
  track: {
    width: 48, height: 28, borderRadius: 999, padding: 2, justifyContent: 'center',
    backgroundColor: palette.neutral[300],
  },
  trackOn: { backgroundColor: GOLD.fg },
  knob: {
    width: 24, height: 24, borderRadius: 999, backgroundColor: palette.neutral[0],
    borderWidth: 1, borderColor: 'rgba(24,23,21,0.12)', alignSelf: 'flex-start',
  },
  knobOn: { alignSelf: 'flex-end' },

  /* footer */
  footer: {
    paddingHorizontal: sp.lg, paddingTop: sp.md, gap: sp.sm,
    borderTopWidth: 1, borderTopColor: DIVIDER, backgroundColor: CANVAS,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  footerErr: { fontFamily: F.bodyS, fontSize: 13, color: MISS.fg, textAlign: 'center' },
  backBtn: { minHeight: 48, paddingHorizontal: sp.lg, borderRadius: r.button, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: palette.neutral[200] },
  backTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD_2 },

  /* confirmation */
  donePad: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: sp.xl, paddingVertical: sp.xl },
  doneIcon: {
    width: 80, height: 80, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(47,158,107,0.16)',
  },
  doneTitle: { fontFamily: F.oswS, fontSize: 26, color: ON_CARD, marginTop: sp.lg, textAlign: 'center' },
  doneBody: { fontFamily: F.body, fontSize: 16, lineHeight: 22, color: ON_CARD_2, textAlign: 'center', marginTop: sp.sm },

  bonusBox: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm, alignSelf: 'stretch',
    backgroundColor: OK.bg, ...cardShape, padding: sp.md, marginTop: sp.lg,
  },
  bonusIcon: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,158,107,0.18)' },
  bonusTitle: { fontFamily: F.bodyS, fontSize: 14, color: OK.fg },
  bonusBody: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: ON_CARD_2, marginTop: 1 },

  routing: { alignSelf: 'stretch', marginTop: sp.lg },
  routingTitle: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5, color: ON_CARD_2, marginBottom: sp.sm },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingVertical: 6 },
  routeTxt: { flex: 1, fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_CARD },
});
