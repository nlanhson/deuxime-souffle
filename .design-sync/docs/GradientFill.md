---
category: Feedback & Motion
---

GradientFill — the rouge→or "movement" CTA fill (DT-02), absolutely positioned to sit BEHIND a
button's label/icon.

Drop it as the FIRST child of any Pressable/View, then render the content (Text/icon) after it so
the content paints on top. Match `radius` to the button's own borderRadius (default = r.button;
pass 999 for circular "Raise hand" actions) so the gradient's corners line up with the button.
The host view keeps its `backgroundColor` as a one-frame fallback / iOS shadow caster — the
gradient covers it once mounted.

Single source of truth = theme `gradient.cta`, shared with <PrimaryButton/>, so every primary
action button across the app shows the identical brand gesture and cannot drift.
