---
category: Sheets
---

BottomSheet — the shared slide-up sheet used by the app's action popups (ActionModal,
CheckInModal, the Notification detail). Mirrors the Earnings sheet's language: a card anchored
to the bottom edge with a grabber handle, over a dimmed backdrop.

The native Modal's animationType="slide" translates the whole layer (backdrop + card) as one,
so the tint slides in with the sheet. We want the tinted black to FADE in/out while the card
SLIDES, so we drive both with the Animated API (animationType="none") and keep the sheet
mounted through its exit animation.

Reduced motion (vestibular safety, non-negotiable): no slide — the card cross-fades in place
alongside the backdrop, instantly. Movement is what triggers motion sickness; opacity is safe.
