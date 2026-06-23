---
category: Modals
---

CancelModal (C24 · WBS PLA-11 "impact-aware cancellation" + PLA-13 time-phase rules) — opened from
the session detail's Manage group ("Annuler ma participation").

Unlike a bare confirm, this makes the CONSEQUENCE legible before the coach commits — the point of
PLA-11. The penalty is timing-based, per the algorithm's configurable penalties (the authoritative
model that resolves the WBS's internal 48h-vs-30min conflict):
  · cancel MORE than 48h before the session  → no penalty (free)
  · cancel 48h or LESS before the session     → −2 confidence-index points
  · (a no-show — never cancelling — is −6, handled elsewhere)
Admin/EHPAD-initiated cancellations carry no penalty (not modelled here — this is the coach path).

Per DT-05 the coach is never shown a rate, so the "impact" is expressed in reputation + operational
terms (the slot reopens, the care home is notified, repeated late cancels hurt future matching) —
NOT a euro figure, even though PLA-11 mentions "projected-revenue impact" on the admin side.

A pageSheet modal (mirrors AbsenceModal). Two states: review → a short acknowledgement. Transitions
are instant content swaps — nothing to suppress under reduced motion. On confirm, the parent drops
the session from the list (the real app persists the cancellation + notifies the care home).
