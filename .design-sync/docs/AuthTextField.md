---
category: Controls & Inputs
---

AuthTextField — the labelled input shared by the login and sign-up forms.

One source for the auth input: a visible label (kept, not placeholder-only — for cognitive a11y
and screen readers), an optional leading icon, a red focus ring, an error border, and an optional
trailing slot (e.g. the password show/hide toggle). Self-manages its focus state and forwards all
standard TextInputProps (keyboardType, autoComplete, returnKeyType, …) so callers stay declarative.

Surface = coach (ink): dark field, light text, neutral placeholder. Pairs the visible label with
an accessibilityLabel on the input — RN has no <label for> association, so the input needs its own
accessible name.
