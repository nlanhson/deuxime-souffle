/**
 * Coach · Update my availability (M1 / WBS PLA-08 · PLA-09) — rebuilt as the guided hub-and-spoke
 * flow from the "dispos coach v5" mockup (screens 2→12), rendered in the coach house style (light
 * canvas, white flat-bordered cards, Oswald/Inter, the rouge→or "movement" gauge). It is ONE
 * pageSheet driving an internal step machine, not a stack of routes — so the existing entry points
 * (Profile hub + a session detail) are untouched:
 *
 *   hub ("Mes disponibilités") → Transport · Adresses (+ adresse par jour) · Zones · Créneaux
 *   Créneaux (rapide) → détaillé (une demi-journée) → ajouter un créneau → zones du créneau
 *   Récap de la semaine · Indispos & validation (confirme et ferme)
 *
 * A persistent footer gauge ("Potentiel de séances") reacts live to every input. All reads/writes
 * go through the shared store (lib/availability), so Profile and the session-detail summary stay in
 * sync. UI text comes from ../i18n (FR copy + EN partial). Surface = coach.
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, ChevronLeft, ChevronRight, Car, Bike, Bus, Scooter, MapPin, Map, CalendarClock, CalendarX,
  Clock, Plus, Minus, Trash2, Check, Info, Activity, type LucideIcon,
} from '../icons';

import { palette, color, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { useCopy } from '../i18n';
import { PrimaryButton } from '../components/PrimaryButton';
import { useKeyboardInset } from '../lib/useKeyboardInset';
import {
  useAvailability, weeklyPotential, formatZones, formatDays, addressLine, countActiveSlots,
  transportLabel, TRANSPORT_MODES, ZONE_OPTIONS, TRAVEL,
  fineSlotKey, fineSlotsFor, withFineSlot, withoutFineSlot, newFineSlot, timeGrid, formatClock,
  formatFineZones, countFineSlotDays, newTimeOff,
  type FineSlot, type TransportMode,
} from '../lib/availability';

const S = surfaces.coach;
const isDark = S.colorScheme === 'dark';
const CANVAS = S.canvas;
const SUBTLE = isDark ? palette.neutral[800] : palette.neutral[100];
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
// Cards are always light (white) regardless of scheme — content tones stay dark-on-light.
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const HAIRLINE = 'rgba(24,23,21,0.10)';
const DIVIDER = 'rgba(24,23,21,0.07)';

// Selection accent — the brand rouge (color.action), with the lightest rouge as a selected tint.
const SELECTED = color.action;
const SELECTED_BG = palette.rouge[50];

// Footer gauge — the signature rouge→or gradient; level word colour-coded, AA-tuned for the paper
// canvas (green good · gold medium · muted low — see the paper-tuning standard).
const MOVEMENT = [palette.rouge[500], palette.or[500]] as const;
const LEVEL_COLOR = { good: palette.vert[700], medium: palette.or[800], low: palette.neutral[600] };

// Recap markers — green for a full ("rapide") half-day, gold for a detailed window.
const MARK_FULL = palette.vert[700];
const MARK_FINE = palette.or[800];

// Transport mode → icon (the four fixed modes, mockup screen 3).
const MODE_ICON: Record<TransportMode, LucideIcon> = { voiture: Car, '2roues': Scooter, velo: Bike, transports: Bus };

const F = {
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

const HALVES = ['am', 'pm'] as const;

type Step =
  | 'hub' | 'transport' | 'addressPrimary' | 'addressSecondary' | 'zones'
  | 'creneaux' | 'creneauxDetail' | 'slotTime' | 'slotZones' | 'recap' | 'validation';

/** The in-progress fine slot being added or edited (screens 9/10). */
type SlotDraft = { id?: string; start: string; end: string; allZones: boolean; zones: string[]; travelMin: number };

/* ============================== small building blocks ============================== */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={st.eyebrow}>{children}</Text>;
}

/** White flat-bordered card (house idiom — shadow reserved for overlays) with a faint top sheen. */
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[st.card, style]}>
      <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.xl }]} pointerEvents="none" />
      {children}
    </View>
  );
}

/** Section intro line on the canvas (cognitive-a11y: say why the step matters). */
function Intro({ children }: { children: React.ReactNode }) {
  return <Text style={st.intro}>{children}</Text>;
}

/** A soft info note on the canvas (bleu = informational, distinct from the rouge selection accent). */
function Note({ title, body }: { title?: string; body: string }) {
  return (
    <View style={st.note}>
      <Info size={16} color={color.info} />
      <View style={{ flex: 1 }}>
        {title ? <Text style={st.noteTitle}>{title}</Text> : null}
        <Text style={st.noteBody}>{body}</Text>
      </View>
    </View>
  );
}

/** −/＋ stepper used for the default travel cap and a slot's own cap (mirrors the old SliderSheet). */
function Stepper({ value, min, max, step, format, onChange, decA11y, incA11y }: {
  value: number; min: number; max: number; step: number; format: (v: number) => string;
  onChange: (v: number) => void; decA11y: string; incA11y: string;
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  const atMin = value <= min, atMax = value >= max;
  return (
    <View style={st.stepper}>
      <Pressable style={[st.stepBtn, atMin && st.stepBtnOff]} onPress={dec} disabled={atMin} accessibilityRole="button" accessibilityLabel={decA11y}>
        <Minus size={20} color={atMin ? palette.neutral[400] : ON_CARD} />
      </Pressable>
      <Text style={st.stepVal}>{format(value)}</Text>
      <Pressable style={[st.stepBtn, atMax && st.stepBtnOff]} onPress={inc} disabled={atMax} accessibilityRole="button" accessibilityLabel={incA11y}>
        <Plus size={20} color={atMax ? palette.neutral[400] : ON_CARD} />
      </Pressable>
    </View>
  );
}

/** Selectable tile (transport modes, screen 3) — icon over label, rouge when selected. */
function Tile({ icon: Icon, label, selected, onPress }: { icon: LucideIcon; label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [st.tile, selected && st.tileSel, pressed && { opacity: 0.9 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Icon size={26} color={selected ? SELECTED : ON_CARD_2} />
      <Text style={[st.tileTxt, selected && { color: SELECTED, fontFamily: F.bodyB }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

/** Pill chip (time picker, slot zones) — rouge fill when selected. */
function Chip({ label, selected, onPress, a11y }: { label: string; selected: boolean; onPress: () => void; a11y?: string }) {
  return (
    <Pressable
      style={({ pressed }) => [st.chip, selected && st.chipSel, pressed && { opacity: 0.9 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={a11y ?? label}
    >
      <Text style={[st.chipTxt, selected && { color: palette.neutral[0], fontFamily: F.bodyS }]}>{label}</Text>
    </Pressable>
  );
}

/** Labelled text input (address fields, time-off period). */
function Field({ label, value, onChangeText, placeholder, autoCapitalize, keyboardType, maxLength, style }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  autoCapitalize?: 'none' | 'words' | 'sentences'; keyboardType?: 'default' | 'number-pad'; maxLength?: number; style?: object;
}) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <Text style={st.fieldLabel}>{label}</Text>
      <TextInput
        style={st.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.neutral[400]}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  );
}

/* ============================== screen ============================== */

export function UpdateAvailabilityScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const copy = useCopy();
  const c = copy.profile;
  const a = c.availability;
  const f = a.flow;
  const e = c.edit;
  const { av, updatedDaysAgo, stale, editAv, markFresh } = useAvailability();
  const kb = useKeyboardInset();

  // Step machine — a history stack so Back pops to the previous screen.
  const [stack, setStack] = React.useState<Step[]>(['hub']);
  const step = stack[stack.length - 1];
  const go = (s: Step) => setStack((stk) => [...stk, s]);
  const back = () => setStack((stk) => (stk.length > 1 ? stk.slice(0, -1) : stk));
  const popToDetail = () => setStack((stk) => { const i = stk.lastIndexOf('creneauxDetail'); return i >= 0 ? stk.slice(0, i + 1) : ['hub']; });

  const [creneauxMode, setCreneauxMode] = React.useState<'rapide' | 'detaille'>('rapide');
  const [detailTarget, setDetailTarget] = React.useState<{ day: string; half: 'am' | 'pm' } | null>(null);
  const [slotDraft, setSlotDraft] = React.useState<SlotDraft | null>(null);
  const [periodForm, setPeriodForm] = React.useState<{ label: string; start: string; end: string } | null>(null);

  const scrollRef = React.useRef<ScrollView>(null);
  // Reset to the hub each time the sheet opens; scroll each new step to the top.
  React.useEffect(() => { if (visible) { setStack(['hub']); setCreneauxMode('rapide'); setPeriodForm(null); } }, [visible]);
  React.useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [step]);

  const weekdays = e.schedule.weekdays;
  const halfLabel = (h: 'am' | 'pm') => (h === 'am' ? e.schedule.am : e.schedule.pm);
  const pot = weeklyPotential(av);

  /* ----- mutations (all through the shared store) ----- */
  const setTransport = (m: TransportMode) => editAv({ transport: m });
  const setTravel = (v: number) => editAv({ travelMin: Math.max(TRAVEL.min, Math.min(TRAVEL.max, v)) });
  const patchPrimary = (patch: Partial<{ rue: string; cp: string; ville: string }>) => editAv({ primaryAddress: { ...av.primaryAddress, ...patch } });
  const sec = av.secondaryAddress ?? { rue: '', cp: '', ville: '', days: [] as string[] };
  const patchSecondary = (patch: Partial<{ rue: string; cp: string; ville: string }>) => editAv({ secondaryAddress: { ...sec, ...patch } });
  const toggleSecDay = (day: string) => editAv({ secondaryAddress: { ...sec, days: sec.days.includes(day) ? sec.days.filter((d) => d !== day) : [...sec.days, day] } });
  const removeSecondary = () => { editAv({ secondaryAddress: null }); back(); };
  const addSecondary = () => { if (!av.secondaryAddress) editAv({ secondaryAddress: { rue: '', cp: '', ville: '', days: [] } }); go('addressSecondary'); };
  const toggleZone = (code: string) => editAv({ zones: av.zones.includes(code) ? av.zones.filter((z) => z !== code) : [...av.zones, code] });
  const toggleHalf = (day: string, half: 'am' | 'pm') => {
    const cur = av.slots[day] ?? { am: false, pm: false };
    editAv({ slots: { ...av.slots, [day]: { ...cur, [half]: !cur[half] } } });
  };

  // Créneaux détaillé sub-flow (screens 8/9/10).
  const detailKey = detailTarget ? fineSlotKey(detailTarget.day, detailTarget.half) : '';
  const openDetail = (day: string, half: 'am' | 'pm') => { setDetailTarget({ day, half }); go('creneauxDetail'); };
  const startAddSlot = () => {
    if (!detailTarget) return;
    const { starts, ends } = timeGrid(detailTarget.half);
    setSlotDraft({ start: starts[0], end: ends[Math.min(1, ends.length - 1)], allZones: true, zones: [], travelMin: av.travelMin });
    go('slotTime');
  };
  const startEditSlot = (s: FineSlot) => { setSlotDraft({ id: s.id, start: s.start, end: s.end, allZones: s.zones.length === 0, zones: s.zones, travelMin: s.travelMin }); go('slotTime'); };
  const removeFine = (id: string) => { if (detailTarget) editAv({ fineSlots: withoutFineSlot(av.fineSlots, detailKey, id) }); };
  const pickStart = (t: string) => setSlotDraft((d) => {
    if (!d || !detailTarget) return d;
    const { ends } = timeGrid(detailTarget.half);
    const end = d.end > t ? d.end : (ends.find((x) => x > t) ?? d.end);
    return { ...d, start: t, end };
  });
  const pickEnd = (t: string) => setSlotDraft((d) => (d ? { ...d, end: t } : d));
  const setSlotTravel = (v: number) => setSlotDraft((d) => (d ? { ...d, travelMin: Math.max(TRAVEL.min, Math.min(TRAVEL.max, v)) } : d));
  const setAllZones = (all: boolean) => setSlotDraft((d) => (d ? { ...d, allZones: all } : d));
  const toggleSlotZone = (code: string) => setSlotDraft((d) => (d ? { ...d, allZones: false, zones: d.zones.includes(code) ? d.zones.filter((z) => z !== code) : [...d.zones, code] } : d));
  const saveSlot = () => {
    if (!detailTarget || !slotDraft) return;
    const zones = slotDraft.allZones ? [] : slotDraft.zones;
    const slot: FineSlot = slotDraft.id
      ? { id: slotDraft.id, start: slotDraft.start, end: slotDraft.end, zones, travelMin: slotDraft.travelMin }
      : newFineSlot(slotDraft.start, slotDraft.end, zones, slotDraft.travelMin);
    editAv({ fineSlots: withFineSlot(av.fineSlots, detailKey, slot) });
    setSlotDraft(null);
    popToDetail();
  };

  // Time off (screen 12).
  const addPeriod = () => {
    if (!periodForm) return;
    const { label, start, end } = periodForm;
    if (!label.trim() || !start.trim() || !end.trim()) return;
    editAv({ timeOff: [...av.timeOff, newTimeOff(label.trim(), start.trim(), end.trim())] });
    setPeriodForm(null);
  };
  const removePeriod = (id: string) => editAv({ timeOff: av.timeOff.filter((p) => p.id !== id) });
  const confirmAll = () => { markFresh(); onClose(); };

  /* ----- derived summaries ----- */
  const activeSlots = countActiveSlots(av.slots);
  const fineDays = countFineSlotDays(av.fineSlots);
  const ago =
    updatedDaysAgo === 0
      ? `${a.updatedPrefix} ${a.justNow}`
      : `${a.updatedPrefix} il y a ${updatedDaysAgo} ${updatedDaysAgo === 1 ? a.dayAgo : a.daysAgo}`;
  const addressesSummary = av.secondaryAddress ? `${av.primaryAddress.ville} + ${av.secondaryAddress.ville}` : av.primaryAddress.ville;
  const slotsSummary = `${activeSlots} ${activeSlots === 1 ? f.activeSlotsOne : f.activeSlotsMany}`;

  const titles: Record<Step, string> = {
    hub: a.title,
    transport: f.transportTitle,
    addressPrimary: f.addressTitle,
    addressSecondary: f.secondaryTitle,
    zones: f.zonesTitle,
    creneaux: f.creneauxTitle,
    creneauxDetail: detailTarget ? `${detailTarget.day} · ${halfLabel(detailTarget.half)}` : f.creneauxTitle,
    slotTime: slotDraft?.id ? f.slotEditTitle : f.slotTitle,
    slotZones: f.slotZonesTitle,
    recap: f.recapTitle,
    validation: f.validationTitle,
  };

  /* ============================== step renderers ============================== */

  const renderHub = () => (
    <>
      <Intro>{a.intro}</Intro>
      <View style={st.freshRow}>
        <Text style={[st.updated, stale && { color: LEVEL_COLOR.medium }]}>{ago}</Text>
      </View>
      {stale ? (
        <View style={st.nudge} accessible accessibilityLabel={a.staleNudge}>
          <CalendarClock size={16} color={palette.or[800]} />
          <Text style={st.nudgeTxt}>{a.staleNudge}</Text>
        </View>
      ) : null}

      <Card>
        <HubRow first icon={MODE_ICON[av.transport]} label={a.transport} value={`${transportLabel(av.transport, e.transport)} · ≤ ${av.travelMin} min`} onPress={() => go('transport')} />
        <HubRow icon={MapPin} label={f.hubAddresses} value={addressesSummary} onPress={() => go('addressPrimary')} />
        <HubRow icon={Map} label={f.hubZones} value={formatZones(av.zones, a.areasNone)} onPress={() => go('zones')} />
        <HubRow icon={CalendarClock} label={f.hubCreneaux} value={slotsSummary} pill={fineDays > 0 ? `${fineDays} ${f.detailedPill}` : undefined} onPress={() => go('creneaux')} />
      </Card>

      <PrimaryButton label={f.validate} icon={<Check size={18} color={color.onAction} />} style={st.cta} onPress={() => go('validation')} accessibilityLabel={f.validate} />
    </>
  );

  const renderTransport = () => (
    <>
      <Text style={st.qLabel}>{f.transportQ}</Text>
      <View style={st.tileGrid}>
        {TRANSPORT_MODES.map((m) => (
          <Tile key={m} icon={MODE_ICON[m]} label={transportLabel(m, e.transport)} selected={av.transport === m} onPress={() => setTransport(m)} />
        ))}
      </View>
      <Text style={[st.qLabel, { marginTop: sp.lg }]}>{f.travelDefault}</Text>
      <Card>
        <View style={st.cardPad}>
          <Stepper value={av.travelMin} min={TRAVEL.min} max={TRAVEL.max} step={TRAVEL.step} format={(v) => `≤ ${v} min`} onChange={setTravel} decA11y={e.travel.decA11y} incA11y={e.travel.incA11y} />
        </View>
      </Card>
      <Note body={f.travelNote} />
    </>
  );

  const renderAddressPrimary = () => (
    <>
      <Intro>{f.addressIntro}</Intro>
      <Card>
        <View style={st.cardPad}>
          <View style={st.addrHead}>
            <View style={st.addrHeadL}><MapPin size={16} color={SELECTED} /><Text style={st.addrHeadTxt}>{e.departure.primaryLabel}</Text></View>
            <View style={st.badge}><Text style={st.badgeTxt}>{f.primaryBadge}</Text></View>
          </View>
          <Field label={f.street} value={av.primaryAddress.rue} onChangeText={(t) => patchPrimary({ rue: t })} autoCapitalize="words" />
          <View style={st.fieldRow}>
            <Field label={f.postal} value={av.primaryAddress.cp} onChangeText={(t) => patchPrimary({ cp: t })} keyboardType="number-pad" maxLength={5} style={{ flex: 1 }} />
            <Field label={f.city} value={av.primaryAddress.ville} onChangeText={(t) => patchPrimary({ ville: t })} autoCapitalize="words" style={{ flex: 2 }} />
          </View>
        </View>
      </Card>

      {av.secondaryAddress ? (
        <Card style={{ marginTop: sp.sm }}>
          <HubRow first icon={MapPin} label={f.secondaryBadge} value={`${av.secondaryAddress.ville} · ${formatDays(av.secondaryAddress.days, weekdays, a.areasNone)}`} onPress={() => go('addressSecondary')} />
        </Card>
      ) : (
        <Pressable style={({ pressed }) => [st.dashed, pressed && { opacity: 0.8 }]} onPress={addSecondary} accessibilityRole="button" accessibilityLabel={f.addSecondary}>
          <Plus size={18} color={ON_CANVAS_2} />
          <Text style={st.dashedTxt}>{f.addSecondary}</Text>
        </Pressable>
      )}
      <Note title={f.whyTwoTitle} body={f.whyTwoBody} />
    </>
  );

  const renderAddressSecondary = () => (
    <>
      <Intro>{f.secondaryIntro}</Intro>
      <Card>
        <View style={st.cardPad}>
          <View style={st.addrHeadL}><MapPin size={16} color={SELECTED} /><Text style={st.addrHeadTxt}>{f.secondaryBadge}</Text></View>
          <Field label={f.street} value={sec.rue} onChangeText={(t) => patchSecondary({ rue: t })} autoCapitalize="words" />
          <View style={st.fieldRow}>
            <Field label={f.postal} value={sec.cp} onChangeText={(t) => patchSecondary({ cp: t })} keyboardType="number-pad" maxLength={5} style={{ flex: 1 }} />
            <Field label={f.city} value={sec.ville} onChangeText={(t) => patchSecondary({ ville: t })} autoCapitalize="words" style={{ flex: 2 }} />
          </View>
        </View>
      </Card>

      <Text style={[st.qLabel, { marginTop: sp.lg }]}>{f.activeDays}</Text>
      <View style={st.dayRow}>
        {weekdays.map((d) => {
          const on = sec.days.includes(d);
          return (
            <Pressable
              key={d}
              style={[st.dayCell, on && st.dayCellOn]}
              onPress={() => toggleSecDay(d)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={d}
            >
              <Text style={[st.dayCellTxt, on && { color: palette.neutral[0], fontFamily: F.bodyB }]}>{d.slice(0, 1)}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={st.daySummary}>{formatDays(sec.days, weekdays, a.areasNone)}{sec.days.length ? ` → ${sec.ville || f.city}` : ''}</Text>

      <Pressable style={({ pressed }) => [st.removeRow, pressed && { opacity: 0.8 }]} onPress={removeSecondary} accessibilityRole="button" accessibilityLabel={f.removeSecondary}>
        <Trash2 size={16} color={color.danger} />
        <Text style={st.removeTxt}>{f.removeSecondary}</Text>
      </Pressable>
    </>
  );

  const renderZones = () => (
    <>
      <Intro>{f.zonesIntro}</Intro>
      <Card>
        {ZONE_OPTIONS.map((z, i) => {
          const on = av.zones.includes(z.code);
          return (
            <Pressable
              key={z.code}
              style={({ pressed }) => [st.zoneRow, i > 0 && st.divider, pressed && { opacity: 0.85 }]}
              onPress={() => toggleZone(z.code)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${z.code} ${z.name}`}
            >
              <View style={[st.checkbox, on && st.checkboxOn]}>{on ? <Check size={14} color={palette.neutral[0]} /> : null}</View>
              <Text style={[st.zoneTxt, on && { color: ON_CARD, fontFamily: F.bodyS }]}>{z.code} · {z.name}</Text>
            </Pressable>
          );
        })}
      </Card>
    </>
  );

  const renderCreneaux = () => (
    <>
      {/* Rapide / détaillé segmented control (screen 7) */}
      <View style={st.seg}>
        <Pressable style={[st.segBtn, creneauxMode === 'rapide' && st.segBtnOn]} onPress={() => setCreneauxMode('rapide')} accessibilityRole="button" accessibilityState={{ selected: creneauxMode === 'rapide' }}>
          <Text style={[st.segTxt, creneauxMode === 'rapide' && st.segTxtOn]}>{f.modeRapide}</Text>
        </Pressable>
        <Pressable style={[st.segBtn, creneauxMode === 'detaille' && st.segBtnOn]} onPress={() => setCreneauxMode('detaille')} accessibilityRole="button" accessibilityState={{ selected: creneauxMode === 'detaille' }}>
          <Text style={[st.segTxt, creneauxMode === 'detaille' && st.segTxtOn]}>{f.modeDetaille}</Text>
        </Pressable>
      </View>
      <Text style={st.gridHint}>{creneauxMode === 'rapide' ? f.rapideHint : f.detailleHint}</Text>

      <Card>
        <View style={st.cardPad}>
          {/* header — day initials */}
          <View style={st.gridHeader}>
            {weekdays.map((d) => <Text key={d} style={st.gridHeadTxt}>{d.slice(0, 1)}</Text>)}
          </View>
          {HALVES.map((half) => (
            <View key={half}>
              <Text style={st.gridRowLabel}>{halfLabel(half)} <Text style={st.gridRowRange}>{half === 'am' ? f.amRange : f.pmRange}</Text></Text>
              <View style={st.gridRow}>
                {weekdays.map((d) => {
                  const on = !!av.slots[d]?.[half];
                  const fine = fineSlotsFor(av, d, half).length > 0;
                  const detailMode = creneauxMode === 'detaille';
                  const onPress = () => (detailMode ? (on ? openDetail(d, half) : undefined) : toggleHalf(d, half));
                  const disabled = detailMode && !on;
                  return (
                    <Pressable
                      key={d}
                      style={[st.cell, on && (fine ? st.cellFine : st.cellOn), disabled && { opacity: 0.5 }]}
                      onPress={onPress}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on, disabled }}
                      accessibilityLabel={`${d} ${halfLabel(half)}, ${on ? (fine ? f.detailedPill : '✓') : '—'}`}
                    >
                      <Text style={[st.cellTxt, on && { color: fine ? MARK_FINE : MARK_FULL, fontFamily: F.bodyB }]}>{on ? '✓' : '—'}</Text>
                      {fine ? <View style={st.cellDot} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Text style={st.legend}>{f.legendFine}</Text>
      <Pressable style={({ pressed }) => [st.linkRow, pressed && { opacity: 0.8 }]} onPress={() => go('recap')} accessibilityRole="button" accessibilityLabel={f.recapLink}>
        <CalendarCheckGlyph />
        <Text style={st.linkTxt}>{f.recapLink}</Text>
        <ChevronRight size={16} color={SELECTED} />
      </Pressable>
    </>
  );

  const renderCreneauxDetail = () => {
    const slots = detailTarget ? fineSlotsFor(av, detailTarget.day, detailTarget.half) : [];
    return (
      <>
        <Text style={st.detailSub}>{f.detailedOn}</Text>
        <Card>
          {slots.length === 0 ? (
            <View style={st.emptyRow}><Clock size={20} color={ON_CARD_2} /><Text style={st.emptyTxt}>{a.fine.empty}</Text></View>
          ) : (
            slots.map((s, i) => (
              <View key={s.id} style={[st.fineRow, i > 0 && st.divider]}>
                <Pressable style={({ pressed }) => [st.fineMain, pressed && { opacity: 0.7 }]} onPress={() => startEditSlot(s)} accessibilityRole="button" accessibilityLabel={`${formatClock(s.start)} → ${formatClock(s.end)}, ${formatFineZones(s, a.fine.allZones)}, ≤ ${s.travelMin} min`}>
                  <Text style={st.fineTime}>{formatClock(s.start)} → {formatClock(s.end)}</Text>
                  <Text style={st.fineMeta} numberOfLines={1}>{formatFineZones(s, a.fine.allZones)} · ≤ {s.travelMin} min</Text>
                </Pressable>
                <Pressable hitSlop={8} onPress={() => removeFine(s.id)} style={st.iconBtn} accessibilityRole="button" accessibilityLabel={a.fine.remove}>
                  <Trash2 size={16} color={ON_CARD_2} />
                </Pressable>
              </View>
            ))
          )}
          <Pressable style={({ pressed }) => [st.addRow, slots.length > 0 && st.divider, pressed && { opacity: 0.85 }]} onPress={startAddSlot} accessibilityRole="button" accessibilityLabel={f.addSlot}>
            <Plus size={20} color={SELECTED} />
            <Text style={st.addTxt}>{f.addSlot}</Text>
          </Pressable>
        </Card>
        <Note title={f.gapTitle} body={f.gapBody} />
      </>
    );
  };

  const renderSlotTime = () => {
    if (!detailTarget || !slotDraft) return null;
    const { starts, ends } = timeGrid(detailTarget.half);
    const valid = slotDraft.end > slotDraft.start;
    return (
      <>
        <Card>
          <View style={st.cardPad}>
            <Text style={st.fieldLabel}>{e.fine.start}</Text>
            <View style={st.chipWrap}>
              {starts.map((t) => <Chip key={t} label={formatClock(t)} selected={slotDraft.start === t} onPress={() => pickStart(t)} />)}
            </View>
            <Text style={[st.fieldLabel, { marginTop: sp.md }]}>{e.fine.end}</Text>
            <View style={st.chipWrap}>
              {ends.map((t) => <Chip key={t} label={formatClock(t)} selected={slotDraft.end === t} onPress={() => pickEnd(t)} a11y={formatClock(t)} />)}
            </View>
          </View>
        </Card>
        <View style={[st.selected, !valid && { borderColor: color.danger }]}>
          <Text style={st.selectedLabel}>{e.fine.selected}</Text>
          <Text style={st.selectedVal}>{formatClock(slotDraft.start)} → {formatClock(slotDraft.end)}</Text>
          {!valid ? <Text style={st.selectedErr}>{f.endAfterStart}</Text> : null}
        </View>
        <PrimaryButton label={f.nextZones} icon={<ChevronRight size={18} color={color.onAction} />} style={st.cta} disabled={!valid} onPress={() => go('slotZones')} accessibilityLabel={f.nextZones} />
      </>
    );
  };

  const renderSlotZones = () => {
    if (!slotDraft) return null;
    const pool = ZONE_OPTIONS.filter((z) => av.zones.includes(z.code));
    return (
      <>
        <Text style={st.detailSub}>{formatClock(slotDraft.start)} → {formatClock(slotDraft.end)}</Text>
        <Intro>{f.slotZonesIntro}</Intro>
        <Pressable style={[st.radio, slotDraft.allZones && st.radioOn]} onPress={() => setAllZones(true)} accessibilityRole="radio" accessibilityState={{ selected: slotDraft.allZones }}>
          <View style={[st.radioDot, slotDraft.allZones && st.radioDotOn]}>{slotDraft.allZones ? <View style={st.radioInner} /> : null}</View>
          <View style={{ flex: 1 }}>
            <Text style={st.radioTitle}>{e.fine.allZones}</Text>
            <Text style={st.radioHint}>{formatZones(av.zones, a.areasNone)} ({f.allZonesHint})</Text>
          </View>
        </Pressable>
        <Pressable style={[st.radio, !slotDraft.allZones && st.radioOn]} onPress={() => setAllZones(false)} accessibilityRole="radio" accessibilityState={{ selected: !slotDraft.allZones }}>
          <View style={[st.radioDot, !slotDraft.allZones && st.radioDotOn]}>{!slotDraft.allZones ? <View style={st.radioInner} /> : null}</View>
          <View style={{ flex: 1 }}>
            <Text style={st.radioTitle}>{e.fine.restricted}</Text>
            <Text style={st.radioHint}>{f.restrictedHint}</Text>
          </View>
        </Pressable>

        {!slotDraft.allZones ? (
          <>
            <Text style={[st.fieldLabel, { marginTop: sp.md }]}>{e.fine.zonesSection}</Text>
            <View style={st.chipWrap}>
              {pool.map((z) => <Chip key={z.code} label={z.code} selected={slotDraft.zones.includes(z.code)} onPress={() => toggleSlotZone(z.code)} a11y={`${z.code} ${z.name}`} />)}
            </View>
          </>
        ) : null}

        <Text style={[st.fieldLabel, { marginTop: sp.md }]}>{e.fine.travel}</Text>
        <Card>
          <View style={st.cardPad}>
            <Stepper value={slotDraft.travelMin} min={TRAVEL.min} max={TRAVEL.max} step={TRAVEL.step} format={(v) => `≤ ${v} min`} onChange={setSlotTravel} decA11y={e.fine.decA11y} incA11y={e.fine.incA11y} />
            <Text style={st.travelHint}>{f.slotTravelHint}</Text>
          </View>
        </Card>
        <PrimaryButton label={f.validateSlot} icon={<Check size={18} color={color.onAction} />} style={st.cta} onPress={saveSlot} accessibilityLabel={f.validateSlot} />
      </>
    );
  };

  const renderRecap = () => (
    <>
      {weekdays.map((day) => {
        const am = !!av.slots[day]?.am, pm = !!av.slots[day]?.pm;
        const lines: { fine: boolean; text: string }[] = [];
        HALVES.forEach((half) => {
          if (!av.slots[day]?.[half]) return;
          const fs = fineSlotsFor(av, day, half);
          if (fs.length) fs.forEach((s) => lines.push({ fine: true, text: `${formatClock(s.start)} → ${formatClock(s.end)} · ${formatFineZones(s, f.allZonesShort)} · ≤ ${s.travelMin} min` }));
          else lines.push({ fine: false, text: `${half === 'am' ? f.amRange : f.pmRange} · ${f.allZonesShort} · ≤ ${av.travelMin} min` });
        });
        return (
          <View key={day} style={[st.recapCard, !(am || pm) && st.recapOff]}>
            <Text style={st.recapDay}>{day}</Text>
            {am || pm ? (
              lines.map((ln, i) => (
                <View key={i} style={st.recapLine}>
                  <View style={[st.recapDot, { backgroundColor: ln.fine ? MARK_FINE : MARK_FULL }]} />
                  <Text style={st.recapTxt}>{ln.text}</Text>
                </View>
              ))
            ) : (
              <Text style={st.recapClosed}>{f.closed}</Text>
            )}
          </View>
        );
      })}
    </>
  );

  const renderValidation = () => (
    <>
      <Intro>{f.timeOffIntro}</Intro>
      {av.timeOff.map((p) => (
        <View key={p.id} style={st.periodRow}>
          <CalendarX size={18} color={palette.or[800]} />
          <View style={{ flex: 1 }}>
            <Text style={st.periodLabel}>{p.label}</Text>
            <Text style={st.periodDates}>{p.start} → {p.end}</Text>
          </View>
          <Pressable hitSlop={8} onPress={() => removePeriod(p.id)} style={st.iconBtn} accessibilityRole="button" accessibilityLabel={f.removePeriod}>
            <Trash2 size={16} color={ON_CARD_2} />
          </Pressable>
        </View>
      ))}

      {periodForm ? (
        <Card style={{ marginTop: sp.xs }}>
          <View style={st.cardPad}>
            <Field label={f.periodLabel} value={periodForm.label} onChangeText={(t) => setPeriodForm((s) => s && { ...s, label: t })} placeholder={f.periodLabelPh} autoCapitalize="sentences" />
            <View style={st.fieldRow}>
              <Field label={f.periodStart} value={periodForm.start} onChangeText={(t) => setPeriodForm((s) => s && { ...s, start: t })} placeholder={f.periodDatePh} />
              <Field label={f.periodEnd} value={periodForm.end} onChangeText={(t) => setPeriodForm((s) => s && { ...s, end: t })} placeholder={f.periodDatePh} />
            </View>
            <PrimaryButton label={f.savePeriod} icon={<Plus size={16} color={color.onAction} />} compact style={{ marginTop: sp.sm }} onPress={addPeriod} accessibilityLabel={f.savePeriod} />
          </View>
        </Card>
      ) : (
        <Pressable style={({ pressed }) => [st.dashed, pressed && { opacity: 0.8 }]} onPress={() => setPeriodForm({ label: '', start: '', end: '' })} accessibilityRole="button" accessibilityLabel={f.addPeriod}>
          <Plus size={18} color={ON_CANVAS_2} />
          <Text style={st.dashedTxt}>{f.addPeriod}</Text>
        </Pressable>
      )}

      {/* Final recap */}
      <View style={st.finalCard}>
        <View style={st.finalHead}><Check size={16} color={MARK_FULL} /><Text style={st.finalTitle}>{f.finalRecap}</Text></View>
        <Text style={st.finalLine}>{transportLabel(av.transport, e.transport)} · ≤ {av.travelMin} min</Text>
        <Text style={st.finalLine}>{addressLine(av.primaryAddress)}{av.secondaryAddress ? ` + ${av.secondaryAddress.ville}` : ''}</Text>
        <Text style={st.finalLine}>{a.areas} : {formatZones(av.zones, a.areasNone)}</Text>
        <Text style={st.finalLine}>{activeSlots} {f.halfDayCount} · {fineDays} {f.fineDayCount}</Text>
        {av.timeOff.length ? <Text style={st.finalLine}>{av.timeOff.map((p) => p.label).join(' · ')}</Text> : null}
      </View>

      <PrimaryButton label={f.confirm} icon={<Check size={18} color={color.onAction} />} style={st.cta} onPress={confirmAll} accessibilityLabel={f.confirm} />
    </>
  );

  const renderStep = () => {
    switch (step) {
      case 'hub': return renderHub();
      case 'transport': return renderTransport();
      case 'addressPrimary': return renderAddressPrimary();
      case 'addressSecondary': return renderAddressSecondary();
      case 'zones': return renderZones();
      case 'creneaux': return renderCreneaux();
      case 'creneauxDetail': return renderCreneauxDetail();
      case 'slotTime': return renderSlotTime();
      case 'slotZones': return renderSlotZones();
      case 'recap': return renderRecap();
      case 'validation': return renderValidation();
    }
  };

  const canBack = stack.length > 1;

  return (
    <Modal visible={visible} onRequestClose={() => (canBack ? back() : onClose())} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        {/* ===== Top bar — back (when nested) + eyebrow/title left, close right ===== */}
        <View style={st.topbar}>
          {canBack ? (
            <Pressable onPress={back} hitSlop={8} style={st.backBtn} accessibilityRole="button" accessibilityLabel={f.back}>
              <ChevronLeft size={24} color={ON_CANVAS} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Eyebrow>{a.eyebrow}</Eyebrow>
            <Text style={st.title} numberOfLines={1}>{titles[step]}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.closeBtn} accessibilityRole="button" accessibilityLabel={a.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp['2xl'] + kb }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        {/* ===== Persistent potential gauge (mockup floating gauge), in house style ===== */}
        <View style={st.footer}>
          <View style={st.footerRow}>
            <View style={st.footerL}><Activity size={14} color={ON_CANVAS_2} /><Text style={st.footerLabel}>{f.gauge}</Text></View>
            <Text style={[st.footerLevel, { color: LEVEL_COLOR[pot.level] }]}>{a.potential.approx}{pot.sessions} · {a.potential.levels[pot.level]}</Text>
          </View>
          <View style={st.meter} accessibilityRole="progressbar" accessibilityLabel={a.potential.a11y} accessibilityValue={{ min: 0, max: 100, now: Math.round(pot.ratio * 100) }}>
            <LinearGradient colors={MOVEMENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[st.meterFill, { width: `${Math.round(pot.ratio * 100)}%` }]} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* Hub row — leading icon, label (+ optional pill), value below, chevron. */
function HubRow({ icon: Icon, label, value, pill, first, onPress }: {
  icon: LucideIcon; label: string; value?: string; pill?: string; first?: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [st.row, !first && st.divider, pressed && { opacity: 0.85 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
    >
      <View style={st.rowIcon}><Icon size={22} color={ON_CARD_2} /></View>
      <View style={{ flex: 1 }}>
        <View style={st.rowTop}>
          <Text style={st.rowLabel}>{label}</Text>
          {pill ? <View style={st.pill}><Text style={st.pillTxt}>{pill}</Text></View> : null}
        </View>
        {value ? <Text style={st.rowValue} numberOfLines={2}>{value}</Text> : null}
      </View>
      <ChevronRight size={18} color={ON_CARD_2} />
    </Pressable>
  );
}

// Small inline calendar-check glyph for the recap link (kept local to avoid another import alias).
function CalendarCheckGlyph() {
  return <CalendarClock size={16} color={SELECTED} />;
}

/* ============================== styles ==============================
   Polarity: on the CANVAS → ON_CANVAS / ON_CANVAS_2; inside a white CARD → ON_CARD / ON_CARD_2 */
const st = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md },
  backBtn: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  title: { fontFamily: F.oswS, fontSize: 26, lineHeight: 30, color: ON_CANVAS, marginTop: 2 },
  closeBtn: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: SUBTLE },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },

  intro: { fontFamily: F.body, fontSize: 15, lineHeight: 20, color: ON_CANVAS_2, marginTop: sp.xs, marginBottom: sp.md },
  qLabel: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS, marginBottom: sp.sm },

  freshRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: sp.sm },
  updated: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2 },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, backgroundColor: 'rgba(242,194,0,0.13)', borderColor: 'rgba(242,194,0,0.35)', borderWidth: 1, borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm },
  nudgeTxt: { flex: 1, fontFamily: F.body, fontSize: 15, color: palette.or[800] },

  card: { borderRadius: r.xl, paddingHorizontal: sp.md, backgroundColor: palette.neutral[0], borderWidth: 1, borderColor: HAIRLINE, overflow: 'hidden' },
  cardPad: { paddingVertical: sp.md },
  divider: { borderTopWidth: 1, borderTopColor: DIVIDER },

  // Hub rows
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 60, paddingVertical: sp.sm },
  rowIcon: { width: 26, alignItems: 'center', justifyContent: 'center' },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  rowLabel: { fontFamily: F.bodyS, fontSize: 16, color: ON_CARD },
  rowValue: { fontFamily: F.body, fontSize: 13, color: ON_CARD_2, marginTop: 2 },
  pill: { backgroundColor: SELECTED_BG, borderRadius: r.pill, paddingHorizontal: 8, paddingVertical: 2 },
  pillTxt: { fontFamily: F.bodyS, fontSize: 11, color: color.actionActive },

  cta: { marginTop: sp.lg },

  // Notes
  note: { flexDirection: 'row', gap: sp.sm, backgroundColor: color.infoSoft, borderRadius: r.lg, padding: sp.md, marginTop: sp.md },
  noteTitle: { fontFamily: F.bodyS, fontSize: 13, color: palette.bleu[700], marginBottom: 2 },
  noteBody: { fontFamily: F.body, fontSize: 13, lineHeight: 18, color: palette.bleu[700] },

  // Stepper
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 48, height: 48, borderRadius: r.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[100] },
  stepBtnOff: { backgroundColor: palette.neutral[50] },
  stepVal: { fontFamily: F.oswB, fontSize: 26, color: ON_CARD },

  // Transport tiles
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  tile: { width: '47.8%', flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: sp.lg, borderRadius: r.xl, borderWidth: 1, borderColor: HAIRLINE, backgroundColor: palette.neutral[0] },
  tileSel: { borderColor: SELECTED, borderWidth: 2, backgroundColor: SELECTED_BG },
  tileTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD },

  // Address fields
  addrHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  addrHeadL: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: sp.xs },
  addrHeadTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD },
  badge: { backgroundColor: color.progressSoft, borderRadius: r.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt: { fontFamily: F.bodyS, fontSize: 11, color: palette.vert[700] },
  field: { flex: 1 },
  fieldLabel: { fontFamily: F.bodyS, fontSize: 13, color: ON_CARD_2, marginBottom: 6, marginTop: sp.sm },
  fieldRow: { flexDirection: 'row', gap: sp.sm },
  input: { fontFamily: F.body, fontSize: 16, color: ON_CARD, backgroundColor: palette.neutral[50], borderWidth: 1, borderColor: HAIRLINE, borderRadius: r.lg, paddingHorizontal: sp.md, paddingVertical: 12, minHeight: 48 },

  dashed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp.sm, borderWidth: 1, borderColor: 'rgba(24,23,21,0.20)', borderStyle: 'dashed', borderRadius: r.lg, paddingVertical: sp.md, marginTop: sp.sm },
  dashedTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS_2 },

  removeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: sp.sm, paddingVertical: sp.md, marginTop: sp.md },
  removeTxt: { fontFamily: F.bodyS, fontSize: 14, color: color.danger },

  // Day-picker (secondary address)
  dayRow: { flexDirection: 'row', gap: sp.xs },
  dayCell: { flex: 1, aspectRatio: 1, borderRadius: r.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[100], borderWidth: 1, borderColor: HAIRLINE },
  dayCellOn: { backgroundColor: SELECTED, borderColor: SELECTED },
  dayCellTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  daySummary: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, textAlign: 'center', marginTop: sp.sm },

  // Zones
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 52, paddingVertical: sp.sm },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: palette.neutral[300], alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: SELECTED, borderColor: SELECTED },
  zoneTxt: { flex: 1, fontFamily: F.body, fontSize: 15, color: ON_CARD_2 },

  // Créneaux segmented + grid
  seg: { flexDirection: 'row', gap: 4, backgroundColor: palette.neutral[100], borderRadius: r.lg, padding: 4, marginBottom: sp.sm },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: r.md, alignItems: 'center' },
  segBtnOn: { backgroundColor: palette.neutral[0] },
  segTxt: { fontFamily: F.bodyS, fontSize: 13, color: ON_CANVAS_2 },
  segTxtOn: { color: ON_CARD },
  gridHint: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, marginBottom: sp.sm },
  gridHeader: { flexDirection: 'row', gap: sp.xs, marginBottom: 4 },
  gridHeadTxt: { flex: 1, textAlign: 'center', fontFamily: F.bodyS, fontSize: 12, color: ON_CARD_2 },
  gridRowLabel: { fontFamily: F.bodyS, fontSize: 13, color: ON_CARD, marginTop: sp.sm, marginBottom: 4 },
  gridRowRange: { fontFamily: F.body, fontSize: 12, color: ON_CARD_2 },
  gridRow: { flexDirection: 'row', gap: sp.xs },
  cell: { flex: 1, aspectRatio: 1, borderRadius: r.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[100], borderWidth: 1, borderColor: HAIRLINE },
  cellOn: { backgroundColor: color.progressSoft, borderColor: palette.vert[300] },
  cellFine: { backgroundColor: color.warningSoft, borderColor: palette.or[300] },
  cellTxt: { fontFamily: F.bodyS, fontSize: 14, color: palette.neutral[400] },
  cellDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: MARK_FINE },
  legend: { fontFamily: F.body, fontSize: 12, color: ON_CANVAS_2, marginTop: sp.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingVertical: sp.md, marginTop: sp.xs },
  linkTxt: { flex: 1, fontFamily: F.bodyS, fontSize: 15, color: SELECTED },

  // Détaillé list
  detailSub: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, marginBottom: sp.sm },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.lg },
  emptyTxt: { flex: 1, fontFamily: F.body, fontSize: 14, color: ON_CARD_2 },
  fineRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, minHeight: 56 },
  fineMain: { flex: 1, paddingVertical: sp.sm },
  fineTime: { fontFamily: F.bodyS, fontSize: 16, color: ON_CARD },
  fineMeta: { fontFamily: F.body, fontSize: 13, color: ON_CARD_2, marginTop: 1 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 52 },
  addTxt: { fontFamily: F.bodyS, fontSize: 16, color: SELECTED },

  // Slot time picker
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.xs },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: r.lg, borderWidth: 1, borderColor: HAIRLINE, backgroundColor: palette.neutral[0], minWidth: 56, alignItems: 'center' },
  chipSel: { backgroundColor: SELECTED, borderColor: SELECTED },
  chipTxt: { fontFamily: F.body, fontSize: 14, color: ON_CARD },
  selected: { backgroundColor: color.progressSoft, borderWidth: 1, borderColor: palette.vert[300], borderRadius: r.lg, padding: sp.md, alignItems: 'center', marginTop: sp.md },
  selectedLabel: { fontFamily: F.body, fontSize: 12, color: palette.vert[700] },
  selectedVal: { fontFamily: F.oswB, fontSize: 22, color: palette.vert[700], marginTop: 2 },
  selectedErr: { fontFamily: F.body, fontSize: 12, color: color.danger, marginTop: 4 },

  // Slot zones radios
  radio: { flexDirection: 'row', alignItems: 'center', gap: sp.md, padding: sp.md, borderRadius: r.lg, borderWidth: 1, borderColor: HAIRLINE, backgroundColor: palette.neutral[0], marginBottom: sp.sm },
  radioOn: { borderColor: SELECTED, borderWidth: 2, backgroundColor: SELECTED_BG },
  radioDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: palette.neutral[300], alignItems: 'center', justifyContent: 'center' },
  radioDotOn: { borderColor: SELECTED },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: SELECTED },
  radioTitle: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD },
  radioHint: { fontFamily: F.body, fontSize: 12, color: ON_CARD_2, marginTop: 1 },
  travelHint: { fontFamily: F.body, fontSize: 12, color: ON_CARD_2, textAlign: 'center', marginTop: sp.sm },

  // Recap
  recapCard: { backgroundColor: palette.neutral[0], borderWidth: 1, borderColor: HAIRLINE, borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm },
  recapOff: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  recapDay: { fontFamily: F.oswS, fontSize: 14, color: ON_CARD, marginBottom: 4 },
  recapLine: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: 2 },
  recapDot: { width: 7, height: 7, borderRadius: 4 },
  recapTxt: { flex: 1, fontFamily: F.body, fontSize: 13, color: ON_CARD_2 },
  recapClosed: { fontFamily: F.body, fontSize: 13, color: ON_CANVAS_2, fontStyle: 'italic' },

  // Validation
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, backgroundColor: 'rgba(242,194,0,0.10)', borderWidth: 1, borderColor: 'rgba(242,194,0,0.30)', borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm },
  periodLabel: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD },
  periodDates: { fontFamily: F.body, fontSize: 13, color: palette.or[800], marginTop: 1 },
  finalCard: { backgroundColor: color.progressSoft, borderWidth: 1, borderColor: palette.vert[300], borderRadius: r.xl, padding: sp.lg, marginTop: sp.md },
  finalHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: sp.sm },
  finalTitle: { fontFamily: F.bodyB, fontSize: 14, color: palette.vert[700] },
  finalLine: { fontFamily: F.body, fontSize: 14, lineHeight: 21, color: palette.vert[700] },

  // Footer gauge
  footer: { paddingHorizontal: sp.lg, paddingTop: sp.sm, paddingBottom: sp.lg, borderTopWidth: 1, borderTopColor: HAIRLINE, backgroundColor: CANVAS },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  footerL: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerLabel: { fontFamily: F.bodyS, fontSize: 12, color: ON_CANVAS_2 },
  footerLevel: { fontFamily: F.bodyS, fontSize: 12 },
  meter: { height: 8, borderRadius: r.pill, backgroundColor: palette.neutral[200], overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: r.pill },
});
