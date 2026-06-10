/**
 * Segmented — adaptive resolver, the sibling of navigation/RootTabs.
 *
 * Renders the NATIVE UISegmentedControl where the native path is chosen, and the branded
 * JS pills on web / pre-13 iOS. The require() is deliberate (same as RootTabs): it defers
 * evaluating each implementation until it's actually selected, so the web/JS path never
 * loads the native module. The decision lives in ./supportsNativeSegmented.
 *
 * Usage:
 *   <Segmented
 *     value={mode}
 *     onChange={setMode}
 *     options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
 *     theme={{ selected: palette.neutral[700] }}
 *   />
 */
import React from 'react';

import { supportsNativeSegmented } from './supportsNativeSegmented';
import type { SegmentedProps } from './types';

export function Segmented<T extends string>(props: SegmentedProps<T>) {
  // The underline variant has no native UISegmentedControl analogue — always JS.
  if (props.variant !== 'underline' && supportsNativeSegmented()) {
    const { NativeSegmented } = require('./NativeSegmented') as typeof import('./NativeSegmented');
    return <NativeSegmented {...props} />;
  }

  const { JsSegmented } = require('./JsSegmented') as typeof import('./JsSegmented');
  return <JsSegmented {...props} />;
}
