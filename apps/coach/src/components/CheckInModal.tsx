/**
 * CheckInModal (C16) — the geolocated check-in flow, opened from the Séances "Check in" CTA.
 *
 * A small state machine, not a yes/no confirm: the real gate is location + time, not user
 * intent. Phases:
 *   intro     → explains the check, privacy note, "Check in now"
 *   locating  → spinner while we'd capture GPS + validate
 *   result    → one of five outcomes encoding C17 (time + location) and C18 (late):
 *               success · late · tooFar · tooEarly · denied
 *
 * Geolocation isn't wired yet, so the intro carries a prototype-only "Preview outcome"
 * switcher to tour every state. On a successful (or late) check-in it calls `onConfirmed`
 * so the session card can flip to the "Checked in" status. Surface = coach dark ink card,
 * mirroring ActionModal so the app speaks one modal language.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin, CheckCircle2, AlertTriangle, Clock, MapPinOff, Navigation, X, type LucideIcon } from '../icons';

import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { copy } from '../copy';
import { BottomSheet } from './BottomSheet';
import { openDirections } from '../lib/openDirections';

const SUBTLE = palette.neutral[800];
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];

const F = { body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold', bodyB: 'Inter_700Bold' };

export type CheckInOutcome = 'success' | 'late' | 'tooFar' | 'tooEarly' | 'denied';
type Phase = 'intro' | 'locating' | 'result';

const C = copy.sessions.checkInModal;

// Per-outcome accent + glyph. Success/late are "you're in"; the rest are blockers.
const OUTCOME: Record<CheckInOutcome, { Icon: LucideIcon; fg: string; bg: string }> = {
  success:  { Icon: CheckCircle2,  fg: palette.vert[300], bg: 'rgba(47,158,107,0.16)' },
  late:     { Icon: AlertTriangle, fg: palette.or[300],   bg: 'rgba(242,194,0,0.13)' },
  tooFar:   { Icon: MapPinOff,     fg: palette.bleu[200], bg: 'rgba(166,183,219,0.14)' },
  tooEarly: { Icon: Clock,         fg: palette.bleu[200], bg: 'rgba(166,183,219,0.14)' },
  denied:   { Icon: MapPinOff,     fg: palette.rouge[300], bg: 'rgba(225,50,43,0.14)' },
};

const DEMO_ORDER: CheckInOutcome[] = ['success', 'late', 'tooFar', 'tooEarly', 'denied'];

export function CheckInModal({
  visible, session, onClose, onConfirmed,
}: {
  visible: boolean;
  session: { place: string; time: string; addr?: string } | null;
  onClose: () => void;
  /** Fired when the coach is checked in (on time or late) so the card can flip status. */
  onConfirmed: (late: boolean) => void;
}) {
  const [phase, setPhase] = React.useState<Phase>('intro');
  const [scenario, setScenario] = React.useState<CheckInOutcome>('success');

  // Reset to the intro every time the sheet opens.
  React.useEffect(() => {
    if (visible) { setPhase('intro'); setScenario('success'); }
  }, [visible]);

  // locating → result after a short beat (stands in for GPS capture + validation).
  React.useEffect(() => {
    if (phase !== 'locating') return;
    const t = setTimeout(() => setPhase('result'), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  const checkedIn = scenario === 'success' || scenario === 'late';
  const finishCheckedIn = () => { onConfirmed(scenario === 'late'); onClose(); };
  const handleDirections = () => { if (session?.addr) openDirections(session.addr); onClose(); };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      a11yLabel={C.closeA11y}
      dismissable={phase !== 'locating'}
    >
          {/* ---------- intro ---------- */}
          {phase === 'intro' ? (
            <>
              <View style={st.top}>
                <View style={st.icon}>
                  <MapPin size={26} color={ON_CARD} />
                </View>
                <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={C.closeA11y}>
                  <X size={22} color={ON_CARD} />
                </Pressable>
              </View>

              {session ? <Text style={st.eyebrow}>{`${session.place} · ${session.time}`}</Text> : null}
              <Text style={st.title}>{C.title}</Text>
              <Text style={st.body}>{C.body}</Text>
              <View style={st.note}><Text style={st.noteTxt}>{C.note}</Text></View>

              {/* prototype-only: pick which outcome the validation will return */}
              <Text style={st.demoLabel}>{C.demoLabel}</Text>
              <View style={st.demoRow}>
                {DEMO_ORDER.map((o) => {
                  const on = scenario === o;
                  return (
                    <Pressable
                      key={o}
                      onPress={() => setScenario(o)}
                      style={[st.demoChip, on && st.demoChipOn]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                    >
                      <Text style={[st.demoChipTxt, on && st.demoChipTxtOn]}>{C.demo[o]}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable style={({ pressed }) => [st.primary, pressed && { opacity: 0.9 }]} onPress={() => setPhase('locating')} accessibilityRole="button">
                <Text style={st.primaryTxt}>{C.confirm}</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [st.secondary, pressed && { opacity: 0.6 }]} onPress={onClose} accessibilityRole="button">
                <Text style={st.secondaryTxt}>{C.cancel}</Text>
              </Pressable>
            </>
          ) : null}

          {/* ---------- locating ---------- */}
          {phase === 'locating' ? (
            <View style={st.locating}>
              <ActivityIndicator size="large" color={palette.bleu[200]} />
              <Text style={st.locatingTxt}>{C.locating}</Text>
            </View>
          ) : null}

          {/* ---------- result ---------- */}
          {phase === 'result' ? (
            <ResultView
              scenario={scenario}
              checkedIn={checkedIn}
              onClose={onClose}
              onFinish={finishCheckedIn}
              onDirections={handleDirections}
            />
          ) : null}
    </BottomSheet>
  );
}

function ResultView({
  scenario, checkedIn, onClose, onFinish, onDirections,
}: {
  scenario: CheckInOutcome;
  checkedIn: boolean;
  onClose: () => void;
  onFinish: () => void;
  onDirections: () => void;
}) {
  const meta = OUTCOME[scenario];
  const txt = C.result[scenario];
  return (
    <>
      <View style={st.top}>
        <View style={st.icon}>
          <meta.Icon size={26} color={ON_CARD} />
        </View>
        <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={C.closeA11y}>
          <X size={22} color={ON_CARD} />
        </Pressable>
      </View>

      <Text style={st.title}>{txt.title}</Text>
      <Text style={st.body}>{txt.body}</Text>

      {checkedIn ? (
        // success / late — acknowledging flips the card to "Checked in".
        <Pressable style={({ pressed }) => [st.primary, pressed && { opacity: 0.9 }]} onPress={onFinish} accessibilityRole="button">
          <Text style={st.primaryTxt}>{C.done}</Text>
        </Pressable>
      ) : scenario === 'tooFar' ? (
        <>
          <Pressable style={({ pressed }) => [st.primary, st.primaryOutline, pressed && { opacity: 0.9 }]} onPress={onDirections} accessibilityRole="button">
            <Navigation size={16} color={ON_CARD} style={{ marginRight: 6 }} />
            <Text style={[st.primaryTxt, { color: ON_CARD }]}>{C.directions}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [st.secondary, pressed && { opacity: 0.6 }]} onPress={onClose} accessibilityRole="button">
            <Text style={st.secondaryTxt}>{C.done}</Text>
          </Pressable>
        </>
      ) : scenario === 'denied' ? (
        <>
          <Pressable style={({ pressed }) => [st.primary, st.primaryOutline, pressed && { opacity: 0.9 }]} onPress={onClose} accessibilityRole="button">
            <Text style={[st.primaryTxt, { color: ON_CARD }]}>{C.openSettings}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [st.secondary, pressed && { opacity: 0.6 }]} onPress={onClose} accessibilityRole="button">
            <Text style={st.secondaryTxt}>{C.done}</Text>
          </Pressable>
        </>
      ) : (
        // tooEarly
        <Pressable style={({ pressed }) => [st.primary, st.primaryOutline, pressed && { opacity: 0.9 }]} onPress={onClose} accessibilityRole="button">
          <Text style={[st.primaryTxt, { color: ON_CARD }]}>{C.done}</Text>
        </Pressable>
      )}
    </>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  // Lighter than the card (neutral-800) so the white glyph sits on a clearly distinct chip.
  icon: {
    width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[700], borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  close: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  eyebrow: { fontFamily: F.body, fontSize: 12, letterSpacing: 0.3, color: ON_CARD_3, marginTop: sp.md },
  title: { fontFamily: F.bodyB, fontSize: 22, color: ON_CARD, marginTop: 4 },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CARD_2, marginTop: sp.sm },

  note: { marginTop: sp.md },
  noteTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD, letterSpacing: 0.2 },

  // prototype-only outcome switcher (sentence case — brand rule: no all-caps)
  demoLabel: { fontFamily: F.body, fontSize: 11, letterSpacing: 0.4, color: ON_CARD_3, marginTop: sp.lg },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.xs, marginTop: sp.sm },
  demoChip: {
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: r.pill,
    backgroundColor: SUBTLE, borderWidth: 1, borderColor: 'transparent',
  },
  demoChipOn: { borderColor: palette.bleu[200], backgroundColor: 'rgba(166,183,219,0.14)' },
  demoChipTxt: { fontFamily: F.bodyS, fontSize: 13, color: ON_CARD_2 },
  demoChipTxtOn: { color: palette.bleu[200] },

  // locating
  locating: { alignItems: 'center', justifyContent: 'center', paddingVertical: sp.xl, gap: sp.md },
  locatingTxt: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD_2 },

  primary: {
    minHeight: 48, borderRadius: r.pill, backgroundColor: color.action,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: sp.lg,
  },
  // blockers use an outline primary (not the brand red, which means "you did the action")
  primaryOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: palette.neutral[600] },
  primaryTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
  secondary: { minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center', marginTop: sp.xs },
  secondaryTxt: { fontFamily: F.bodyS, fontSize: 14, letterSpacing: 0.2, color: ON_CARD_3 },
});
