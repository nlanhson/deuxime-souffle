/**
 * Tier celebration — the controller behind the "you just reached a new tier" moment.
 *
 * Two responsibilities, one tiny external store (no extra deps, mirrors the app's other shared
 * stores):
 *
 *  1. SESSION COUNTER. Completing a post-session report IS "une séance réalisée" — the only thing the
 *     tier ladder is built on (lib/gamification). We persist a delta on top of the seeded lifetime
 *     total (SESSIONS_SEED) so the count survives reloads, and re-evaluate the ladder whenever it
 *     grows. The seed sits at 99, so the next completed report is the coach's 100th session → they're
 *     promoted to Platine for real.
 *
 *  2. CELEBRATE ONCE, EVER. A tier should be celebrated the first time it's reached and never again.
 *     We keep an `acknowledged` set in AsyncStorage. On first run it's SEEDED with every tier the
 *     coach already holds (the rungs at/under the seeded count), so historical tiers never replay —
 *     only a rung crossed live, in front of the coach, triggers the overlay.
 *
 * Recognition only: like the rest of the gamification surface, none of this touches pay.
 */
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TIERS, SESSIONS_SEED, reachedTiers, type TierKey } from './gamification';

const ACK_KEY = 'coach.tiers.acknowledged.v1';
const DELTA_KEY = 'coach.sessions.delta.v1';

let loaded = false;
let acknowledged = new Set<string>();
let delta = 0;
let queue: TierKey[] = [];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Live lifetime session count = seeded total + everything completed since. */
export function completedSessions(): number {
  return SESSIONS_SEED + delta;
}

async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const [ackRaw, deltaRaw] = await Promise.all([
      AsyncStorage.getItem(ACK_KEY),
      AsyncStorage.getItem(DELTA_KEY),
    ]);
    delta = deltaRaw ? Number(deltaRaw) || 0 : 0;
    if (ackRaw) {
      acknowledged = new Set<string>(JSON.parse(ackRaw));
    } else {
      // First run: every rung the coach already holds counts as "seen" so we never replay history.
      acknowledged = new Set(reachedTiers(completedSessions()).map((t) => t.key));
      await AsyncStorage.setItem(ACK_KEY, JSON.stringify([...acknowledged]));
    }
  } catch {
    delta = 0;
    acknowledged = new Set(reachedTiers(completedSessions()).map((t) => t.key));
  }
  emit();
}

/** Queue a tier for celebration — but only the first time it's ever reached. */
export function celebrateTier(key: TierKey): void {
  if (acknowledged.has(key) || queue.includes(key)) return;
  queue = [...queue, key];
  emit();
}

/**
 * Record one completed session (called when a post-session report is sent). Grows the lifetime count
 * and celebrates any tier whose threshold this crossing reaches.
 */
export async function recordSessionCompleted(): Promise<void> {
  await ensureLoaded();
  const before = completedSessions();
  delta += 1;
  const after = completedSessions();
  try {
    await AsyncStorage.setItem(DELTA_KEY, String(delta));
  } catch {
    /* best-effort — the in-memory count still advances this session */
  }
  emit();
  for (const { key, threshold } of TIERS) {
    if (before < threshold && after >= threshold) celebrateTier(key);
  }
}

/** Acknowledge (and dismiss) the tier currently being celebrated. */
export function dismissCurrentTier(): void {
  const [current, ...rest] = queue;
  queue = rest;
  if (current) {
    acknowledged.add(current);
    AsyncStorage.setItem(ACK_KEY, JSON.stringify([...acknowledged])).catch(() => {});
  }
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  void ensureLoaded(); // warm storage the moment anything observes the store
  return () => listeners.delete(cb);
}

/** The tier currently awaiting celebration (front of the queue), or null. */
export function useTierCelebration(): TierKey | null {
  return useSyncExternalStore(
    subscribe,
    () => queue[0] ?? null,
    () => queue[0] ?? null,
  );
}

/** Live lifetime session count, re-rendering on every completion. */
export function useCompletedSessions(): number {
  return useSyncExternalStore(subscribe, completedSessions, completedSessions);
}
