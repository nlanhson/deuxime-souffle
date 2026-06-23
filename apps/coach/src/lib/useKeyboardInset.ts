/**
 * useKeyboardInset — live height of the on-screen keyboard (0 when hidden). iOS only.
 *
 * Why this exists: KeyboardAvoidingView (behavior="padding") mis-measures inside a
 * `presentationStyle="pageSheet"` Modal. The sheet is presented inset from the top, so the view's
 * frame and the keyboard frame live in different coordinate spaces — KAV under-lifts and a pinned
 * footer button stays hidden under the keyboard. Reading the keyboard height directly and padding
 * the footer container by it sidesteps the bad math: the sheet's bottom is flush with the screen
 * edge, so paddingBottom = keyboard height lifts the footer to exactly the keyboard's top.
 *
 * Returns 0 on Android, which lifts the window natively (windowSoftInputMode=resize) — adding JS
 * padding there would double-count. The change is wrapped in a keyboard-matched LayoutAnimation so
 * the footer tracks the keyboard's own slide (coupled, direct-manipulation motion — safe under
 * reduced motion, since it never moves independently of the control the user is invoking).
 */
import { useEffect, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';

export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return; // Android resizes the window natively

    const animate = (duration: number) =>
      LayoutAnimation.configureNext({
        duration: duration || 250,
        update: { type: LayoutAnimation.Types.keyboard },
      });

    const show = Keyboard.addListener('keyboardWillShow', (e) => {
      animate(e.duration);
      setInset(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardWillHide', (e) => {
      animate(e.duration);
      setInset(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return inset;
}
