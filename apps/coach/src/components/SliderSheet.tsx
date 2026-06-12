/**
 * SliderSheet — a single-value range picker inside the shared BottomSheet (WBS PLA-08: the max
 * travel time is a SLIDER, 10–90 minutes — not a preset list).
 *
 * Anatomy: big live readout, then the slider track flanked by −/+ stepper buttons. The steppers
 * aren't decoration — they're the motor-accessible alternative to the drag gesture (tremor/switch
 * users adjust in precise steps; every target ≥ 44px). The track itself is one accessible
 * "adjustable" element: screen readers announce the value and adjust it with the standard
 * increment/decrement actions. Value commits on Save (mis-drags are recoverable), like the other
 * commit-on-save sheets. Coach surface (ink). No entrance animation beyond the sheet's own.
 */
import React from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { Minus, Plus, X } from '../icons';
import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';

const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];
const SUBTLE = palette.neutral[800];
const TRACK = palette.neutral[700];
const F = { display: 'Anton_400Regular', bodyB: 'Inter_700Bold', bodyS: 'Inter_600SemiBold', body: 'Inter_400Regular' };

const clampSnap = (raw: number, min: number, max: number, step: number) =>
  Math.max(min, Math.min(max, Math.round(raw / step) * step));

export function SliderSheet({
  visible, onClose, title, help, min, max, step, value, format, onSave,
  saveLabel = 'Save', cancelLabel = 'Cancel', decA11y = 'Decrease', incA11y = 'Increase', closeA11y,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  /** Display formatting for the readout + accessibility value, e.g. (v) => `≤ ${v} min`. */
  format: (v: number) => string;
  onSave: (v: number) => void;
  saveLabel?: string;
  cancelLabel?: string;
  decA11y?: string;
  incA11y?: string;
  closeA11y?: string;
}) {
  const [val, setVal] = React.useState(value);
  // Seed from the current value each time the sheet opens (so a cancelled edit is discarded).
  React.useEffect(() => { if (visible) setVal(value); }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // The drag math reads layout + bounds through refs so the PanResponder (created once) never
  // closes over stale values.
  const trackW = React.useRef(0);
  const bounds = React.useRef({ min, max, step });
  bounds.current = { min, max, step };

  const fromX = (x: number) => {
    const w = trackW.current;
    if (w <= 0) return;
    const { min: lo, max: hi, step: stp } = bounds.current;
    const pct = Math.max(0, Math.min(1, x / w));
    setVal(clampSnap(lo + pct * (hi - lo), lo, hi, stp));
  };

  const pan = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => fromX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => fromX(e.nativeEvent.locationX),
    }),
  ).current;

  const nudge = (dir: -1 | 1) => setVal((v) => clampSnap(v + dir * step, min, max, step));

  const pct = (val - min) / (max - min);
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

      {/* Live readout — the value itself, never colour alone. */}
      <Text style={st.readout} accessibilityLiveRegion="polite">{format(val)}</Text>

      <View style={st.sliderRow}>
        <Pressable
          onPress={() => nudge(-1)}
          style={({ pressed }) => [st.stepBtn, pressed && { opacity: 0.7 }, val <= min && st.stepBtnOff]}
          disabled={val <= min}
          accessibilityRole="button"
          accessibilityLabel={decA11y}
        >
          <Minus size={18} color={val <= min ? ON_CARD_3 : ON_CARD} />
        </Pressable>

        {/* The track: a 44px-tall touch band; drag or tap anywhere to set. */}
        <View
          style={st.trackTouch}
          onLayout={(e) => { trackW.current = e.nativeEvent.layout.width; }}
          {...pan.panHandlers}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={title}
          accessibilityValue={{ min, max, now: val, text: format(val) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        >
          <View style={st.track}>
            <View style={[st.fill, { width: `${pct * 100}%` }]} />
          </View>
          <View style={[st.thumb, { left: `${pct * 100}%` }]} pointerEvents="none" />
        </View>

        <Pressable
          onPress={() => nudge(1)}
          style={({ pressed }) => [st.stepBtn, pressed && { opacity: 0.7 }, val >= max && st.stepBtnOff]}
          disabled={val >= max}
          accessibilityRole="button"
          accessibilityLabel={incA11y}
        >
          <Plus size={18} color={val >= max ? ON_CARD_3 : ON_CARD} />
        </Pressable>
      </View>

      {/* Range ends, so the scale is legible at a glance. */}
      <View style={st.endsRow}>
        <Text style={st.endTxt}>{format(min)}</Text>
        <Text style={st.endTxt}>{format(max)}</Text>
      </View>

      <View style={st.actions}>
        <Pressable
          style={({ pressed }) => [st.cancel, pressed && { opacity: 0.7 }]}
          onPress={onClose}
          accessibilityRole="button"
        >
          <Text style={st.cancelTxt}>{cancelLabel}</Text>
        </Pressable>
        <PrimaryButton label={saveLabel} onPress={() => { onSave(val); onClose(); }} style={{ flex: 1 }} />
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

  readout: {
    fontFamily: F.display, fontSize: 36, lineHeight: 44, color: ON_CARD,
    textAlign: 'center', marginTop: sp.md,
  },

  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.sm },
  stepBtn: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[900], borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  stepBtnOff: { opacity: 0.45 },
  trackTouch: { flex: 1, height: 44, justifyContent: 'center' },
  track: { height: 6, borderRadius: 999, backgroundColor: TRACK, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: color.action },
  thumb: {
    position: 'absolute', top: '50%', width: 26, height: 26, borderRadius: 999,
    backgroundColor: ON_CARD, borderWidth: 3, borderColor: color.action,
    marginLeft: -13, marginTop: -13,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },

  endsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 44 + sp.sm },
  endTxt: { fontFamily: F.body, fontSize: 12, color: ON_CARD_3 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.lg },
  cancel: { minHeight: 48, paddingHorizontal: sp.lg, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD_3 },
});
