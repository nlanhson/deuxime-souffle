/**
 * AbsenceModal (C20) — "Declare absence" for an assigned session, opened from the session
 * detail's Manage group.
 *
 * Distinct from Cancel participation (C24): an absence is a "can't attend" notification that
 * carries a reason. The assignment algorithm treats a declared absence as an availability
 * exclusion, and the reputation system weighs absences/no-shows — so the coach must pick a
 * reason before confirming. On confirm, the screen drops the session from the list (the real
 * app would also persist the reason and notify the care home).
 *
 * Built on the shared BottomSheet, matching CheckInModal's card language.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarX, X } from '../icons';

import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { copy } from '../copy';
import { BottomSheet } from './BottomSheet';

const SUBTLE = palette.neutral[800];
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];
const DANGER = palette.rouge[300];

const F = { body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold', bodyB: 'Inter_700Bold' };

const C = copy.sessions.absenceModal;

export type AbsenceReason = keyof typeof C.reasons;
const REASON_ORDER: AbsenceReason[] = ['illness', 'emergency', 'transport', 'other'];

export function AbsenceModal({
  visible, session, onClose, onConfirm,
}: {
  visible: boolean;
  session: { place: string; time: string; day: string } | null;
  onClose: () => void;
  onConfirm: (reason: AbsenceReason) => void;
}) {
  const [reason, setReason] = React.useState<AbsenceReason | null>(null);

  // Reset the choice each time the sheet opens.
  React.useEffect(() => { if (visible) setReason(null); }, [visible]);

  const confirm = () => { if (reason) { onConfirm(reason); onClose(); } };

  return (
    <BottomSheet visible={visible} onClose={onClose} a11yLabel={C.closeA11y}>
      <View style={st.top}>
        <View style={[st.icon, { backgroundColor: 'rgba(225,50,43,0.14)' }]}>
          <CalendarX size={26} color={DANGER} />
        </View>
        <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={C.closeA11y}>
          <X size={22} color={ON_CARD} />
        </Pressable>
      </View>

      {session ? <Text style={st.eyebrow}>{`${session.place} · ${session.day} · ${session.time}`}</Text> : null}
      <Text style={st.title}>{C.title}</Text>
      <Text style={st.body}>{C.body}</Text>

      {/* reason — required single choice */}
      <Text style={st.reasonLabel}>{C.reasonLabel}</Text>
      <View style={st.reasonRow}>
        {REASON_ORDER.map((rk) => {
          const on = reason === rk;
          return (
            <Pressable
              key={rk}
              onPress={() => setReason(rk)}
              style={[st.chip, on && st.chipOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[st.chipTxt, on && st.chipTxtOn]}>{C.reasons[rk]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={st.note}><Text style={st.noteTxt}>{C.note}</Text></View>

      <Pressable
        style={({ pressed }) => [st.primary, !reason && st.primaryDisabled, pressed && reason && { opacity: 0.9 }]}
        onPress={confirm}
        disabled={!reason}
        accessibilityRole="button"
        accessibilityState={{ disabled: !reason }}
      >
        <Text style={st.primaryTxt}>{C.confirm}</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [st.secondary, pressed && { opacity: 0.6 }]} onPress={onClose} accessibilityRole="button">
        <Text style={st.secondaryTxt}>{C.cancel}</Text>
      </Pressable>
    </BottomSheet>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  icon: { width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  close: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  eyebrow: { fontFamily: F.body, fontSize: 12, letterSpacing: 0.3, color: ON_CARD_3, marginTop: sp.md },
  title: { fontFamily: F.bodyB, fontSize: 22, color: ON_CARD, marginTop: 4 },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CARD_2, marginTop: sp.sm },

  reasonLabel: { fontFamily: F.body, fontSize: 11, letterSpacing: 0.4, color: ON_CARD_3, textTransform: 'uppercase', marginTop: sp.lg },
  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.xs, marginTop: sp.sm },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: r.pill,
    backgroundColor: SUBTLE, borderWidth: 1, borderColor: 'transparent',
  },
  chipOn: { borderColor: DANGER, backgroundColor: 'rgba(225,50,43,0.14)' },
  chipTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  chipTxtOn: { color: DANGER },

  note: { marginTop: sp.md },
  noteTxt: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CARD_3 },

  primary: {
    minHeight: 48, borderRadius: r.pill, backgroundColor: color.action,
    alignItems: 'center', justifyContent: 'center', marginTop: sp.lg,
  },
  primaryDisabled: { opacity: 0.4 },
  primaryTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
  secondary: { minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center', marginTop: sp.xs },
  secondaryTxt: { fontFamily: F.bodyS, fontSize: 14, letterSpacing: 0.2, color: ON_CARD_3 },
});
