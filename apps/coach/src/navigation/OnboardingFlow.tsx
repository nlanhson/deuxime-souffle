/**
 * OnboardingFlow — the pre-auth phase machine: Splash → Welcome → Login.
 *
 * Rendered by App when the user is not authenticated (the authenticated branch is RootTabs). It's
 * a tiny local state machine rather than a React Navigation stack — three linear screens don't
 * justify a native-stack dependency, and keeping it self-contained matches the "screen owns its
 * own state" convention used across this app.
 *
 * Transition = a dip-to-ink CROSS-FADE (opacity only): the outgoing screen fades to the ink canvas,
 * we swap, the incoming screen fades back. Opacity is the vestibular-safe choice for a full-screen
 * change (no sliding/zooming the whole viewport), and under reduced motion the swap is instant.
 * Login success calls the auth seam (signIn) which flips App over to the tabs.
 */
import React, { useCallback, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import { surfaces } from '../theme/theme';
import { useAuth } from '../auth/AuthContext';
import { useReducedMotion } from '../lib/useReducedMotion';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;

type Phase = 'splash' | 'welcome' | 'login' | 'signup';

export function OnboardingFlow() {
  const reduced = useReducedMotion();
  const { signIn, register, onboardingEntry } = useAuth();
  // Start at 'splash' on a cold start, or jump straight to 'signup' when returning from the
  // pending screen's back button. Read once at mount — this component remounts on each entry.
  const [phase, setPhase] = useState<Phase>(onboardingEntry);
  const fade = useRef(new Animated.Value(1)).current;
  // Locks out a second tap while a fade is in flight, so we never start an overlapping transition
  // (no double-dip flicker) and the rendered phase can't desync from the opacity it's paired with.
  const busy = useRef(false);

  const go = useCallback(
    (next: Phase) => {
      if (reduced) {
        setPhase(next);
        return;
      }
      if (busy.current) return;
      busy.current = true;
      // Quick exit (dur.fast) → swap → responsive entry (dur.base): the exit accelerates out while
      // the entry uses the standard ease-out — an intentional swallow→exhale rhythm, opacity only.
      Animated.timing(fade, { toValue: 0, duration: dur.fast, easing: ease.in, useNativeDriver: true }).start(
        ({ finished }) => {
          if (!finished) {
            busy.current = false;
            return;
          }
          setPhase(next);
          Animated.timing(fade, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: true }).start(
            () => {
              busy.current = false;
            },
          );
        },
      );
    },
    [reduced, fade],
  );

  let screen: React.ReactNode = null;
  if (phase === 'splash') screen = <SplashScreen reduced={reduced} onDone={() => go('welcome')} />;
  else if (phase === 'welcome')
    screen = <WelcomeScreen reduced={reduced} onLogin={() => go('login')} onApply={() => go('signup')} />;
  else if (phase === 'login')
    screen = <LoginScreen reduced={reduced} onBack={() => go('welcome')} onSuccess={signIn} onCreateAccount={() => go('signup')} />;
  else screen = <SignUpScreen reduced={reduced} onBack={() => go('welcome')} onLogin={() => go('login')} onRegister={register} />;

  return (
    <View style={{ flex: 1, backgroundColor: S.canvas }}>
      <Animated.View style={{ flex: 1, opacity: fade }}>{screen}</Animated.View>
    </View>
  );
}
