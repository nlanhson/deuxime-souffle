/**
 * HalfDayScheduleSheet — the weekly availability editor (WBS PLA-09: "the coach can activate or
 * deactivate availability for each half-day", weekends included — not whole weekdays).
 *
 * One row per day (Mon→Sun), each with two toggle pills: morning + afternoon. Tapping the day
 * label itself flips the whole day (both halves) — a one-tap shortcut for the common case.
 * Commits on Save like the other commit-on-save sheets, so a mis-tap is recoverable. Pills follow
 * the MultiSelectSheet language (red = on, with checked state for screen readers — never colour
 * alone). Coach surface (ink).
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { X } from '../icons';
import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';

const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const ON_CARD_3 = palette.neutral[600];
const SUBTLE = palette.neutral[100];
const F = { bodyB: 'Inter_700Bold', bodyS: 'Inter_600SemiBold', body: 'Inter_400Regular', oswS: 'Oswald_600SemiBold' };

export type HalfDayValue = Record<string, { am: boolean; pm: boolean }>;

export function HalfDayScheduleSheet({
  visible, onClose, title, help, days, amLabel, pmLabel, value, onSave,
  saveLabel = 'Save', cancelLabel = 'Cancel', closeA11y,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  /** Ordered day labels (Mon→Sun) — also the keys of `value`. */
  days: readonly string[];
  amLabel: string;
  pmLabel: string;
  value: HalfDayValue;
  onSave: (v: HalfDayValue) => void;
  saveLabel?: string;
  cancelLabel?: string;
  closeA11y?: string;
}) {
  const [sel, setSel] = React.useState<HalfDayValue>(value);
  // Seed from the current value each time the sheet opens (so a cancelled edit is discarded).
  React.useEffect(() => { if (visible) setSel(value); }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const half = (day: string) => sel[day] ?? { am: false, pm: false };
  const toggleHalf = (day: string, k: 'am' | 'pm') =>
    setSel((cur) => ({ ...cur, [day]: { ...half(day), ...cur[day], [k]: !(cur[day]?.[k] ?? false) } }));
  const toggleDay = (day: string) =>
    setSel((cur) => {
      const d = cur[day] ?? { am: false, pm: false };
      const on = !(d.am && d.pm); // not fully on → turn fully on; fully on → clear
      return { ...cur, [day]: { am: on, pm: on } };
    });

  const a11y = closeA11y ?? 'Close';

  return (
    <BottomSheet visible={visible} onClose={onClose} a11yLabel={a11y}>
      <View style={st.head}>
        <Text style={st.title}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={a11y}>
          <X size={22} color={ON_CARD} />
        </Pressable>
      </View>
      {help ? <Text style={st.help}>{help}</Text> : null}

      <ScrollView style={st.list} bounces={false}>
        {days.map((day, i) => {
          const d = half(day);
          const fullOn = d.am && d.pm;
          return (
            <View key={day} style={[st.dayRow, i > 0 && st.dayDivider]}>
              <Pressable
                onPress={() => toggleDay(day)}
                style={({ pressed }) => [st.dayBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: fullOn ? true : d.am || d.pm ? 'mixed' : false }}
                accessibilityLabel={day}
              >
                <Text style={[st.dayTxt, (d.am || d.pm) && st.dayTxtOn]}>{day}</Text>
              </Pressable>
              <View style={st.pills}>
                <Pressable
                  onPress={() => toggleHalf(day, 'am')}
                  style={[st.pill, d.am && st.pillOn]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: d.am }}
                  accessibilityLabel={`${day} ${amLabel}`}
                >
                  <Text style={[st.pillTxt, d.am && st.pillTxtOn]}>{amLabel}</Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleHalf(day, 'pm')}
                  style={[st.pill, d.pm && st.pillOn]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: d.pm }}
                  accessibilityLabel={`${day} ${pmLabel}`}
                >
                  <Text style={[st.pillTxt, d.pm && st.pillTxtOn]}>{pmLabel}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={st.actions}>
        <Pressable
          style={({ pressed }) => [st.cancel, pressed && { opacity: 0.7 }]}
          onPress={onClose}
          accessibilityRole="button"
        >
          <Text style={st.cancelTxt}>{cancelLabel}</Text>
        </Pressable>
        <PrimaryButton label={saveLabel} onPress={() => { onSave(sel); onClose(); }} style={{ flex: 1 }} />
      </View>
    </BottomSheet>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, fontFamily: F.bodyB, fontSize: 22, color: ON_CARD },
  close: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  help: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_CARD_2, marginTop: sp.sm },

  list: { marginTop: sp.sm, maxHeight: 420 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 56 },
  dayDivider: { borderTopWidth: 1, borderTopColor: 'rgba(24,23,21,0.07)' },
  dayBtn: { minWidth: 52, minHeight: 44, justifyContent: 'center' },
  dayTxt: { fontFamily: F.oswS, fontSize: 16, color: ON_CARD_3 },
  dayTxtOn: { color: ON_CARD },
  pills: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: sp.sm },
  pill: {
    minHeight: 44, paddingVertical: 8, paddingHorizontal: 14, borderRadius: r.pill,
    backgroundColor: palette.neutral[100], borderWidth: 1, borderColor: 'rgba(24,23,21,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  pillOn: { backgroundColor: color.action, borderColor: color.action },
  pillTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  pillTxtOn: { color: color.onAction },

  actions: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.lg },
  cancel: { minHeight: 48, paddingHorizontal: sp.lg, borderRadius: r.button, alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD_3 },
});
