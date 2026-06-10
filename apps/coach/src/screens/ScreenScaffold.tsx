import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { surfaces, color, spacing, typography } from '../theme/theme';

const coach = surfaces.coach;

/**
 * Placeholder scaffold for the coach (ink) surface — one per tab while the real
 * screens are designed. Keeps every tab on-brand (ink canvas, red accent) so the
 * native nav bar can be exercised end-to-end.
 */
export function ScreenScaffold({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: coach.canvas,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    gap: spacing.sm,
  },
  eyebrow: {
    color: color.action,
    fontSize: typography.size.bodySm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: coach.textPrimary,
    fontSize: typography.size.h1,
    fontWeight: '700',
  },
  subtitle: {
    color: coach.textSecondary,
    fontSize: typography.size.body,
    lineHeight: typography.size.body * typography.lineHeight.body,
    maxWidth: 320,
  },
});
