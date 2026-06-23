---
category: Sheets
---

OptionSheet — a single-select / quick-action list inside the shared BottomSheet.

Used wherever a row needs a short, finite set of choices (transport: car/walking · max travel
time · profile-photo actions). Selecting an option fires `onSelect(key)` and closes the sheet.
The current value carries a red check (never colour alone — the row also reads as selected to
a screen reader via accessibilityState). Coach surface (ink): light text on the dark card.
