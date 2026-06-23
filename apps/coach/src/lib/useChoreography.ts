/**
 * useChoreography — decides whether a screen's first-load reward sequence should play, and fires the
 * "go" signal once the skeleton has cleared.
 *
 * `animate` is locked at mount: it's only true when this was a genuine first load (the skeleton was
 * showing) AND Reduce Motion is off. So a tab revisit within the session (no skeleton) or a
 * reduced-motion user gets `animate = false` → every consumer renders its FINAL state immediately,
 * identical to the resting screen. `play` flips true a frame after `loading` clears, so the beats
 * start as the content reveals (and never replay).
 */
import { useEffect, useRef, useState } from 'react';

export function useChoreography(loading: boolean, reduced: boolean): { animate: boolean; play: boolean } {
  const wasLoadingOnMount = useRef(loading);
  const animate = !reduced && wasLoadingOnMount.current;
  const [play, setPlay] = useState(!animate); // if we're not animating, we're already "played" (final)

  useEffect(() => {
    if (!animate || play || loading) return;
    const id = setTimeout(() => setPlay(true), 16); // next frame — let the content paint, then sweep
    return () => clearTimeout(id);
  }, [animate, play, loading]);

  return { animate, play };
}
