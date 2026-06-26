/**
 * ActionModal — a bottom sheet (dimmed backdrop, slides up from the bottom edge) for one focused
 * prompt: an icon, title, body, an optional numbered checklist or a highlighted note, and one or
 * two actions. Anchored to the bottom with a grabber handle, mirroring the Earnings sheet so the
 * app speaks one modal language.
 *
 * Mirrors the NotificationCenter detail popup so the app speaks one modal language. The Home
 * banners (report-due, availability) use it to turn a nudge into an actionable sheet. The icon
 * carries the semantic accent (gold = report, blue = availability); the primary button stays
 * the brand red so "the action" reads the same everywhere.
 */
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { X, Phone, StickyNote, type LucideIcon } from '../icons';

import { palette, color, spacing as sp, radius as r, cardShape } from '../theme/theme';
import { BottomSheet } from './BottomSheet';
import { GradientFill } from './GradientFill';
import { callNumber } from '../lib/callNumber';

const SUBTLE = palette.neutral[100];
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const ON_CARD_3 = palette.neutral[600];

const F = { oswR: 'Oswald_400Regular', oswS: 'Oswald_600SemiBold', oswM: 'Oswald_500Medium', body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold', bodyB: 'Inter_700Bold' };

// One scannable fact (icon + small label + value), optionally tappable (e.g. address → directions)
// and with a quiet sub-line (e.g. the contact's phone number). Used by the session-detail sheets to
// replace a wall-of-text body with skimmable rows (Mobbin: Square Go / CVS / Fresha / Shift).
export type ActionInfoRow = {
  Icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  onPress?: () => void;
  rowA11y?: string;
};

// A prominent quick action rendered as a chip in a row under the title (e.g. Call · Directions).
export type ActionQuickAction = {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  a11y?: string;
};

export type ActionModalProps = {
  visible: boolean;
  onClose: () => void;
  Icon: LucideIcon;
  accentFg: string;
  accentBg: string;
  eyebrow?: string;
  /** Status as a coloured dot + label pill (replaces the muted eyebrow when present). */
  statusPill?: { label: string; fg: string; bg: string };
  title: string;
  /** Plain-text body (kept for the simple banner callers). Omit when using `infoRows`. */
  body?: string;
  /** Prominent quick actions (Call / Directions) shown as a chip row under the title. */
  quickActions?: readonly ActionQuickAction[];
  /** Scannable icon+label+value rows — replace `body` for detail sheets. */
  infoRows?: readonly ActionInfoRow[];
  steps?: readonly string[]; // numbered checklist (e.g. the 6 report steps)
  note?: string;             // a single highlighted summary line (e.g. current availability)
  /** Tap-to-call phone shown under the note (DT-12) — e.g. the on-site contact's direct line. */
  notePhone?: string;
  noteCallA11y?: string;
  /** Previous coach's handover note (DT-09 / SESS-01 Step 2), shown directly between the contact
   *  note and the action — a continuity note the next coach reads before arriving (not behind a menu). */
  handover?: { label: string; meta: string; text: string };
  primaryLabel: string;
  onPrimary?: () => void;
  /** Optional icon rendered to the left of the primary label. */
  primaryIcon?: React.ReactNode;
  /** Visual tone of the primary button. 'brand' (default) = the rouge→or movement gradient (DT-02);
   *  'danger' = flat danger red — reserved for destructive confirmations (cancel, withdraw, delete,
   *  log out) where the celebratory gradient would read wrong. */
  primaryTone?: 'brand' | 'danger';
  secondaryLabel?: string;
  onSecondary?: () => void;
  closeA11y?: string;
  // Optional full-width media at the very top (e.g. a map preview, Fresha pattern). When present it
  // replaces the icon-chip row — the media IS the visual — and the close button overlays it.
  media?: React.ReactNode;
};

export function ActionModal({
  visible, onClose, Icon, accentFg, accentBg, eyebrow, statusPill, title, body, quickActions, infoRows,
  steps, note, notePhone, noteCallA11y, handover, primaryLabel, onPrimary, primaryIcon, primaryTone = 'brand', secondaryLabel, onSecondary, closeA11y, media,
}: ActionModalProps) {
  const a11y = closeA11y ?? 'Close';
  // Cap the sheet a touch under full height so the dimmed backdrop stays visible above it; the
  // middle content scrolls when it overflows while the header (map/icon) and CTA stay pinned.
  const { height: winH } = useWindowDimensions();
  const cardMaxH = Math.round(winH * 0.85);
  return (
    <BottomSheet visible={visible} onClose={onClose} a11yLabel={a11y} contentStyle={{ maxHeight: cardMaxH }}>
          {media ? (
            <View style={st.media}>
              {media}
              <Pressable onPress={onClose} hitSlop={8} style={st.mediaClose} accessibilityRole="button" accessibilityLabel={a11y}>
                <X size={20} color={ON_CARD} />
              </Pressable>
            </View>
          ) : (
            <View style={st.top}>
              <View style={st.icon}>
                <Icon size={26} color={ON_CARD} />
              </View>
              <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={a11y}>
                <X size={22} color={ON_CARD} />
              </Pressable>
            </View>
          )}

          {/* The middle content scrolls when it overflows the capped sheet; header + CTA stay pinned. */}
          <ScrollView
            style={st.scroll}
            contentContainerStyle={st.scrollBody}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
          {statusPill ? (
            <View style={[st.statusPill, { backgroundColor: statusPill.bg }]}>
              <View style={[st.statusDot, { backgroundColor: statusPill.fg }]} />
              <Text style={[st.statusPillTxt, { color: statusPill.fg }]}>{statusPill.label}</Text>
            </View>
          ) : eyebrow ? (
            <Text style={st.eyebrow}>{eyebrow}</Text>
          ) : null}
          <Text style={st.title}>{title}</Text>

          {/* Quick actions (Call / Directions) — prominent chips under the title (Square Go pattern). */}
          {quickActions?.length ? (
            <View style={st.quickRow}>
              {quickActions.map((qa, i) => {
                const QIcon = qa.Icon;
                return (
                  <Pressable
                    key={i}
                    onPress={qa.onPress}
                    style={({ pressed }) => [st.quickBtn, pressed && { opacity: 0.7 }]}
                    accessibilityRole="button"
                    accessibilityLabel={qa.a11y ?? qa.label}
                  >
                    <QIcon size={18} color={ON_CARD} />
                    <Text style={st.quickTxt}>{qa.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* Scannable fact rows (icon + label + value) — replace the text body for detail sheets. */}
          {infoRows?.length ? (
            <View style={st.infoRows}>
              {infoRows.map((row, i) => {
                const RIcon = row.Icon;
                const inner = (
                  <>
                    <View style={st.infoIcon}><RIcon size={18} color={ON_CARD_2} /></View>
                    <View style={st.infoTextWrap}>
                      <Text style={st.infoLabel}>{row.label}</Text>
                      <Text style={st.infoValue}>{row.value}</Text>
                      {row.sub ? <Text style={st.infoSub}>{row.sub}</Text> : null}
                    </View>
                  </>
                );
                return row.onPress ? (
                  <Pressable
                    key={i}
                    onPress={row.onPress}
                    style={({ pressed }) => [st.infoRow, pressed && { opacity: 0.6 }]}
                    accessibilityRole="button"
                    accessibilityLabel={row.rowA11y ?? `${row.label}, ${row.value}`}
                  >
                    {inner}
                  </Pressable>
                ) : (
                  <View key={i} style={st.infoRow} accessible accessibilityLabel={row.rowA11y ?? `${row.label}, ${row.value}${row.sub ? `, ${row.sub}` : ''}`}>
                    {inner}
                  </View>
                );
              })}
            </View>
          ) : body ? (
            <Text style={st.body}>{body}</Text>
          ) : null}

          {note ? (
            <View style={st.note}>
              <Text style={st.noteTxt}>{note}</Text>
              {/* Direct clickable phone number (DT-12) — taps through to the device dialer. */}
              {notePhone ? (
                <Pressable
                  onPress={() => callNumber(notePhone)}
                  hitSlop={8}
                  style={({ pressed }) => [st.callLink, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button"
                  accessibilityLabel={noteCallA11y ? `${noteCallA11y}, ${notePhone}` : notePhone}
                >
                  <Phone size={15} color={color.info} />
                  <Text style={st.callTxt}>{notePhone}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* Previous coach's handover note (DT-09) — displayed directly, not behind a menu. */}
          {handover ? (
            <View style={st.handover}>
              <View style={st.handoverHead}>
                <StickyNote size={14} color={ON_CARD_2} />
                <Text style={st.handoverLabel}>{handover.label}</Text>
              </View>
              <Text style={st.handoverText}>{handover.text}</Text>
              <Text style={st.handoverMeta}>{handover.meta}</Text>
            </View>
          ) : null}

          {steps?.length ? (
            <View style={st.steps}>
              {steps.map((s, i) => (
                <View key={i} style={st.stepRow}>
                  <View style={[st.stepNum, { backgroundColor: accentBg }]}>
                    <Text style={[st.stepNumTxt, { color: accentFg }]}>{i + 1}</Text>
                  </View>
                  <Text style={st.stepTxt}>{s}</Text>
                </View>
              ))}
            </View>
          ) : null}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [st.primary, primaryTone === 'danger' && st.primaryDanger, !!primaryIcon && st.primaryRow, pressed && { opacity: 0.9 }]}
            onPress={() => { onPrimary?.(); onClose(); }}
            accessibilityRole="button"
          >
            {/* Brand CTAs carry the rouge→or gradient (DT-02); destructive confirms stay flat danger. */}
            {primaryTone !== 'danger' ? <GradientFill /> : null}
            {primaryIcon}
            <Text style={st.primaryTxt}>{primaryLabel}</Text>
          </Pressable>

          {secondaryLabel ? (
            <Pressable
              style={({ pressed }) => [st.secondary, pressed && { opacity: 0.6 }]}
              onPress={() => { onSecondary?.(); onClose(); }}
              accessibilityRole="button"
            >
              <Text style={st.secondaryTxt}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}
    </BottomSheet>
  );
}

const st = StyleSheet.create({
  // Media slot (e.g. map preview) — sits at the top with the close button overlaid top-right.
  media: { position: 'relative', marginBottom: sp.xs },
  mediaClose: {
    position: 'absolute', top: sp.sm, right: sp.sm,
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  // Scrollable middle region — flexShrink lets it give way (and scroll) when the capped sheet
  // can't fit everything; with short content it sizes to its content and never scrolls.
  scroll: { flexShrink: 1 },
  scrollBody: { paddingBottom: sp.xs },
  // Darker than the card (neutral-0) so the dark glyph sits on a clearly distinct chip.
  icon: {
    width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[200], borderWidth: 1, borderColor: 'rgba(24,23,21,0.04)',
  },
  close: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  // Matches the Home card type system: Inter throughout — bold title (like the hero card),
  // muted Inter eyebrow + body, Inter SemiBold note. (Oswald is reserved for section titles.)
  eyebrow: { fontFamily: F.body, fontSize: 13, letterSpacing: 0.3, color: ON_CARD_3, marginTop: sp.md },
  // Status pill (dot + label) — replaces the eyebrow for the session sheets (Fresha/Jobber pattern).
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: sp.md, paddingVertical: 4, paddingHorizontal: 10, borderRadius: r.pill },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  statusPillTxt: { fontFamily: F.bodyS, fontSize: 13, letterSpacing: 0.2 },
  title: { fontFamily: F.bodyB, fontSize: 22, color: ON_CARD, marginTop: 4 },
  body: { fontFamily: F.body, fontSize: 16, lineHeight: 22, color: ON_CARD_2, marginTop: sp.sm },

  // Quick-action chip row (Call / Directions) — equal-width subtle chips under the title.
  quickRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.md },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: r.button, backgroundColor: SUBTLE },
  quickTxt: { fontFamily: F.bodyS, fontSize: 15, letterSpacing: 0.2, color: ON_CARD },

  // Scannable fact rows — icon anchor + small muted label + bold value (+ optional quiet sub-line).
  infoRows: { marginTop: sp.lg, gap: sp.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.sm },
  infoIcon: { width: 26, alignItems: 'center', paddingTop: 2 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontFamily: F.body, fontSize: 12, letterSpacing: 0.3, color: ON_CARD_3, marginBottom: 1 },
  infoValue: { fontFamily: F.bodyS, fontSize: 16, lineHeight: 21, color: ON_CARD },
  infoSub: { fontFamily: F.body, fontSize: 15, color: ON_CARD_2, marginTop: 2 },

  // No box / horizontal padding — the note reads as a left-aligned line flush with the title and
  // address (the SUBTLE background equalled the card colour, so the box was invisible anyway).
  note: { marginTop: sp.md },
  noteTxt: { fontFamily: F.bodyS, fontSize: 16, color: ON_CARD, letterSpacing: 0.2, textAlign: 'left' },
  // Tap-to-call link (DT-12) — blue interactive number under the contact note (colour = clickable).
  callLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, minHeight: 32, alignSelf: 'flex-start' },
  callTxt: { fontFamily: F.bodyS, fontSize: 16, color: color.info, letterSpacing: 0.2 },

  // Previous coach's handover note (DT-09) — a soft callout block so the continuity note reads as
  // distinct from the contact line, shown directly (not behind a menu).
  handover: { marginTop: sp.md, padding: sp.md, ...cardShape, backgroundColor: palette.neutral[100] },
  handoverHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  handoverLabel: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.6, color: ON_CARD_2 },
  handoverText: { fontFamily: F.body, fontSize: 16, lineHeight: 20, color: ON_CARD },
  handoverMeta: { fontFamily: F.body, fontSize: 13, color: ON_CARD_3, marginTop: 6 },

  steps: { marginTop: sp.md, gap: sp.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  stepNum: { width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt: { fontFamily: F.bodyS, fontSize: 13 },
  stepTxt: { flex: 1, fontFamily: F.body, fontSize: 14, color: ON_CARD_2 },

  primary: {
    minHeight: 48, borderRadius: r.button, backgroundColor: color.action,
    alignItems: 'center', justifyContent: 'center', marginTop: sp.lg, overflow: 'hidden',
  },
  // Destructive confirmations (cancel / withdraw / delete / log out) — flat darkest red, no gradient.
  primaryDanger: { backgroundColor: color.danger },
  primaryRow: { flexDirection: 'row', gap: 8 },
  primaryTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
  secondary: { minHeight: 44, borderRadius: r.button, alignItems: 'center', justifyContent: 'center', marginTop: sp.xs },
  secondaryTxt: { fontFamily: F.bodyS, fontSize: 14, letterSpacing: 0.2, color: ON_CARD_3 },
});
