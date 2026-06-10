/**
 * useReducedMotion — tracks the OS "Reduce Motion" accessibility setting and keeps it live.
 *
 * Vestibular safety is non-negotiable: any screen that animates position/scale must read this
 * and fall back to opacity-only (or instant) when it's on. Mirrors the AccessibilityInfo pattern
 * already used in AccueilScreen, but reusable across the onboarding flow.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
