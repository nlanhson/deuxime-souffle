/**
 * Coach · Profil — the 4th bottom-nav tab. ONE combined surface: the coach's identity AND their
 * progression (the tier ladder + matching score). The user asked to fold the whole gamification
 * page into the profile, so there's no longer a separate "Progression" screen or a level-card modal —
 * it all lives here, one scroll.
 *
 * Layout — "Proud identity on an ink stage" (calm cream body below):
 *  • INK HERO (bleeds under the status bar): an identity row (photo — tap to change · name · role ·
 *    Active status · a Settings GEAR top-right → SettingsScreen), then the tier centrepiece — a big
 *    rouge→or medal in the current rung's glyph, the Anton TIER NAME, the meter toward the next rung
 *    and a streak chip.
 *  • CREAM BODY: a NEXT-TIER spotlight, the rung COLLECTION preview (→ the full Médailles page), the
 *    stat band, the coach score, and the how-to + recognition note.
 *  • A one-shot first-load CHOREOGRAPHY (medal spring, meters sweeping from 0, tiles staggering in)
 *    that vanishes ENTIRELY under Reduce Motion. The ink hero scrolls with the page; the status bar
 *    flips light→dark as the hero scrolls past. Recognition only — none of it affects pay (DT-06).
 *
 * Everything that isn't identity or progression — availability, goals, documents, account, language,
 * support, log out — sits behind the gear (SettingsScreen). Photo pick is mocked. UI text from ../i18n.
 */
import React from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, Animated, Pressable, useWindowDimensions,
  type NativeScrollEvent, type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';

import {
  Settings, Camera, CheckCircle2, X, Flame, Users, CalendarDays, Trophy, ChevronRight,
  type LucideIcon,
} from '../icons';
import { palette, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { ease, dur } from '../lib/motion';
import { useCopy } from '../i18n';
import { StatusCard, StatusChip } from '../components/StatusCard';
import { useFirstLoad } from '../lib/useFirstLoad';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useChoreography } from '../lib/useChoreography';
import { Reveal } from '../components/Reveal';
import { BadgesSkeleton } from './skeletons';
import { ScoreCard } from '../components/ScoreCard';
import { InkHeader } from '../components/InkHeader';
import { HeroMedal } from '../components/HeroMedal';
import { AnimatedMeterFill } from '../components/AnimatedMeterFill';
import { EarnedTile, LockedTile, type Anim } from '../components/BadgeTiles';
import { OptionSheet, type SheetOption } from '../components/OptionSheet';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { COACH_PHOTO, COACH_NAME } from '../lib/coachProfile';
import { MedaillesScreen } from './MedaillesScreen';
import { SettingsScreen } from './SettingsScreen';
import { useTabBarInset } from '../navigation/tabBarInsets';
import {
  TIERS, TIER_COUNT, STREAK, RESIDENTS,
  currentTier, nextTier, sessionsToNext, tierProgress, isTierReached,
} from '../lib/gamification';
import { useCompletedSessions } from '../lib/badgeCelebration';

const S = surfaces.coach;
const INK = S.ink;
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const HAIR = 'rgba(24,23,21,0.07)';
const GOLD = palette.or[300];          // bright gold — FILLS / gold-on-ink foreground
const GOLD_FG = palette.or[800];       // dark gold — gold FOREGROUNDS on paper (AA)
const GOLD_WASH = 'rgba(242,194,0,0.13)';
const GAP_FG = palette.rouge[600];     // the "engine" red — the actionable gap (AA on white)
const INK_TRACK = 'rgba(255,255,255,0.14)';
const INK_RAISED = 'rgba(255,255,255,0.06)';

const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

// No native image picker is wired in the prototype, so "Choose a photo" re-applies the coach's
// real portrait. Real code replaces this with expo-image-picker → upload → the returned URL.
const DEMO_PHOTO = COACH_PHOTO;

/* ---------- entrance wrapper (opacity + tiny rise; native driver, separate from meter fills) ---------- */

function Entrance({ delay, anim, style, children }: { delay: number; anim: Anim; style?: any; children: React.ReactNode }) {
  const v = React.useRef(new Animated.Value(anim.animate ? 0 : 1)).current;
  const started = React.useRef(false);
  React.useEffect(() => {
    if (!anim.animate || started.current || !anim.play) return;
    started.current = true;
    Animated.timing(v, { toValue: 1, duration: dur.base, delay, easing: ease.out, useNativeDriver: true }).start();
  }, [anim.animate, anim.play, delay, v]);
  React.useEffect(() => { if (!anim.animate) v.setValue(1); }, [anim.animate, v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/* ---------- stat tile ---------- */

function StatTile({ Icon, value, label, gold }: { Icon: LucideIcon; value: string | number; label: string; gold?: boolean }) {
  // Stat tile = info card → kind='neutral' (no liseré), flat (these never had a shadow).
  return (
    <StatusCard kind="neutral" elevated={false} radius={r.lg} style={st.statTile} accessibilityLabel={`${value} ${label}`}>
      <View style={[st.statChip, { backgroundColor: gold ? GOLD_WASH : palette.neutral[100] }]}>
        <Icon size={16} color={gold ? GOLD_FG : ON_CARD_2} />
      </View>
      <Text style={st.statNum}>{value}</Text>
      <Text style={st.statLabel} numberOfLines={2}>{label}</Text>
    </StatusCard>
  );
}

/* ---------- screen ---------- */

export function ProfileScreen() {
  const copy = useCopy();
  const g = copy.game;          // gamification copy
  const pc = copy.profile;      // identity + settings copy
  const tabBarInset = useTabBarInset();
  const { width, height } = useWindowDimensions();
  const loading = useFirstLoad('profile');
  const reduced = useReducedMotion();
  const anim = useChoreography(loading, reduced);
  const insets = useSafeAreaInsets();

  // Identity / settings local state.
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(COACH_PHOTO);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const avatarOptions: SheetOption[] = [
    { key: 'choose', label: pc.avatarSheet.choose, icon: Camera },
    ...(photoUrl ? [{ key: 'remove', label: pc.avatarSheet.remove, icon: X, destructive: true } as SheetOption] : []),
  ];

  // Status-bar polarity tracks the scrolling ink hero: LIGHT glyphs while the dark band sits behind
  // the status bar, flipping to DARK once it scrolls past (cream behind). Reverts to dark on blur.
  const heroH = React.useRef(0);
  const barLight = React.useRef(true);
  const focused = React.useRef(false);
  const onScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const light = e.nativeEvent.contentOffset.y < heroH.current - insets.top - 2;
    if (light !== barLight.current) {
      barLight.current = light;
      if (focused.current) setStatusBarStyle(light ? 'light' : 'dark');
    }
  }, [insets.top]);
  useFocusEffect(React.useCallback(() => {
    focused.current = true;
    setStatusBarStyle(barLight.current ? 'light' : 'dark');
    return () => { focused.current = false; setStatusBarStyle('dark'); };
  }, []));

  // Live ladder — everything derives from the lifetime session count.
  const completed = useCompletedSessions();
  const cur = currentTier(completed);
  const nxt = nextTier(completed);
  const earned = TIERS.filter((t) => isTierReached(t.key, completed));
  const locked = TIERS.filter((t) => !isTierReached(t.key, completed));
  const total = TIER_COUNT;

  const curName = cur ? g.tiers[cur.key].name : '—';
  const CurIcon = cur ? cur.icon : TIERS[0].icon;

  const remaining = sessionsToNext(completed);
  const heroReadout = nxt ? `${completed} / ${nxt.threshold}` : g.maxedReadout;
  const heroCaption = nxt
    ? `${remaining} ${remaining <= 1 ? g.toNextOne : g.toNextN} ${g.tiers[nxt.key].name}`
    : g.maxedCaption;

  // Small-device guard (iPhone SE): shrink the hero so it doesn't eat the viewport.
  const small = height < 700 || width < 360;
  const medalSize = small ? 88 : 104;
  const nameSize = small ? 38 : 46;

  const collectedTxt = g.collected.replace('{n}', String(earned.length)).replace('{total}', String(total));

  const [medaillesOpen, setMedaillesOpen] = React.useState(false);
  const preview = (earned.length ? earned.slice(-4) : locked.slice(0, 4));

  // Medal spring (scale only — opacity is owned by Reveal's content fade, never doubled).
  const medalScale = React.useRef(new Animated.Value(anim.animate ? 0.9 : 1)).current;
  React.useEffect(() => {
    if (!anim.animate || !anim.play) return;
    Animated.spring(medalScale, { toValue: 1, speed: 12, bounciness: 9, delay: 90, useNativeDriver: true }).start();
  }, [anim.animate, anim.play, medalScale]);
  React.useEffect(() => { if (!anim.animate) medalScale.setValue(1); }, [anim.animate, medalScale]);

  return (
    <SafeAreaView style={st.fill} edges={['left', 'right']}>
      <Reveal loading={loading} skeleton={<BadgesSkeleton />}>
        <ScrollView
          style={st.fill}
          contentContainerStyle={{ paddingBottom: sp['2xl'] + tabBarInset }}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {/* ===== INK HERO — identity + tier, scrolls with the page ===== */}
          <View onLayout={(e) => { heroH.current = e.nativeEvent.layout.height; }}>
          <InkHeader variant="tab">
            {/* Identity row — photo (tap to change) · name + role + status · Settings gear */}
            <View style={st.idRow}>
              <Pressable
                style={st.avatarWrap}
                onPress={() => setAvatarOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`${pc.editPhotoA11y}, ${COACH_NAME}`}
              >
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={st.avatar} accessibilityIgnoresInvertColors />
                ) : (
                  <ProfileAvatar size={60} />
                )}
                <View style={st.camBadge}>
                  <Camera size={13} color={ON_CARD} />
                </View>
              </Pressable>

              <View style={st.idText}>
                <Text style={st.idName} numberOfLines={1}>{COACH_NAME}</Text>
                <Text style={st.idRole} numberOfLines={1}>{pc.role}</Text>
                {/* Account standing = a status chip (Active → 'ok'), on the ink surface. */}
                <StatusChip tone="ok" surface="ink" label={pc.status.active} icon={CheckCircle2} style={st.idChip} />
              </View>

              <Pressable
                onPress={() => setSettingsOpen(true)}
                hitSlop={8}
                style={({ pressed }) => [st.gearBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel={pc.openSettingsA11y}
              >
                <Settings size={20} color={INK.textPrimary} />
              </Pressable>
            </View>

            {/* Tier centrepiece */}
            <View style={st.heroCenter}>
              <Animated.View style={[st.halo, { transform: [{ scale: medalScale }] }]}>
                <HeroMedal Icon={CurIcon} ringSize={medalSize} iconSize={Math.round(medalSize * 0.38)} />
              </Animated.View>

              <Text style={st.heroKicker}>{g.tierPrefix}</Text>
              <View accessible accessibilityLabel={`${g.tierPrefix} ${curName}, ${completed} ${g.totalSuffix}`}>
                <Text
                  style={[st.heroNumeral, { fontSize: nameSize, lineHeight: nameSize + 6 }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  importantForAccessibility="no"
                >
                  {curName}
                </Text>
              </View>
              <Text style={st.heroSubtitle}>{`${completed} ${g.totalSuffix}`}</Text>
            </View>

            <AnimatedMeterFill
              frac={tierProgress(completed)}
              play={anim.play}
              animate={anim.animate}
              height={12}
              trackColor={INK_TRACK}
              a11yValue={nxt ? { min: 0, max: nxt.threshold, now: completed } : { min: 0, max: total, now: total }}
              style={{ marginTop: sp.md }}
            />
            <View style={st.heroMeterRow}>
              <Text style={st.heroReadout}>{heroReadout}</Text>
              <View style={st.streakChip} accessible accessibilityLabel={`${STREAK} ${copy.header.streakLabel}`}>
                <Flame size={14} color={GOLD} />
                <Text style={st.streakTxt}>{`×${STREAK}`}</Text>
              </View>
            </View>
            <Text style={st.heroCaption}>{heroCaption}</Text>
          </InkHeader>
          </View>

          {/* ===== CREAM BODY ===== */}
          <View style={st.body}>
            {/* Next-tier spotlight — the rung you're about to unlock, turning pride into a concrete step. */}
            {nxt ? (() => {
              const target = nxt.threshold;
              const current = Math.min(completed, target);
              const left = target - completed;
              const gap = left <= 1 ? g.gapOne : g.gapN.replace('{n}', String(left));
              return (
                <Entrance delay={220} anim={anim}>
                  {/* v2 card: the next rung you're about to unlock. Rail dropped on Profile (per design
                      request) — keeps the white card + soft shadow + bespoke gold eyebrow + rouge[600] gap text. */}
                  <StatusCard
                    status="pending"
                    leftBorder={false}
                    padded={false}
                    contentStyle={st.spotlight}
                    accessibilityLabel={`${g.nextTierEyebrow}: ${g.tiers[nxt.key].name}, ${gap}, ${current} ${g.ofTarget} ${target}`}
                  >
                    <HeroMedal Icon={nxt.icon} ringSize={56} ring={5} iconSize={24} innerColor={palette.neutral[100]} iconColor={palette.neutral[500]} />
                    <View style={st.spotlightBody}>
                      <Text style={st.spotlightEyebrow}>{g.nextTierEyebrow}</Text>
                      <Text style={st.spotlightName} numberOfLines={1}>{g.tiers[nxt.key].name}</Text>
                      <Text style={st.spotlightGap}>{gap}</Text>
                      <View style={st.spotlightMeterRow}>
                        <AnimatedMeterFill frac={current / target} play={anim.play} animate={anim.animate} height={6} style={{ flex: 1 }} a11yValue={{ min: 0, max: target, now: current }} />
                        <Text style={st.spotlightCount}>{`${current} / ${target}`}</Text>
                      </View>
                    </View>
                  </StatusCard>
                </Entrance>
              );
            })() : null}

            {/* Collection PREVIEW — a few rungs + "Voir tout" into the full ladder page. */}
            <Pressable
              style={({ pressed }) => [st.secLinkRow, pressed && { opacity: 0.6 }]}
              onPress={() => setMedaillesOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`${g.collectionTitle}, ${collectedTxt}, ${g.seeAll}`}
            >
              <Text style={st.secTitle}>{g.collectionTitle}</Text>
              <View style={st.secChip}>
                <Text style={st.secChipTxt}>{`${earned.length}/${total}`}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text style={st.seeAll}>{g.seeAll}</Text>
              <ChevronRight size={18} color={ON_CARD_2} />
            </Pressable>
            <View style={st.grid}>
              {preview.map((t, i) => (
                <Entrance key={t.key} delay={320 + i * 70} anim={anim} style={st.slot}>
                  {isTierReached(t.key, completed) ? (
                    <EarnedTile tier={t} name={g.tiers[t.key].name} desc={g.tiers[t.key].desc} reachedLabel={g.reachedLabel} showRail={false} />
                  ) : (
                    <LockedTile tier={t} name={g.tiers[t.key].name} desc={g.tiers[t.key].desc} sessions={completed} anim={anim} ofTarget={g.ofTarget} lockedA11y={g.lockedA11y} isNext={nxt?.key === t.key} showRail={false} />
                  )}
                </Entrance>
              ))}
            </View>

            {/* Stat band — supporting context (calm, no count-ups). */}
            <View style={st.statBand}>
              <StatTile Icon={Flame} value={`×${STREAK}`} label={copy.header.streakLabel} gold />
              <StatTile Icon={Users} value={RESIDENTS} label={copy.header.residentsLabel} />
              <StatTile Icon={CalendarDays} value={completed} label={g.totalSuffix} />
            </View>

            {/* Coach score (DT-07) — bleu signal bars, kept visually distinct from the gold-rouge reward. */}
            <View style={{ marginTop: sp.md }}>
              <ScoreCard />
            </View>

            {/* How you progress + recognition-only note (verbatim — never affects pay, DT-06).
                Info card → kind='neutral' (no liseré), flat. */}
            <Text style={st.howSecTitle}>{g.howTitle}</Text>
            <StatusCard kind="neutral" elevated={false} padded={false} contentStyle={st.howCard}>
              <HowRow Icon={CalendarDays} title={g.how.sessions.title} desc={g.how.sessions.desc} first />
              <HowRow Icon={Trophy} title={g.how.climb.title} desc={g.how.climb.desc} />
            </StatusCard>

            <Text style={st.note}>{g.note}</Text>
          </View>
        </ScrollView>
      </Reveal>

      {/* Full ladder (Médailles) */}
      <MedaillesScreen
        visible={medaillesOpen}
        onClose={() => setMedaillesOpen(false)}
        earned={earned}
        locked={locked}
        sessions={completed}
      />

      {/* Settings (the gear) — the full account & app hub */}
      <SettingsScreen visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Profile-photo actions (mocked picker) */}
      <OptionSheet
        visible={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        title={pc.avatarSheet.title}
        help={pc.avatarSheet.help}
        options={avatarOptions}
        closeA11y={pc.avatarSheet.closeA11y}
        onSelect={(k) => setPhotoUrl(k === 'choose' ? DEMO_PHOTO : null)}
      />
    </SafeAreaView>
  );
}

function HowRow({ Icon, title, desc, first }: { Icon: LucideIcon; title: string; desc: string; first?: boolean }) {
  return (
    <View style={[st.howRow, !first && st.howDivider]}>
      <View style={st.howIcon}>
        <Icon size={18} color={ON_CARD_2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.howTitleTxt}>{title}</Text>
        <Text style={st.howDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: S.canvas },
  body: { paddingHorizontal: sp.lg, paddingTop: sp.lg },

  /* ----- ink hero · identity row ----- */
  idRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  avatarWrap: { width: 60, height: 60 },
  avatar: { width: 60, height: 60, borderRadius: 999, backgroundColor: INK_RAISED },
  camBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[200], borderWidth: 2, borderColor: INK.bg,
  },
  idText: { flex: 1, minWidth: 0 },
  idName: { fontFamily: F.oswB, fontSize: 22, color: INK.textPrimary },
  idRole: { fontFamily: F.body, fontSize: 14, color: INK.textSecondary, marginTop: 1 },
  // Just the spacing under the role line — the pill (fill/padding/radius/icon) is the shared StatusChip.
  idChip: { marginTop: 6 },
  gearBtn: {
    alignSelf: 'flex-start',
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: INK_RAISED, borderWidth: 1, borderColor: INK.border,
  },

  /* ----- ink hero · tier centrepiece ----- */
  heroCenter: { alignItems: 'center', marginTop: sp.lg },
  halo: { padding: 12, borderRadius: 999, backgroundColor: INK_RAISED },
  heroKicker: { fontFamily: F.oswB, fontSize: 13, letterSpacing: 1.5, color: INK.level, textTransform: 'uppercase', marginTop: sp.md },
  heroNumeral: { fontFamily: F.display, color: INK.textPrimary, textTransform: 'uppercase', textAlign: 'center' },
  heroSubtitle: { fontFamily: F.body, fontSize: 14, color: INK.textSecondary, marginTop: 2 },

  heroMeterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: sp.sm },
  heroReadout: { fontFamily: F.oswS, fontSize: 16, color: INK.textSecondary },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: INK_RAISED, borderWidth: 1, borderColor: INK.border, paddingVertical: 4, paddingHorizontal: 10, borderRadius: r.pill },
  streakTxt: { fontFamily: F.oswB, fontSize: 14, color: INK.textSecondary },
  heroCaption: { fontFamily: F.bodyS, fontSize: 13, color: INK.textSecondary, marginTop: sp.sm },

  /* ----- next-tier spotlight (inner content of its StatusCard — surface/radius/shadow live there) ----- */
  spotlight: { flexDirection: 'row', alignItems: 'center', gap: sp.md, padding: sp.lg },
  spotlightBody: { flex: 1 },
  spotlightEyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1.2, color: GOLD_FG, textTransform: 'uppercase' },
  spotlightName: { fontFamily: F.oswB, fontSize: 18, color: ON_CARD, marginTop: 2 },
  spotlightGap: { fontFamily: F.bodyB, fontSize: 14, color: GAP_FG, marginTop: 2 },
  spotlightMeterRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.sm },
  spotlightCount: { fontFamily: F.oswS, fontSize: 13, color: ON_CARD_2, minWidth: 52, textAlign: 'right' },

  /* ----- collection preview header ----- */
  secLinkRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.xl, marginBottom: sp.sm },
  secTitle: { fontFamily: F.oswS, fontSize: 18, letterSpacing: 0.3, color: ON_CANVAS },
  secChip: { backgroundColor: GOLD_WASH, paddingVertical: 2, paddingHorizontal: 8, borderRadius: r.pill },
  secChipTxt: { fontFamily: F.oswS, fontSize: 13, color: GOLD_FG },
  seeAll: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },

  /* ----- collection grid (preview) ----- */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  slot: { width: '48%' },

  /* ----- stat band (each tile = a neutral StatusCard; surface/radius live there) ----- */
  statBand: { flexDirection: 'row', gap: sp.sm, marginTop: sp.xl },
  statTile: { flex: 1 },
  statChip: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: sp.sm },
  statNum: { fontFamily: F.oswB, fontSize: 22, color: ON_CARD },
  // Reserve 2 lines (2 × lineHeight) so a label that wraps ("séances réalisées") doesn't make its
  // tile taller than the 1-line tiles ("Série" / "Résidents") — all three stat tiles stay equal height.
  statLabel: { fontFamily: F.body, fontSize: 12, lineHeight: 15, minHeight: 30, color: ON_CARD_2, marginTop: 2 },

  /* ----- how-you-progress ----- */
  howSecTitle: { fontFamily: F.oswS, fontSize: 18, letterSpacing: 0.3, color: ON_CANVAS, marginTop: sp.xl, marginBottom: sp.sm },
  howCard: { paddingHorizontal: sp.md },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  howDivider: { borderTopWidth: 1, borderTopColor: HAIR },
  howIcon: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[100] },
  howTitleTxt: { fontFamily: F.bodyB, fontSize: 15, color: ON_CARD },
  howDesc: { fontFamily: F.body, fontSize: 13, lineHeight: 17, color: ON_CARD_2, marginTop: 2 },

  note: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CANVAS_2, marginTop: sp.xl },
});
