---
category: Modals
---

AbsenceModal (C20 / WBS PLA-11) — "Declare absence" for an assigned session, opened from the
session detail's Manage group.

The WBS specifies a 3-STEP required form (not a one-tap confirm): 1 pick a reason (required)
→ 2 message to the care home (optional, sent with the notification) → 3 review + confirm. The
deliberate pacing is the point — an absence excludes the coach from matching for that slot and
weighs on the reputation score, so the form makes the coach look at what they're sending.

A pageSheet modal (like TransmissionNotes) rather than a bottom sheet, because step 2 carries
a text field that must ride above the keyboard. Step transitions are instant content swaps —
no slide — so there's nothing to suppress under reduced motion. On confirm, the screen drops
the session from the list (the real app persists reason + message and notifies the care home).
