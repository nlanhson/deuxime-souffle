---
category: Modals
---

CheckInModal (C16) — the geolocated check-in flow, opened from the Séances "Check in" CTA.

A small state machine, not a yes/no confirm: the real gate is location + time, not user
intent. Phases:
  intro     → explains the check, privacy note, "Check in now"
  locating  → spinner while we'd capture GPS + validate
  result    → one of five outcomes encoding C17 (time + location) and C18 (late):
              success · late · tooFar · tooEarly · denied

Geolocation isn't wired yet, so the intro carries a prototype-only "Preview outcome"
switcher to tour every state. On a successful (or late) check-in it calls `onConfirmed`
so the session card can flip to the "Checked in" status. Surface = coach dark ink card,
mirroring ActionModal so the app speaks one modal language.
