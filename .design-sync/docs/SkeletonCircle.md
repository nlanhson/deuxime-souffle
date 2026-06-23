---
category: Feedback & Motion
---

Skeleton — layout-matching placeholders shown while a surface first loads.

Motion model (one shared driver, vestibular-safe):
 - Normal motion: a single low-contrast highlight SWEEPS across each block, all blocks in sync
   off one looped driver (constant motion → `linear`, ~1.2s per pass; well under any flashing
   threshold). This is the only motion the skeletons produce.
 - Reduced motion: the loop never starts, so blocks render STATIC (no sweep, no pulse — a slow
   "breathing" pulse is still a pulsing effect, which vestibular guidance puts on the avoid list).
   The load window is brief, so a static placeholder reads fine.

Wrap a skeleton tree in <SkeletonProvider> once (Reveal does this for you) so every block shares
the one driver instead of spinning up its own loop.
