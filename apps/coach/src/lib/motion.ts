/**
 * Shared motion primitives for the coach app.
 *
 * Strong custom easing curves (the built-in RN easings are too weak) + a small duration scale,
 * so every screen's entrance/transition feels consistent. Entrances use `out` (starts fast →
 * responsive); exits use `in`; on-screen movement uses `inOut`. Durations stay tight per the
 * animation framework (UI motion < ~300ms; `splash` is the one deliberate, first-launch beat).
 *
 * Pair every transform-based motion with a reduced-motion check (see ../lib/useReducedMotion) —
 * under reduced motion we keep only opacity, which is vestibular-safe.
 */
import { Easing } from 'react-native';

export const ease = {
  out: Easing.bezier(0.23, 1, 0.32, 1),     // strong ease-out — entrances
  inOut: Easing.bezier(0.77, 0, 0.175, 1),  // on-screen movement / morphs
  in: Easing.bezier(0.4, 0, 1, 1),          // exits (accelerate out)
} as const;

export const dur = {
  fast: 140,         // press feedback / quick fades
  base: 220,         // standard entrance
  slow: 320,         // larger reveals
  splash: 620,       // the single first-launch beat
  entryStagger: 90,  // gap between staggered entrance items (snappier than `fast` on purpose)
} as const;
