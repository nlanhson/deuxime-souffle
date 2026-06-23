---
category: Cards & Display
---

LevelCard — the coach's level + progress toward the next (GAME-02).

A gold "Niveau N" badge, the points readout, and the signature rouge→or progress meter; the whole
card taps through to the full Badges & level screen. The WBS puts this on the coach profile
("current level visible on the coach profile with a progress indicator to the next level"), and
PLA-01 also surfaces the level on the Home dashboard — so it's a shared component to keep the two
identical (DT-17: one prominent gold level treatment, no drift).

Self-contained: it reads the level constants from the Badges screen (the single source) and its
labels from copy, so a caller only passes `onPress` (open the Badges & level screen).
