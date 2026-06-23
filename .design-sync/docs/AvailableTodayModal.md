---
category: Modals
---

AvailableTodayModal — the "See all" sheet for today's open sessions (C11/C12).

A pageSheet listing today's available sessions as tappable rows (same vocabulary as the Home
preview). Tapping a row — or its Apply chip — opens the session detail, which is NESTED inside
this modal's view tree (the proven NotificationCenter pattern) so the popup stacks reliably
over the sheet instead of fighting it as a sibling modal. UI text comes from ../copy.
