---
category: Feedback & Motion
---

BlankScreen — a reusable, built-but-unwired placeholder. A pageSheet modal with a header
(title + close) and a centered empty state, for sub-flows whose real screen doesn't exist
yet (e.g. the Sessions overflow-menu destinations: cancel participation, declare absence,
transmission notes, application status).

Drop-in shape matches the other coach modals (ProfileScreen / ReportScreen): `visible` +
`onClose`, plus a `title` so one component can stand in for several destinations. Wire it
to a menu item by holding the chosen title in state and toggling `visible` — not done yet,
by request.

Surface = coach: dark ink canvas, light text inside (same polarity as the session cards).
