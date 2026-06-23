---
category: Feedback & Motion
---

Reveal — cross-fades a layout-matching skeleton into the real content once it has "loaded".

While `loading`, the skeleton sits on top (the content is mounted underneath, already laid out,
at opacity 0). When loading clears, the skeleton fades OUT fast (exit) while the content fades
IN and rises the last 8px (entrance) — asymmetric timing so the system feels responsive, never
sluggish. Nothing appears "from nothing": the content is already there, we only reveal it.

Reduced motion (vestibular safety, non-negotiable): no fade, no rise — the swap is instant,
matching the app's house style (BottomSheet / OnboardingFlow use `reduced ? 0 : …`).
