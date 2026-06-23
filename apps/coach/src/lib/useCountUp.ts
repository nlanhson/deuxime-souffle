/**
 * useCountUp — animates a number from 0 up to `target` once, on the choreography "go" signal.
 *
 * Kept deliberately scarce (1–2 instances per screen) because it drives React state on every frame
 * via an Animated listener — fine for a hero numeral, wasteful for a whole stat band. Under Reduce
 * Motion (or when `animate` is false) it returns the final value immediately, no ticking. A screen
 * reader should read the FINAL value via the parent's label, not the animated digits.
 */
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import { ease } from './motion';

export function useCountUp(
  target: number,
  { play, animate, duration = 500, delay = 0 }: { play: boolean; animate: boolean; duration?: number; delay?: number },
): number {
  const [n, setN] = useState(animate ? 0 : target);
  const v = useRef(new Animated.Value(0)).current;
  const started = useRef(false);

  useEffect(() => {
    if (!animate) {
      setN(target); // keep in sync if the target changes while static (e.g. live session count)
      return;
    }
    if (started.current || !play) return;
    started.current = true;
    const id = v.addListener(({ value }) => setN(Math.round(value)));
    Animated.timing(v, { toValue: target, duration, delay, easing: ease.out, useNativeDriver: false }).start();
    return () => v.removeListener(id);
  }, [play, animate, target, duration, delay, v]);

  return n;
}
