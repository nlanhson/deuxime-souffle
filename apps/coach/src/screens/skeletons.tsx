/**
 * Layout-matching skeletons for every coach surface.
 *
 * Each skeleton mirrors the structure of the real screen it stands in for — same paddings, same
 * card radii, same row counts, same calendar geometry — so when content loads in (via <Reveal>)
 * nothing shifts and the swap reads as one element settling, not a re-flow. They render the BODY
 * only: tab screens wrap them inside their SafeAreaView, pageSheets keep their (dismissible)
 * top bar real and skeleton just the scroll region.
 *
 * All motion lives in the <Skeleton> primitive (shared sweep; static under reduced motion).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Skeleton, SkeletonCircle } from '../components/Skeleton';
import { surfaces, spacing as sp, radius as r, palette } from '../theme/theme';

const S = surfaces.coach;
const BORDER_INK = palette.neutral[700];
const CARD_BG = S.surface;                      // #2B2B2B raised card
const CARD_BORDER = 'rgba(255,255,255,0.07)';   // dim top-lit hairline

/* ---------- shared building blocks ---------- */

// App header — eyebrow + title left, bell + avatar right (Accueil / Séances / Disponibles).
// `level` adds the gold coach-badge chip that only Accueil's header carries (PLA-01).
function HeaderSkeleton({ level }: { level?: boolean }) {
  return (
    <View style={sk.appbar}>
      <View style={{ flex: 1 }}>
        <Skeleton w={84} h={12} r={4} />
        <Skeleton w={170} h={26} r={7} style={{ marginTop: 9 }} />
      </View>
      {level ? <Skeleton w={58} h={32} r={r.pill} /> : null}
      <SkeletonCircle d={24} />
      <SkeletonCircle d={42} />
    </View>
  );
}

// A raised card placeholder matching the app's dark cards (neutral-800 + hairline + radius).
function SkCard({ children, style }: { children?: React.ReactNode; style?: object }) {
  return <View style={[sk.card, style]}>{children}</View>;
}

// Flat list row: a short time rail + two text lines (available sessions, day-list).
function RowSkeleton({ divider }: { divider?: boolean }) {
  return (
    <View style={[sk.row, divider && sk.rowDivider]}>
      <View style={{ width: 52, gap: 7 }}>
        <Skeleton w={40} h={16} r={5} />
        <Skeleton w={30} h={11} r={4} />
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton w={'68%'} h={15} r={5} />
        <Skeleton w={'48%'} h={13} r={4} />
      </View>
    </View>
  );
}

// One metric tile (Scheduled / Done — Accueil & Disponibles calendars).
function TileSkeleton() {
  return (
    <View style={sk.tile}>
      <Skeleton w={36} h={36} r={11} style={{ position: 'absolute', top: sp.md, right: sp.md }} />
      <Skeleton w={62} h={13} r={4} />
      <Skeleton w={52} h={28} r={7} style={{ marginTop: 10 }} />
      <Skeleton w={70} h={12} r={4} style={{ marginTop: 9 }} />
    </View>
  );
}

// The calendar block shared by Accueil & Disponibles: two tiles, a toggle, a nav band, a week strip.
function CalendarSkeleton() {
  return (
    <>
      <View style={sk.tileRow}>
        <TileSkeleton />
        <TileSkeleton />
      </View>
      <Skeleton w={'100%'} h={38} r={r.sm} style={{ marginTop: sp.md, marginBottom: sp.md }} />
      <View style={sk.calNav}>
        <SkeletonCircle d={40} />
        <Skeleton w={130} h={14} r={5} />
        <SkeletonCircle d={40} />
      </View>
      <View style={sk.weekStrip}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={sk.day}>
            <Skeleton w={22} h={12} r={4} />
            <SkeletonCircle d={34} style={{ marginTop: 8 }} />
            {/* week strip shows a small count circle (month view uses dots) */}
            <Skeleton w={16} h={16} r={8} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>
    </>
  );
}

// A section eyebrow + a card holding `rows` tappable rows (Profile cards).
function CardRowsSkeleton({ rows }: { rows: number }) {
  return (
    <>
      <View style={sk.sectionHead}><Skeleton w={140} h={13} r={4} /></View>
      <View style={[sk.card, { paddingHorizontal: sp.lg, paddingVertical: 0 }]}>
        {Array.from({ length: rows }).map((_, i) => (
          <View key={i} style={[sk.profileRow, i > 0 && sk.rowDivider]}>
            <SkeletonCircle d={34} />
            <View style={{ flex: 1, gap: 7 }}>
              <Skeleton w={'42%'} h={14} r={5} />
              <Skeleton w={'66%'} h={12} r={4} />
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

/* ---------- screen skeletons ---------- */

export function AccueilSkeleton() {
  return (
    <View style={sk.screen}>
      <HeaderSkeleton level />

      {/* This month — earnings: title + chevron, then one condensed value line (no box) */}
      <View style={sk.section}>
        <View style={sk.secHead}>
          <Skeleton w={140} h={14} r={5} />
          <SkeletonCircle d={16} />
        </View>
        <View style={sk.earnRow}>
          <Skeleton w={72} h={18} r={6} />
          <Skeleton w={48} h={13} r={4} />
          <Skeleton w={84} h={18} r={6} />
          <Skeleton w={64} h={13} r={4} />
        </View>
      </View>

      {/* Next session — hero card */}
      <View style={sk.section}>
        <View style={sk.secHead}>
          <Skeleton w={104} h={14} r={5} />
          <Skeleton w={86} h={22} r={r.pill} />
        </View>
        <SkCard>
          <Skeleton w={'60%'} h={20} r={6} />
          <Skeleton w={'82%'} h={14} r={5} style={{ marginTop: 12 }} />
          {/* unit row (PLA-01) */}
          <Skeleton w={'66%'} h={14} r={5} style={{ marginTop: 8 }} />
          <Skeleton w={150} h={44} r={8} style={{ marginTop: sp.md }} />
          <View style={sk.ctaRow}>
            <Skeleton w={'40%'} h={52} r={r.pill} />
            <Skeleton style={{ flex: 1 }} h={52} r={r.pill} />
          </View>
        </SkCard>
      </View>

      {/* Available sessions — two flat rows */}
      <View style={sk.section}>
        <View style={sk.secHead}>
          <Skeleton w={130} h={14} r={5} />
          <SkeletonCircle d={16} />
        </View>
        <RowSkeleton />
        <RowSkeleton divider />
      </View>

      {/* Calendar */}
      <View style={sk.section}>
        <CalendarSkeleton />
      </View>
    </View>
  );
}

export function SeancesSkeleton() {
  return (
    <View style={sk.screen}>
      <HeaderSkeleton />

      {/* Segmented (Confirmed / Past / Applications) */}
      <Skeleton w={'100%'} h={40} r={10} style={{ marginTop: sp.md }} />

      {/* Group label + session cards */}
      <View style={{ marginTop: sp.lg }}>
        <Skeleton w={120} h={13} r={4} style={{ marginBottom: sp.sm }} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={[sk.sessionCard, i > 0 && sk.rowDivider]}>
            <View style={{ width: 52, gap: 7 }}>
              <Skeleton w={44} h={18} r={6} />
              <Skeleton w={32} h={12} r={4} />
            </View>
            <View style={{ flex: 1, gap: 9 }}>
              <Skeleton w={'64%'} h={18} r={6} />
              <Skeleton w={96} h={22} r={r.pill} />
              <Skeleton w={'86%'} h={14} r={4} />
            </View>
            <SkeletonCircle d={22} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function DisponiblesSkeleton() {
  return (
    <View style={sk.screen}>
      <HeaderSkeleton />

      {/* Near-you summary */}
      <View style={sk.nearRow}>
        <SkeletonCircle d={15} />
        <Skeleton w={180} h={14} r={5} />
      </View>

      {/* Calendar (defaults to Week view) */}
      <View style={[sk.section, { marginTop: sp.xl }]}>
        <CalendarSkeleton />
      </View>
    </View>
  );
}

export function RevenusSkeleton() {
  return (
    <View style={sk.sheetBody}>
      {/* Month stepper */}
      <View style={sk.monthStepper}>
        <SkeletonCircle d={40} />
        <Skeleton w={150} h={16} r={5} />
        <SkeletonCircle d={40} />
      </View>

      {/* Hero: amount + trend, meter, export */}
      <SkCard style={{ marginTop: sp.md }}>
        <View style={sk.secHead}>
          <Skeleton w={90} h={13} r={4} />
          <Skeleton w={120} h={22} r={r.pill} />
        </View>
        <Skeleton w={190} h={52} r={10} style={{ marginTop: sp.sm }} />
        <Skeleton w={'100%'} h={10} r={r.pill} style={{ marginTop: sp.md }} />
        <View style={sk.spread}>
          <Skeleton w={120} h={12} r={4} />
          <Skeleton w={100} h={12} r={4} />
        </View>
        <Skeleton w={'100%'} h={52} r={r.pill} style={{ marginTop: sp.lg }} />
      </SkCard>

      {/* Three stat tiles */}
      <View style={[sk.tileRow, { marginTop: sp.md }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[sk.tile, { minHeight: 92 }]}>
            <Skeleton w={30} h={30} r={9} style={{ position: 'absolute', top: sp.md, right: sp.md }} />
            <Skeleton w={'70%'} h={12} r={4} />
            <Skeleton w={'56%'} h={24} r={6} style={{ marginTop: 10 }} />
          </View>
        ))}
      </View>

      {/* Sessions + payment-history lists */}
      {[0, 1].map((s) => (
        <View key={s} style={sk.section}>
          <Skeleton w={150} h={16} r={5} />
          <Skeleton w={'72%'} h={12} r={4} style={{ marginTop: 9 }} />
          <View style={{ marginTop: sp.sm }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[sk.row, i > 0 && sk.rowDivider]}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Skeleton w={'58%'} h={15} r={5} />
                  <Skeleton w={'40%'} h={12} r={4} />
                </View>
                <Skeleton w={56} h={16} r={5} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={sk.sheetBody}>
      {/* Identity — centred avatar + name + role + status chip */}
      <View style={sk.identity}>
        <SkeletonCircle d={84} />
        <Skeleton w={150} h={24} r={7} style={{ marginTop: sp.md }} />
        <Skeleton w={120} h={14} r={5} style={{ marginTop: 8 }} />
        <Skeleton w={96} h={24} r={r.pill} style={{ marginTop: sp.sm }} />
      </View>

      {/* Availability (6 rows) + CTA */}
      <CardRowsSkeleton rows={6} />
      <Skeleton w={'100%'} h={52} r={r.pill} style={{ marginTop: sp.md }} />

      {/* Goals & rate (2), Progression & activity (3), Documents (4), Account (4 — incl. delete) */}
      <CardRowsSkeleton rows={2} />
      <CardRowsSkeleton rows={3} />
      <CardRowsSkeleton rows={4} />
      <CardRowsSkeleton rows={4} />
    </View>
  );
}

// One badge tile (Badges & level grid). `dated` adds the "earned on" line.
function BadgeCardSkeleton({ dated }: { dated?: boolean }) {
  return (
    <View style={sk.badge}>
      <SkeletonCircle d={40} />
      <Skeleton w={'70%'} h={15} r={5} style={{ marginTop: sp.sm }} />
      <Skeleton w={'92%'} h={12} r={4} style={{ marginTop: 7 }} />
      <Skeleton w={'60%'} h={12} r={4} style={{ marginTop: 5 }} />
      {dated ? <Skeleton w={70} h={12} r={4} style={{ marginTop: sp.sm }} /> : null}
    </View>
  );
}

export function BadgesSkeleton() {
  return (
    <View style={sk.sheetBody}>
      {/* Level card — chip + title/sub, progress meter, next-level line */}
      <SkCard>
        <View style={sk.levelHead}>
          <SkeletonCircle d={52} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton w={'40%'} h={26} r={7} />
            <Skeleton w={'62%'} h={13} r={4} />
          </View>
        </View>
        <Skeleton w={'100%'} h={8} r={r.pill} style={{ marginTop: sp.md }} />
        <Skeleton w={'56%'} h={13} r={4} style={{ marginTop: sp.sm }} />
      </SkCard>

      {/* Earned grid (4) */}
      <View style={sk.sectionHead}><Skeleton w={90} h={18} r={5} /></View>
      <View style={sk.grid}>{[0, 1, 2, 3].map((i) => <BadgeCardSkeleton key={i} dated />)}</View>

      {/* In-progress grid (3) */}
      <View style={sk.sectionHead}><Skeleton w={110} h={18} r={5} /></View>
      <View style={sk.grid}>{[0, 1, 2].map((i) => <BadgeCardSkeleton key={i} />)}</View>
    </View>
  );
}

export function ReportHistorySkeleton() {
  return (
    <View>
      {/* facility filter chips */}
      <View style={sk.chipsRow}>
        {[64, 96, 84, 72].map((w, i) => <Skeleton key={i} w={w} h={36} r={r.pill} />)}
      </View>
      {/* count + report rows (each a flat card) */}
      <View style={sk.sheetBody}>
        <Skeleton w={80} h={12} r={4} style={{ marginBottom: sp.sm }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={sk.listCard}>
            <SkeletonCircle d={36} />
            <View style={{ flex: 1, gap: 7 }}>
              <Skeleton w={'56%'} h={15} r={5} />
              <Skeleton w={'38%'} h={12} r={4} />
            </View>
            <Skeleton w={86} h={24} r={r.pill} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function FeedbackSkeleton() {
  return (
    <View style={sk.sheetBody}>
      {/* average-rating hero (centred) */}
      <View style={sk.identity}>
        <SkeletonCircle d={56} />
        <Skeleton w={70} h={44} r={9} style={{ marginTop: sp.sm }} />
        <Skeleton w={150} h={14} r={5} style={{ marginTop: 8 }} />
      </View>
      {/* feedback cards — header row + two comment lines */}
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={sk.fbCard}>
          <View style={sk.fbHead}>
            <SkeletonCircle d={36} />
            <View style={{ flex: 1, gap: 7 }}>
              <Skeleton w={'56%'} h={15} r={5} />
              <Skeleton w={'30%'} h={12} r={4} />
            </View>
            <Skeleton w={56} h={24} r={r.pill} />
          </View>
          <Skeleton w={'100%'} h={13} r={4} style={{ marginTop: sp.sm }} />
          <Skeleton w={'80%'} h={13} r={4} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

export function NotificationsSkeleton() {
  return (
    <View style={{ paddingTop: sp.md }}>
      {[5, 3].map((count, s) => (
        <View key={s} style={sk.notifSection}>
          <Skeleton w={s === 0 ? 60 : 90} h={13} r={4} style={{ marginBottom: sp.sm }} />
          {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={[sk.row, i > 0 && sk.rowDivider]}>
              <Skeleton w={40} h={40} r={20} />
              <View style={{ flex: 1, gap: 8 }}>
                <View style={sk.spread}>
                  <Skeleton w={'52%'} h={15} r={5} />
                  <Skeleton w={34} h={11} r={4} />
                </View>
                <Skeleton w={'82%'} h={13} r={4} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/* ---------- styles (mirror each screen's real geometry) ---------- */

const sk = StyleSheet.create({
  screen: { paddingHorizontal: sp.lg },
  sheetBody: { paddingHorizontal: sp.lg, paddingTop: sp.sm },

  appbar: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, paddingTop: sp.sm, paddingBottom: sp.sm },
  section: { marginTop: sp['2xl'] },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm },

  card: {
    backgroundColor: CARD_BG, borderRadius: r.xl, padding: sp.lg,
    borderWidth: 1, borderColor: CARD_BORDER,
  },
  // Bare earnings value line (matches the real screen — figure + word · figure + word, no box).
  earnRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.xs, flexWrap: 'wrap' },

  ctaRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.md },

  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.md },
  rowDivider: { borderTopWidth: 1, borderTopColor: BORDER_INK },

  /* calendar */
  tileRow: { flexDirection: 'row', gap: sp.sm },
  tile: {
    flex: 1, borderRadius: r.lg, padding: sp.md, minHeight: 104,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER,
  },
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', gap: 2 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 4 },

  /* séances */
  sessionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.md, paddingVertical: sp.md },

  /* disponibles */
  nearRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: sp.xs },

  /* revenus */
  monthStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  /* profile */
  identity: { alignItems: 'center', paddingTop: sp.sm, paddingBottom: sp.sm },
  sectionHead: { marginTop: sp.xl, marginBottom: sp.sm },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 56, paddingVertical: sp.sm },

  /* badges & level */
  levelHead: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  badge: {
    width: '48%', flexGrow: 1, borderRadius: r.lg, padding: sp.md,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER,
  },

  /* report history — chips row + flat list cards */
  chipsRow: { flexDirection: 'row', gap: sp.sm, paddingHorizontal: sp.lg, paddingBottom: sp.sm },
  listCard: {
    flexDirection: 'row', alignItems: 'center', gap: sp.md,
    borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER,
  },

  /* facility feedback */
  fbCard: {
    borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER,
  },
  fbHead: { flexDirection: 'row', alignItems: 'center', gap: sp.md },

  /* notifications */
  notifSection: { marginTop: sp.md, paddingHorizontal: sp.lg },
});
