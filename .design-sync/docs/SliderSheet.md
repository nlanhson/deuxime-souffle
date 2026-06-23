---
category: Sheets
---

SliderSheet — a single-value range picker inside the shared BottomSheet (WBS PLA-08: the max
travel time is a SLIDER, 10–90 minutes — not a preset list).

Anatomy: big live readout, then the slider track flanked by −/+ stepper buttons. The steppers
aren't decoration — they're the motor-accessible alternative to the drag gesture (tremor/switch
users adjust in precise steps; every target ≥ 44px). The track itself is one accessible
"adjustable" element: screen readers announce the value and adjust it with the standard
increment/decrement actions. Value commits on Save (mis-drags are recoverable), like the other
commit-on-save sheets. Coach surface (ink). No entrance animation beyond the sheet's own.
