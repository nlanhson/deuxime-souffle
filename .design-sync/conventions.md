# Deuxième Souffle — Coach component library

These are the **real React Native (Expo) components** from the Deuxième Souffle coaching app, compiled to web via **react-native-web** and exposed on `window.CoachDS.*`. Build with them directly — every component is the shipped app code, not a re-implementation.

## How to style — there is NO CSS class system
This is a **prop-and-theme** design system, not a utility-class one. Do **not** invent `className`s or CSS utilities — they do nothing here. Style each component through its **typed props** (read the component's `<Name>.d.ts` for the exact prop contract and `<Name>.prompt.md` for usage). For your own layout glue around the components, use plain inline styles or React Native `View`/`Text`; the design system ships no class vocabulary.

The brand look (colors, spacing, radii, fonts) is already baked into every component — you rarely set colors yourself. When a component exposes a choice, it's a semantic prop (e.g. `variant`, `compact`, `error`, `disabled`), never a raw color.

## Brand language (already embodied by the components)
- **Type:** `Anton_400Regular` (display), `Oswald_500Medium`/`Oswald_600SemiBold` (headings & labels), `Inter_400Regular`/`Inter_600SemiBold`/`Inter_700Bold` (body). Shipped as `@font-face` via `styles.css` → `fonts/fonts.css`.
- **Color:** rouge `#E1322B` = the primary action; a rouge→gold (`#F2C200`) gradient is the signature CTA fill, reserved for the **one** dominant action per screen; bleu `#2F4F92` = info/score; vert `#2F9E6B` = progress/health; warm-paper canvas `#F7F4EF`; ink `#181715` for hero bands and text.
- **One primary action per context:** use `PrimaryButton` (gradient) for it; everything else is `SecondaryButton` (outline) — never two gradient buttons together.

## Catalog (window.CoachDS.*, by group)
- **Buttons & Actions:** `PrimaryButton` (gradient CTA — `label`, `onPress`, `compact`, `disabled`, `icon`), `SecondaryButton` (outline), `GoogleButton`.
- **Controls & Inputs:** `AuthTextField` (labelled field — `label`, `error`, `help`, `optional`, + standard TextInput props like `placeholder`/`value`), `SelectField`, `Segmented` (`options`, `value`, `onChange`, `variant: 'pill' | 'underline'`), `StepProgress` (`current`, `total`, `label`).
- **Cards & Display:** `ScoreCard` (`scores`, `compact`), `LevelCard`, `InkHeader` (dark hero band — `title`, optional `subtitle`/avatar), `CalendarLegend`, `NotificationCenter`, `ProfileAvatar` (`size`, `uri`).
- **Brand:** `Logo` (`size`, `glow`), `GoogleMark` (`size`).
- **Feedback & Motion:** `Skeleton` (`w`, `h`, `r`), `SkeletonCircle` (`d`) — both must be inside `SkeletonProvider`; `GradientFill` (absolute fill — host needs `position:relative` + fixed size + `overflow:hidden`); `Reveal` (entrance wrapper, `loading`); `BlankScreen` (empty state).
- **Modals:** `AbsenceModal`, `ActionModal`, `CancelModal`, `CheckInModal`, `AvailableDetailModal`, `AvailableTodayModal`, `NextSessionDetailModal` — full-screen `Modal`s driven by `visible` + `onClose`.
- **Sheets:** `BottomSheet`, `OptionSheet`, `MultiSelectSheet`, `SliderSheet`, `FieldEditSheet`, `HalfDayScheduleSheet` — bottom-sheet pickers, also `visible` + `onClose`.
- **Map:** `SessionMap`.

Copy is **French** (the product's language) — keep generated content in French.

## Idiomatic snippet
```jsx
const { PrimaryButton, SecondaryButton, ScoreCard, InkHeader } = window.CoachDS;

<View style={{ gap: 16, padding: 16, backgroundColor: '#F7F4EF' }}>
  <InkHeader title="Bonjour, Camille" subtitle="3 séances cette semaine" />
  <ScoreCard scores={{ equity: 82, reputation: 91, proximity: 74, total: 84 }} />
  <View style={{ flexDirection: 'row', gap: 12 }}>
    <SecondaryButton label="Annuler" onPress={() => {}} style={{ flex: 1 }} />
    <PrimaryButton label="Confirmer la séance" onPress={() => {}} style={{ flex: 2 }} />
  </View>
</View>
```
