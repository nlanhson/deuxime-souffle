---
category: Controls & Inputs
---

StepProgress — a compact multi-step progress indicator for short flows.

Renders `total` segments with the first `current` filled in the action colour and the rest left
as a muted track, plus a small "Étape 1 sur 2"-style label. Built for the coach sign-up header,
where the form is step 1 of 2 (identity → KYC documents on the pending screen) but nothing told
the coach how far they were. Generic on purpose: pass `current`/`total`/`label` and reuse it for
any other short, linear flow.

Accessibility: the whole control is a single `progressbar` exposing min/max/now, and the visible
label doubles as its accessible name — so a screen reader announces "Étape 1 sur 2" once, not a
row of anonymous bars.
