---
category: Buttons & Actions
---

PrimaryButton — the app's ONE primary-action style.

A red-dominant gradient pill with a rouge glow: rouge holds 0→70% of the diagonal, then a
soft ~30% ramp into the brand GOLD in the bottom-right corner (locations [0.7, 1]) — the
moodboard's signature rouge→or "movement" gesture (DT-02). The label stays centred over the
rouge field, so white-on-red contrast holds; the gold is a corner accent, never under the text.
This is the single source of truth for the main call-to-action on any screen, so every primary
button looks identical. Secondary (outline) and ghost (low-emphasis) buttons stay separate
by design — the gradient is reserved for the one dominant action per context.

Sizing is left to the caller via `style` (e.g. `{ flex: 1 }` / `{ flex: 2 }` in a CTA row).
