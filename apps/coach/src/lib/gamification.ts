/**
 * Coach gamification — single source of truth for the TIER LADDER + motivational stats.
 *
 * Replaces the old numeric level + mixed-category badges (2026-06-22). Gamification is now ONE
 * progression: a five-rung ladder of session-count tiers — Bronze → Argent → Or → Platine → Diamant —
 * that coaches climb purely by completing sessions. No levels, no points, no other badge categories.
 * Every surface (Home hero teaser, Profile tier card, Progression tab, unlock celebration) derives
 * from these thresholds + the live session count, so they can never drift. Recognition only: none of
 * this affects pay.
 */
import { Medal, Award, Trophy, Crown, Gem, type LucideIcon } from '../icons';

export type TierKey = 'bronze' | 'argent' | 'or' | 'platine' | 'diamant';

export type Tier = {
  key: TierKey;
  icon: LucideIcon;
  threshold: number; // lifetime sessions required to reach this rung
};

// The ladder, low → high (client-set thresholds, 2026-06-22). MUST stay ascending by threshold —
// the index/progress helpers below short-circuit on that ordering.
export const TIERS: Tier[] = [
  { key: 'bronze', icon: Medal, threshold: 1 },
  { key: 'argent', icon: Award, threshold: 25 },
  { key: 'or', icon: Trophy, threshold: 50 },
  { key: 'platine', icon: Crown, threshold: 100 },
  { key: 'diamant', icon: Gem, threshold: 200 },
];

export const TIER_COUNT = TIERS.length;

// Lifetime sessions — seeded one shy of 100 so the coach is genuinely "almost there": the next
// completed session report is their 100th and promotes them to Platine for real (see
// lib/badgeCelebration). Good motivation design too.
export const SESSIONS_SEED = 99;

// Motivational hero stats (mock) — shared by the Home hero and the Progression stat band.
export const STREAK = 5; // séances d'affilée ("série")
export const RESIDENTS = 214; // résidents touchés (lifetime)

/** Index of the highest rung reached at `sessions`; -1 when still below Bronze. */
export function currentTierIndex(sessions: number): number {
  let idx = -1;
  for (let i = 0; i < TIERS.length; i++) {
    if (sessions >= TIERS[i].threshold) idx = i;
    else break; // ascending thresholds → nothing higher can match
  }
  return idx;
}

/** Highest tier reached, or null when still below the first rung. */
export function currentTier(sessions: number): Tier | null {
  const i = currentTierIndex(sessions);
  return i >= 0 ? TIERS[i] : null;
}

/** Next rung to unlock, or null once the top (Diamant) is reached. */
export function nextTier(sessions: number): Tier | null {
  const i = currentTierIndex(sessions);
  return i + 1 < TIERS.length ? TIERS[i + 1] : null;
}

export function isTierReached(key: TierKey, sessions: number): boolean {
  const t = TIERS.find((x) => x.key === key);
  return !!t && sessions >= t.threshold;
}

/** Tiers already reached at `sessions`, low → high. */
export function reachedTiers(sessions: number): Tier[] {
  return TIERS.filter((t) => sessions >= t.threshold);
}

/** Sessions still needed to reach the next rung (0 once maxed). */
export function sessionsToNext(sessions: number): number {
  const nt = nextTier(sessions);
  return nt ? Math.max(0, nt.threshold - sessions) : 0;
}

/** 0–1 fill toward the next rung's threshold (absolute progress on the cumulative count); 1 once maxed. */
export function tierProgress(sessions: number): number {
  const nt = nextTier(sessions);
  if (!nt) return 1;
  return Math.max(0, Math.min(1, sessions / nt.threshold));
}
