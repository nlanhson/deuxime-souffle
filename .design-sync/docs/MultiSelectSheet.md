---
category: Sheets
---

MultiSelectSheet — a multiple-choice picker inside the shared BottomSheet.

Used where a row holds a SET of values rather than one (the Weekly-schedule day picker). Options
render as toggle pills that wrap; tapping flips each on/off (multi-select), and the choice is
committed on Save (so a mis-tap is recoverable, unlike the single-select OptionSheet which closes
on tap). Coach surface (ink). UI labels come from the caller (the localization seam in ../copy).
