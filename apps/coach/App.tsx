import { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Animated, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import { Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import { RootTabs } from './src/navigation/RootTabs';
import { OnboardingFlow } from './src/navigation/OnboardingFlow';
import { PendingApprovalScreen } from './src/screens/PendingApprovalScreen';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { surfaces, color, palette } from './src/theme/theme';
import { useReducedMotion } from './src/lib/useReducedMotion';
import { ease, dur } from './src/lib/motion';

const coach = surfaces.coach;

// Le Club — coach (ink) navigation theme.
const LeClubDark: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: color.action,
    background: coach.canvas,
    card: coach.canvas,
    text: coach.textPrimary,
    border: palette.neutral[800],
    notification: color.action,
  },
};

type BranchKey = 'loading' | 'signedOut' | 'pending' | 'signedIn';

function renderBranch(key: BranchKey) {
  switch (key) {
    case 'loading':
      // Hold on the ink canvas (matching the native cold-start splash) until the fonts resolve —
      // the onboarding wordmark + tabs both render Anton/Oswald/Inter.
      return <View style={{ flex: 1, backgroundColor: coach.canvas }} />;
    case 'signedOut':
      return <OnboardingFlow />;
    case 'pending':
      return <PendingApprovalScreen />; // PENDING_APPROVAL — app locked here
    case 'signedIn':
      return (
        <NavigationContainer theme={LeClubDark}>
          <RootTabs />
        </NavigationContainer>
      );
  }
}

// Auth gate: while not signed in, run the onboarding flow (Splash → Welcome → Login); once signed
// in, mount the navigation container + tabs. Profile's "Log out" calls signOut and returns here.
//
// The swap between branches is a DIP-TO-INK cross-fade (opacity only) — the same vestibular-safe
// language as OnboardingFlow's screen transitions — so signing in / out no longer hard-cuts from
// the onboarding flow straight to the tabs. The very first reveal (ink → splash) stays instant so
// SplashScreen plays its own entrance; reduced motion swaps instantly throughout.
function Gate({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { status } = useAuth();
  const reduced = useReducedMotion();
  const target: BranchKey = !fontsLoaded
    ? 'loading'
    : status === 'signedOut'
    ? 'signedOut'
    : status === 'pending'
    ? 'pending'
    : 'signedIn';

  const [shown, setShown] = useState<BranchKey>(target);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (target === shown) return;
    // Instant on the first reveal (let the splash own its entrance) and under reduced motion.
    if (reduced || shown === 'loading') {
      setShown(target);
      return;
    }
    Animated.timing(opacity, { toValue: 0, duration: dur.base, easing: ease.in, useNativeDriver: true }).start(
      ({ finished }) => {
        if (!finished) return;
        setShown(target);
        opacity.setValue(0);
        Animated.timing(opacity, { toValue: 1, duration: dur.slow, easing: ease.out, useNativeDriver: true }).start();
      },
    );
  }, [target, shown, reduced, opacity]);

  return (
    <Animated.View style={{ flex: 1, backgroundColor: coach.canvas, opacity }}>
      {renderBranch(shown)}
    </Animated.View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });

  return (
    // `initialMetrics` seeds the real window insets/frame synchronously. Without it the
    // provider starts at a zero frame and only corrects itself via an async measure — and
    // that measure never lands inside react-native-bottom-tabs' native-hosted tab screens
    // (each is its own UIViewController, laid out edge-to-edge), so every tab rendered with a
    // zero top inset (status bar over content) and a collapsed height.
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="light" />
      <AuthProvider>
        <Gate fontsLoaded={fontsLoaded} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
