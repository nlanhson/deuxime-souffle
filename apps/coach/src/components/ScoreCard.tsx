/**
 * ScoreCard — the coach's matching score (DT-07): Équité / Réputation / Proximité, /100.
 *
 * Algorithm transparency — WHY the matching engine offers this coach certain sessions. Per the
 * feedback sheet this is explicitly NOT a ranking vs other coaches (DT-06 keeps gamification
 * non-comparative — badges + level, no leaderboard): it shows the coach's OWN three signals only.
 *
 * WBS NOTE: DT-07's "PLA-09" citation is wrong (PLA-09 = geolocated check-in). The WBS keeps these
 * sub-scores ADMIN-only (Assignment Algorithm §8.1 / SM-ASG-01) and gives the coach a single
 * "confidence index" instead — the 2026-06-18 reconciliation flagged DT-07 as ⛔ push-back. Surfacing
 * the three signals to the coach is an INTENTIONAL client override (per the v5 mockup, decided
 * 2026-06-18) — do NOT "restore" it to a single confidence index without re-confirming that call.
 *
 * Self-contained white card (hairline border + the shared raised gradient, house style) so it reads
 * the same on the Home cream canvas and inside the Profile page-sheet — both sit on S.canvas. Mock
 * figures are placeholders (real code derives them from the matching algorithm). Surface = coach.
 *
 * `compact` renders a deliberately QUIET, minimal variant (DT-07 on Home): no card chrome, no gauges,
 * no accent colour — just a muted single line of the three signals + caption, sitting right under the
 * Coach-level card. It's informational only (non-interactive); the full card lives on Badges & level,
 * reached by tapping the level card above it. Kept low-key on purpose so it doesn't pull focus.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, spacing as sp, radius as r, cardGradient as RAISED_GRAD } from '../theme/theme';
import { useCopy } from '../i18n';

const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const TRACK = palette.neutral[200];
const FILL = palette.bleu[500]; // the mockup's dark-blue signal bars
const HAIR = 'rgba(24,23,21,0.07)';

const F = {
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyB: 'Inter_700Bold',
};

export type Scores = { equity: number; reputation: number; proximity: number; total: number };

// The coach's matching score — the sheet's example values (Équité 82 / Réputation 91 / Proximité 74,
// 84/100 overall). Shared default for Home + Profile.
export const COACH_SCORES: Scores = { equity: 82, reputation: 91, proximity: 74, total: 84 };

function Gauge({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={st.gauge}>
      <View style={st.gaugeHead}>
        <Text style={st.gaugeLabel}>{label}</Text>
        <Text style={st.gaugeVal}>{value}</Text>
      </View>
      <View style={st.track}>
        <View style={[st.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

export function ScoreCard({ scores = COACH_SCORES, compact = false }: { scores?: Scores; compact?: boolean }) {
  const c = useCopy().score;

  // Minimal Home variant (DT-07) — a quiet muted line, no card/gauges/colour. Just informs.
  if (compact) {
    return (
      <View
        style={stc.wrap}
        accessible
        accessibilityLabel={`${c.a11y} ${scores.total} ${c.outOf}. ${c.equity} ${scores.equity}, ${c.reputation} ${scores.reputation}, ${c.proximity} ${scores.proximity}.`}
      >
        <Text style={stc.line}>
          {c.equity} <Text style={stc.val}>{scores.equity}</Text>
          {'   ·   '}{c.reputation} <Text style={stc.val}>{scores.reputation}</Text>
          {'   ·   '}{c.proximity} <Text style={stc.val}>{scores.proximity}</Text>
        </Text>
        <Text style={stc.caption}>{c.caption}</Text>
      </View>
    );
  }

  return (
    <View style={st.card}>
      <LinearGradient colors={RAISED_GRAD} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r.xl }]} pointerEvents="none" />
      <View style={st.head}>
        <Text style={st.title}>{c.title}</Text>
        <Text>
          <Text style={st.totalNum}>{scores.total}</Text>
          <Text style={st.totalOut}>{` ${c.outOf}`}</Text>
        </Text>
      </View>
      <View
        accessible
        accessibilityLabel={`${c.a11y} ${scores.total} ${c.outOf}. ${c.equity} ${scores.equity}, ${c.reputation} ${scores.reputation}, ${c.proximity} ${scores.proximity}.`}
      >
        <Gauge label={c.equity} value={scores.equity} />
        <Gauge label={c.reputation} value={scores.reputation} />
        <Gauge label={c.proximity} value={scores.proximity} />
      </View>
      <Text style={st.caption}>{c.caption}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    borderRadius: r.xl, padding: sp.lg, backgroundColor: palette.neutral[0],
    borderWidth: 1, borderColor: HAIR, overflow: 'hidden',
  },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: F.oswS, fontSize: 16, letterSpacing: 0.4, color: ON_CARD },
  totalNum: { fontFamily: F.bodyB, fontSize: 18, color: FILL },
  totalOut: { fontFamily: F.body, fontSize: 13, color: ON_CARD_2 },
  gauge: { marginTop: sp.md },
  gaugeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  gaugeLabel: { fontFamily: F.body, fontSize: 14, color: ON_CARD_2 },
  gaugeVal: { fontFamily: F.bodyB, fontSize: 14, color: ON_CARD },
  track: { height: 8, borderRadius: 999, backgroundColor: TRACK, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: FILL },
  caption: { fontFamily: F.body, fontSize: 13, lineHeight: 17, color: ON_CARD_2, marginTop: sp.md },
});

// Compact Home variant — intentionally low-contrast and chrome-free so it reads as a quiet caption
// under the level card, not a second card competing for attention.
const stc = StyleSheet.create({
  wrap: { marginTop: sp.md, paddingHorizontal: 2 },
  // neutral[600] (not [500]) — [500] on cream is only 3.42:1 (sub-AA); [600] clears 4.5:1 (DT-20).
  line: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: palette.neutral[600] },
  val: { fontFamily: F.bodyB, fontSize: 13, color: palette.neutral[700] },
  caption: { fontFamily: F.body, fontSize: 13, lineHeight: 16, color: palette.neutral[600], marginTop: 3 },
});
