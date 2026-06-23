---
category: Sheets
---

FieldEditSheet — a keyboard-safe form sheet for editing one or more fields.

The shared BottomSheet is bottom-anchored and content-sized — great for confirms/option lists,
but a text form needs to ride above the keyboard. So this mirrors the BottomSheet's look (ink
card, grabber, top-lit gradient, dimmed backdrop) AND its animation: the tinted black backdrop
FADES in/out (Animated opacity) while the card SLIDES (translateY) — driven by one progress
value with animationType="none", so the tint never slides in as one layer with the card. Fields
render through the shared AuthTextField; an optional single-select `choice` renders as a
segmented control under them. `onSave` receives the field values (+ the chosen option) only
after `validate` passes.

Reduced motion (vestibular safety, non-negotiable): the card cross-fades in place — no slide —
while the backdrop still fades. Coach surface (ink). UI labels come from the caller (../copy).
