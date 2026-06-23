---
category: Controls & Inputs
---

Segmented — adaptive resolver, the sibling of navigation/RootTabs.

Renders the NATIVE UISegmentedControl where the native path is chosen, and the branded
JS pills on web / pre-13 iOS. The require() is deliberate (same as RootTabs): it defers
evaluating each implementation until it's actually selected, so the web/JS path never
loads the native module. The decision lives in ./supportsNativeSegmented.

Usage:
  <Segmented
    value={mode}
    onChange={setMode}
    options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
    theme={{ selected: palette.neutral[700] }}
  />
