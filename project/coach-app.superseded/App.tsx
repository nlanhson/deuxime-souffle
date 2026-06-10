/**
 * Coach · Home ("Hi, Karim") — React Native port of the v0.1 vertical slice.
 * Consumes the canonical Le Club tokens from ./theme.ts (a copy of
 * project/design-system/theme.ts — destined for packages/shared once the Turborepo exists).
 *
 * Surface = coach (ink canvas, red the engine). MVP scope only (no gamification).
 * Bottom nav per STATE.md decision: 4 tabs — Home · Sessions · Available · Earnings;
 * profile + notifications top-right in the header.
 *
 * Language: UI text is in ENGLISH for review (see ./copy.ts). The product ships in French —
 * copy.ts is the single localization seam; swap its values to go back to French.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import { Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import { palette, color, spacing as sp, radius as r, surfaces } from './theme';
import { copy } from './copy';

const S = surfaces.coach;                     // canvas / surface / surfaceRaised / text / accent
const BORDER_INK = palette.neutral[700];      // dividers on ink
const ON_LIGHT = palette.neutral[900];        // text on the raised white card
const ON_LIGHT_2 = palette.neutral[600];
const MOVEMENT = [palette.rouge[500], palette.or[500]] as const; // signature gradient, 135°

/* On-ink status colors — the gap the slice surfaced (semantic status tokens are tuned for
   light surfaces). Reaching into the global ramp here; SPEC §4 proposes promoting these
   to coach-theme tokens (--color-success-on-ink, etc.). */
const INK = {
  ok: palette.vert[300],
  okBg: 'rgba(47,158,107,0.16)',
  pending: palette.or[300],
  pendingBg: 'rgba(242,194,0,0.13)',
  pendingBorder: 'rgba(242,194,0,0.35)',
};

const F = {
  display: 'Anton_400Regular',
  oswM: 'Oswald_500Medium',
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

// Mock data — placeholder content (real code formats weekday/distance from data + locale).
const WEEK = [
  { d: 'Mon', n: 8, load: 1 },
  { d: 'Tue', n: 9, load: 2, today: true },
  { d: 'Wed', n: 10, load: 0 },
  { d: 'Thu', n: 11, load: 1 },
  { d: 'Fri', n: 12, load: 1 },
  { d: 'Sat', n: 13, load: 0, empty: true },
  { d: 'Sun', n: 14, load: 0, empty: true },
];

const AVAILABLE = [
  { dow: 'Thu', hr: '10:00', nm: 'Park Care Home', ds: 'Villeurbanne · 3.1 km · 1h' },
  { dow: 'Fri', hr: '16:00', nm: 'The Cedars Residence', ds: 'Lyon 7th · 4.8 km · 1h' },
];

/* ---------- small building blocks ---------- */

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <Text style={[st.eyebrow, light && { color: ON_LIGHT_2 }]}>{children}</Text>;
}

function SectionHeader({ title, link, onLink }: { title: string; link?: string; onLink?: () => void }) {
  return (
    <View style={st.secHead}>
      <Eyebrow>{title}</Eyebrow>
      {link ? (
        <Pressable style={st.linkBtn} hitSlop={10} onPress={onLink}>
          <Text style={st.linkTxt}>{link}</Text>
          <Feather name="chevron-right" size={16} color={S.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

function GhostBtn({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={({ pressed }) => [st.ghostBtn, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <Text style={st.ghostTxt}>{label}</Text>
    </Pressable>
  );
}

/* ---------- screen ---------- */

function CoachHome() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: S.canvas }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.lg, paddingBottom: sp.xl }}
      >
        {/* ===== App header — greeting left, notifications + profile right ===== */}
        <View style={st.appbar}>
          <View style={{ flex: 1 }}>
            <Eyebrow>{copy.header.date}</Eyebrow>
            <Text style={st.greet} numberOfLines={1}>{copy.header.greeting}</Text>
          </View>
          <Pressable style={st.iconBtn} hitSlop={6} accessibilityLabel={copy.header.notificationsA11y}>
            <Feather name="bell" size={22} color={S.textPrimary} />
            <View style={st.badgeDot} />
          </Pressable>
          <Pressable style={st.avatarWrap} hitSlop={6} accessibilityLabel={copy.header.profileA11y}>
            <LinearGradient colors={MOVEMENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.avatar}>
              <Text style={st.avatarTxt}>KB</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* ===== Report-due banner (conditional · C25/C26) ===== */}
        <View style={st.banner} accessibilityRole="alert">
          <Feather name="alert-triangle" size={20} color={INK.pending} />
          <View style={{ flex: 1 }}>
            <Text style={st.bannerTitle}>{copy.reportBanner.title}</Text>
            <Text style={st.bannerSub}>{copy.reportBanner.subtitle}</Text>
          </View>
          <GhostBtn label={copy.reportBanner.action} />
        </View>

        {/* ===== Hero: next session (C16 / C21 / C22) ===== */}
        <View style={st.section}>
          <View style={st.secHead}>
            <Eyebrow>{copy.nextSession.eyebrow}</Eyebrow>
            <View style={[st.chip, { backgroundColor: INK.okBg }]}>
              <View style={[st.dot, { backgroundColor: INK.ok }]} />
              <Text style={[st.chipTxt, { color: INK.ok }]}>{copy.nextSession.status}</Text>
            </View>
          </View>

          <View style={st.heroCard}>
            <Text style={st.heroTitle}>{copy.nextSession.place}</Text>
            <View style={st.metaRow}>
              <Feather name="map-pin" size={15} color={ON_LIGHT_2} />
              <Text style={st.metaLight}>{copy.nextSession.address}</Text>
            </View>

            <View style={st.timeRow}>
              <Text style={st.timeBig}>14:30</Text>
              <Text style={st.timeTo}>→ 15:30</Text>
            </View>
            <View style={st.metaRow}>
              <Feather name="clock" size={15} color={ON_LIGHT_2} />
              <Text style={st.metaLight}>{copy.nextSession.detail}</Text>
            </View>

            <View style={[st.chip, st.chipLight, { alignSelf: 'flex-start', marginTop: sp.md }]}>
              <Feather name="map-pin" size={14} color={color.progressStrong} />
              <Text style={[st.chipTxt, { color: color.progressStrong }]}>{copy.nextSession.checkin}</Text>
            </View>

            <View style={st.ctaRow}>
              <Pressable style={st.primaryWrap} accessibilityRole="button">
                <LinearGradient colors={MOVEMENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.primaryBtn}>
                  <Text style={st.primaryTxt}>{copy.nextSession.start}</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={st.secondaryBtn} accessibilityRole="button">
                <Text style={st.secondaryTxt}>{copy.nextSession.directions}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ===== This week (C09 / C10) — taps through to Sessions ===== */}
        <View style={st.section}>
          <SectionHeader title={copy.week.eyebrow} link={copy.week.link} />
          <View style={st.card}>
            <View style={st.weekStrip}>
              {WEEK.map((day) => (
                <View key={day.d} style={[st.day, day.today && st.dayToday]}>
                  <Text style={st.dayD}>{day.d}</Text>
                  <Text style={[st.dayN, day.today && { color: INK.pending }, day.empty && { color: S.textSecondary }]}>{day.n}</Text>
                  <View style={st.load}>
                    {Array.from({ length: day.load }).map((_, i) => (
                      <View key={i} style={st.loadDot} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <View style={st.weekSum}>
              <Text style={st.statSm}>{copy.week.count}</Text>
              <Text style={st.muted}>{copy.week.summary}</Text>
            </View>
          </View>
        </View>

        {/* ===== Available sessions (C11 / C12) ===== */}
        <View style={st.section}>
          <SectionHeader title={copy.available.eyebrow} link={copy.available.link} />
          <View style={st.card}>
            <Text style={[st.muted, { marginBottom: sp.sm }]}>{copy.available.near}</Text>
            {AVAILABLE.map((a, i) => (
              <View key={a.nm} style={[st.availRow, i > 0 && st.availDivider]}>
                <View style={st.availWhen}>
                  <Text style={st.availDow}>{a.dow}</Text>
                  <Text style={st.availHr}>{a.hr}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.availNm}>{a.nm}</Text>
                  <Text style={st.availDs}>{a.ds}</Text>
                </View>
                <GhostBtn label={copy.available.apply} />
              </View>
            ))}
          </View>
        </View>

        {/* ===== This month (C35) ===== */}
        <View style={st.section}>
          <SectionHeader title={copy.earnings.eyebrow} link={copy.earnings.link} />
          <View style={st.statsRow}>
            <View style={st.statCard}>
              <View style={[st.chip, { backgroundColor: INK.ok, alignSelf: 'flex-start' }]}>
                <View style={[st.dot, { backgroundColor: palette.neutral[900] }]} />
                <Text style={[st.chipTxt, { color: palette.neutral[900] }]}>{copy.earnings.confirmed}</Text>
              </View>
              <View style={st.statNumRow}>
                <Text style={st.statBig}>840</Text>
                <Text style={st.statCur}>€</Text>
              </View>
              <Text style={st.statSub}>{copy.earnings.confirmedSub}</Text>
            </View>

            <View style={st.statCard}>
              <Eyebrow>{copy.earnings.projected}</Eyebrow>
              <View style={st.statNumRow}>
                <Text style={[st.statBig, { color: INK.pending }]}>1,260</Text>
                <Text style={[st.statCur, { color: INK.pending }]}>€</Text>
              </View>
              <Text style={st.statSub}>{copy.earnings.projectedSub}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ===== Bottom tab bar — 4 tabs (current spec) ===== */}
      <View style={[st.tabbar, { paddingBottom: Math.max(insets.bottom, sp.sm) }]}>
        <Tab icon={<Feather name="home" size={22} color={color.action} />} label={copy.tabs.home} active />
        <Tab icon={<Feather name="calendar" size={22} color={S.textSecondary} />} label={copy.tabs.sessions} />
        <Tab icon={<Feather name="search" size={22} color={S.textSecondary} />} label={copy.tabs.available} />
        <Tab icon={<MaterialCommunityIcons name="currency-eur" size={23} color={S.textSecondary} />} label={copy.tabs.earnings} />
      </View>
    </View>
  );
}

function Tab({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Pressable style={st.tab} accessibilityRole="button" accessibilityState={{ selected: !!active }}>
      {icon}
      <Text style={[st.tabTxt, active && { color: color.action }]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Anton_400Regular,
    Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold,
    Inter_400Regular, Inter_600SemiBold, Inter_700Bold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, backgroundColor: S.canvas }} edges={['top', 'left', 'right']}>
        {loaded ? <CoachHome /> : <View style={{ flex: 1, backgroundColor: S.canvas }} />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* ---------- styles ---------- */

const st = StyleSheet.create({
  eyebrow: {
    fontFamily: F.oswS, fontSize: 13, textTransform: 'uppercase',
    letterSpacing: 1, color: S.textSecondary,
  },

  /* header */
  appbar: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingTop: sp.sm, paddingBottom: sp.sm },
  greet: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: S.textPrimary, marginTop: 2 },
  iconBtn: {
    width: 44, height: 44, borderRadius: r.md, backgroundColor: S.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 999,
    backgroundColor: color.action, borderWidth: 2, borderColor: S.surface,
  },
  avatarWrap: {
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: F.oswB, fontSize: 17, color: color.onAction },

  /* banner */
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: sp.md, marginTop: sp.md,
    backgroundColor: INK.pendingBg, borderColor: INK.pendingBorder, borderWidth: 1,
    borderRadius: r.lg, padding: sp.md,
  },
  bannerTitle: { fontFamily: F.oswS, fontSize: 16, color: S.textPrimary },
  bannerSub: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 1 },

  /* sections */
  section: { marginTop: sp.lg },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 6 },
  linkTxt: { fontFamily: F.oswS, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: S.textSecondary },

  /* chips */
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
  },
  chipLight: { backgroundColor: color.progressSoft },
  chipTxt: { fontFamily: F.oswS, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.6 },
  dot: { width: 8, height: 8, borderRadius: 999 },

  /* hero card (raised white) */
  heroCard: {
    backgroundColor: S.surfaceRaised, borderRadius: r.xl, padding: sp.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 20,
  },
  heroTitle: { fontFamily: F.oswS, fontSize: 20, color: ON_LIGHT },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaLight: { fontFamily: F.body, fontSize: 14, color: ON_LIGHT_2 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: sp.sm, marginTop: sp.md, marginBottom: 2 },
  // Anton needs lineHeight >= ~1.2x fontSize or iOS clips the glyph top/bottom.
  timeBig: { fontFamily: F.display, fontSize: 50, lineHeight: 62, color: ON_LIGHT },
  timeTo: { fontFamily: F.oswS, fontSize: 20, color: palette.neutral[500] },

  ctaRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.lg },
  primaryWrap: {
    flex: 2, borderRadius: r.pill,
    shadowColor: palette.rouge[500], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 12,
  },
  primaryBtn: { minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { fontFamily: F.oswS, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: color.onAction },
  secondaryBtn: {
    flex: 1, minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: palette.neutral[300],
  },
  secondaryTxt: { fontFamily: F.oswS, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, color: palette.neutral[700] },

  /* generic card on ink */
  card: { backgroundColor: S.surface, borderRadius: r.xl, padding: sp.lg },

  /* week strip */
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  day: { flex: 1, alignItems: 'center', borderRadius: r.md, paddingVertical: sp.sm, borderWidth: 1, borderColor: 'transparent' },
  dayToday: { backgroundColor: palette.neutral[900], borderColor: BORDER_INK },
  dayD: { fontFamily: F.oswS, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: S.textSecondary },
  dayN: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary, marginTop: 2 },
  load: { flexDirection: 'row', gap: 3, marginTop: 6, minHeight: 5 },
  loadDot: { width: 5, height: 5, borderRadius: 999, backgroundColor: color.action },
  weekSum: { flexDirection: 'row', alignItems: 'baseline', gap: sp.sm, marginTop: sp.md },
  statSm: { fontFamily: F.display, fontSize: 32, lineHeight: 40, color: S.textPrimary },
  muted: { fontFamily: F.body, fontSize: 14, color: S.textSecondary },

  /* available rows */
  availRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  availDivider: { borderTopWidth: 1, borderTopColor: BORDER_INK },
  availWhen: { width: 52, alignItems: 'center' },
  availDow: { fontFamily: F.oswS, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: S.textSecondary },
  availHr: { fontFamily: F.oswB, fontSize: 18, color: S.textPrimary },
  availNm: { fontFamily: F.oswS, fontSize: 18, color: S.textPrimary },
  availDs: { fontFamily: F.body, fontSize: 14, color: S.textSecondary, marginTop: 1 },

  /* ghost button (≥44 touch target — non-negotiable). neutral-700 = one step lighter than
     the neutral-800 cards it sits in, so it stays visible on both cards and the banner. */
  ghostBtn: {
    minHeight: 44, paddingHorizontal: sp.md, borderRadius: r.pill,
    backgroundColor: palette.neutral[700],
    alignItems: 'center', justifyContent: 'center',
  },
  ghostTxt: { fontFamily: F.oswS, fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.6, color: S.textPrimary },

  /* revenue */
  statsRow: { flexDirection: 'row', gap: sp.md },
  statCard: { flex: 1, backgroundColor: S.surface, borderRadius: r.lg, padding: sp.md },
  statNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: sp.sm },
  statBig: { fontFamily: F.display, fontSize: 34, lineHeight: 42, color: S.textPrimary },
  statCur: { fontFamily: F.display, fontSize: 22, color: S.textSecondary },
  statSub: { fontFamily: F.body, fontSize: 13, color: S.textSecondary, marginTop: 4 },

  /* tab bar */
  tabbar: {
    flexDirection: 'row', backgroundColor: palette.neutral[900],
    borderTopWidth: 1, borderTopColor: palette.neutral[800], paddingTop: sp.sm, paddingHorizontal: sp.sm,
  },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabTxt: { fontFamily: F.oswS, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: S.textSecondary },
});
