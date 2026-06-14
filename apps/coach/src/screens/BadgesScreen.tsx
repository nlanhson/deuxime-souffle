/**
 * Coach · Badges & level (GAME-01 badge system · GAME-02 levels & progression).
 *
 * Brought IN by the client mismatch review (2026-06) — the PRD had deferred gamification. Scope is
 * the two WBS stories, nothing more: a level with progress toward the next (driven by completed
 * sessions), and a badge collection (earned + in-progress). The signature rouge→or gradient marks
 * the level meter — the theme reserves it for "hero CTAs / medals / progress", and this is the
 * medal case. Recognition only: the note says explicitly that none of this affects pay.
 *
 * Opened as a pageSheet modal from Profile ("Badges & level") and from the Home header's level
 * chip (PLA-01: "Dashboard displays Coach badge"). Mock data lives here as placeholders — real
 * code derives level + badges from the coach's session history. Surface = coach (ink).
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  X, Trophy, Star, Flame, Clock, MapPin, ShieldCheck, Users, Sparkles, type LucideIcon,
} from '../icons';
import { palette, spacing as sp, radius as r, surfaces, cardGradient as RAISED_GRAD } from '../theme/theme';
import { copy } from '../copy';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { BadgesSkeleton } from './skeletons';

const S = surfaces.coach;
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];
const SUBTLE = palette.neutral[800];
const TRACK = palette.neutral[700];
const MOVEMENT = [palette.rouge[500], palette.or[500]] as const; // medals/progress gradient
const GOLD = palette.or[300];

const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

/* ---------- mock progression data (placeholders — real code derives from session history) ---- */

// Exposed so the Home header chip (PLA-01) shows the same level without re-deriving.
export const CURRENT_LEVEL = 3;

const LEVEL = {
  current: CURRENT_LEVEL,
  next: CURRENT_LEVEL + 1,
  sessionsTotal: 86,
  // Sessions into the current level band vs the band's size (L3: 75 → L4: 100).
  bandDone: 11,
  bandSize: 25,
};

type BadgeKey = keyof typeof copy.game.badges;
type Badge = { key: BadgeKey; icon: LucideIcon; earned: string | null }; // earned = mock date label

const BADGES: Badge[] = [
  { key: 'first', icon: Sparkles, earned: 'Sep 2025' },
  { key: 'ten', icon: Star, earned: 'Oct 2025' },
  { key: 'fifty', icon: Trophy, earned: 'Feb 2026' },
  { key: 'punctual', icon: Clock, earned: 'Mar 2026' },
  { key: 'favourite', icon: Flame, earned: 'May 2026' },
  { key: 'hundred', icon: Trophy, earned: null },
  { key: 'explorer', icon: MapPin, earned: null },
  { key: 'streak', icon: ShieldCheck, earned: null },
];

/* ---------- screen ---------- */

export function BadgesScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = copy.game;
  const remaining = LEVEL.bandSize - LEVEL.bandDone;
  const pct = LEVEL.bandDone / LEVEL.bandSize;
  const earned = BADGES.filter((b) => b.earned);
  const locked = BADGES.filter((b) => !b.earned);
  const loading = useFirstLoad('badges', { active: visible, ms: 550 });

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={st.fill}>
        <View style={st.topbar}>
          <View style={{ flex: 1 }}>
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title} numberOfLines={1}>{c.title}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.closeBtn} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <Reveal loading={loading} skeleton={<BadgesSkeleton />}>
        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
          {/* ===== Level card (GAME-02) — the medal meter wears the signature gradient ===== */}
          <View style={st.card}>
            <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.xl }]} pointerEvents="none" />
            <View style={st.levelHead}>
              <View style={st.levelChip}>
                <Trophy size={22} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.levelTitle}>{`${c.levelPrefix} ${LEVEL.current}`}</Text>
                <Text style={st.levelSub}>{`${LEVEL.sessionsTotal} ${c.totalSuffix}`}</Text>
              </View>
            </View>
            <View
              style={st.meter}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: LEVEL.bandSize, now: LEVEL.bandDone }}
            >
              <LinearGradient
                colors={MOVEMENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[st.meterFill, { width: `${pct * 100}%` }]}
              />
            </View>
            <Text style={st.levelNext}>{`${remaining} ${c.toNextMid} ${LEVEL.next}`}</Text>
          </View>

          {/* ===== Earned badges (GAME-01) ===== */}
          <Text style={st.secTitle}>{c.earnedTitle}</Text>
          <View style={st.grid}>
            {earned.map((b) => (
              <View key={b.key} style={st.badge} accessible accessibilityLabel={`${c.badges[b.key].name}, ${c.earnedPrefix} ${b.earned}`}>
                <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.lg }]} pointerEvents="none" />
                <View style={st.badgeIcon}>
                  <b.icon size={22} color={GOLD} />
                </View>
                <Text style={st.badgeName} numberOfLines={1}>{c.badges[b.key].name}</Text>
                <Text style={st.badgeDesc} numberOfLines={2}>{c.badges[b.key].desc}</Text>
                <Text style={st.badgeDate}>{`${c.earnedPrefix} ${b.earned}`}</Text>
              </View>
            ))}
          </View>

          {/* ===== In-progress badges — dimmed, with their unlock condition ===== */}
          <Text style={st.secTitle}>{c.lockedTitle}</Text>
          <View style={st.grid}>
            {locked.map((b) => (
              <View key={b.key} style={[st.badge, st.badgeLocked]} accessible accessibilityLabel={`${c.badges[b.key].name}, ${c.badges[b.key].desc}`}>
                <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.lg }]} pointerEvents="none" />
                <View style={[st.badgeIcon, st.badgeIconLocked]}>
                  <b.icon size={22} color={ON_CARD_3} />
                </View>
                <Text style={[st.badgeName, { color: ON_CARD_2 }]} numberOfLines={1}>{c.badges[b.key].name}</Text>
                <Text style={st.badgeDesc} numberOfLines={2}>{c.badges[b.key].desc}</Text>
              </View>
            ))}
          </View>

          <Text style={st.note}>{c.note}</Text>
        </ScrollView>
        </Reveal>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: S.canvas },
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },
  title: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: ON_CANVAS, marginTop: 2 },
  closeBtn: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  scroll: { paddingHorizontal: sp.lg, paddingBottom: sp['2xl'] },

  card: {
    borderRadius: r.xl, padding: sp.lg, backgroundColor: palette.neutral[800],
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  levelHead: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  levelChip: {
    width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(242,194,0,0.13)',
  },
  levelTitle: { fontFamily: F.display, fontSize: 30, lineHeight: 38, color: ON_CARD },
  levelSub: { fontFamily: F.body, fontSize: 14, color: ON_CARD_2, marginTop: 2 },
  meter: { height: 8, borderRadius: 999, backgroundColor: TRACK, overflow: 'hidden', marginTop: sp.md },
  meterFill: { height: '100%', borderRadius: 999 },
  levelNext: { fontFamily: F.bodyS, fontSize: 13, color: ON_CARD_2, marginTop: sp.sm },

  secTitle: { fontFamily: F.oswS, fontSize: 18, letterSpacing: 0.3, color: ON_CANVAS, marginTop: sp.xl, marginBottom: sp.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  badge: {
    width: '48%', flexGrow: 1, borderRadius: r.lg, padding: sp.md,
    backgroundColor: palette.neutral[800], borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  badgeLocked: { opacity: 0.75 },
  badgeIcon: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(242,194,0,0.13)', marginBottom: sp.sm,
  },
  badgeIconLocked: { backgroundColor: palette.neutral[700] },
  badgeName: { fontFamily: F.bodyB, fontSize: 15, color: ON_CARD },
  badgeDesc: { fontFamily: F.body, fontSize: 12, lineHeight: 17, color: ON_CARD_3, marginTop: 2 },
  badgeDate: { fontFamily: F.bodyS, fontSize: 12, color: GOLD, marginTop: sp.sm },

  note: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CANVAS_2, marginTop: sp.xl },
});
