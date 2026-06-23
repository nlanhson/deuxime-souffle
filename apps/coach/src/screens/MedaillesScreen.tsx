/**
 * Médailles — the full tier ladder, opened from the Progression preview ("Voir tout").
 *
 * A cream page-sheet (the app's "ink = tabs, cream = sheets" rule): a header with the X/total
 * completion + a thin movement meter, then the whole ladder grouped into OBTENUS (reached, gold) and
 * À DÉBLOQUER (locked silhouettes with progress toward their session threshold). It renders whatever
 * is in `TIERS`, so it scales if DS ever changes the rungs — the tab keeps showing a short preview.
 * Recognition only.
 *
 * Tiles are the shared EarnedTile / LockedTile (same source as the tab preview, so the two can't
 * drift). Meters render at their final fill on open (calm browse view — the dopamine choreography
 * lives on the tab).
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { X } from '../icons';
import { palette, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { useCopy } from '../i18n';
import { EarnedTile, LockedTile, type Anim } from '../components/BadgeTiles';
import { AnimatedMeterFill } from '../components/AnimatedMeterFill';
import type { Tier } from '../lib/gamification';

const S = surfaces.coach;
const CANVAS = S.canvas;
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD_2 = palette.neutral[600];
const HAIR = 'rgba(24,23,21,0.07)';
const GOLD_FG = palette.or[800];
const GOLD_WASH = 'rgba(242,194,0,0.13)';
const TRACK = palette.neutral[200];

// Static — the page is a calm browse view; the first-load sweep belongs to the Progression tab.
const STATIC: Anim = { animate: false, play: true };

const F = {
  oswS: 'Oswald_600SemiBold',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

export function MedaillesScreen({ visible, onClose, earned, locked, sessions }: {
  visible: boolean;
  onClose: () => void;
  earned: Tier[];
  locked: Tier[];
  sessions: number;
}) {
  const copy = useCopy();
  const c = copy.game;
  const insets = useSafeAreaInsets();
  const total = earned.length + locked.length;
  const collectedTxt = c.collected.replace('{n}', String(earned.length)).replace('{total}', String(total));

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={st.fill}>
        {/* header */}
        <View style={st.header}>
          <View style={{ flex: 1 }}>
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title} numberOfLines={1}>{c.collectionTitle}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={c.collectionCloseA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        {/* completion strip — how close to a full set */}
        <View style={st.completion} accessible accessibilityLabel={collectedTxt}>
          <View style={st.completionRow}>
            <Text style={st.completionTxt}>{collectedTxt}</Text>
          </View>
          <AnimatedMeterFill
            frac={total ? earned.length / total : 0}
            play={STATIC.play}
            animate={STATIC.animate}
            height={8}
            trackColor={TRACK}
            a11yValue={{ min: 0, max: total, now: earned.length }}
            style={{ marginTop: sp.sm }}
          />
        </View>

        <ScrollView
          contentContainerStyle={[st.scroll, { paddingBottom: sp['2xl'] + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {earned.length ? (
            <>
              <View style={st.secTitleRow}>
                <Text style={st.secTitle}>{c.earnedTitle}</Text>
                <View style={st.secChip}><Text style={st.secChipTxt}>{`${earned.length}/${total}`}</Text></View>
              </View>
              <View style={st.grid}>
                {earned.map((t) => (
                  <View key={t.key} style={st.slot}>
                    <EarnedTile tier={t} name={c.tiers[t.key].name} desc={c.tiers[t.key].desc} reachedLabel={c.reachedLabel} />
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {locked.length ? (
            <>
              <Text style={[st.secTitle, st.secTitleTop]}>{c.lockedTitle}</Text>
              <View style={st.grid}>
                {locked.map((t) => (
                  <View key={t.key} style={st.slot}>
                    <LockedTile tier={t} name={c.tiers[t.key].name} desc={c.tiers[t.key].desc} sessions={sessions} anim={STATIC} ofTarget={c.ofTarget} lockedA11y={c.lockedA11y} />
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={st.note}>{c.note}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: CANVAS },

  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: GOLD_FG, textTransform: 'uppercase' },
  title: { fontFamily: F.oswB, fontSize: 26, color: ON_CANVAS, marginTop: 2 },
  close: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.neutral[100] },

  completion: { paddingHorizontal: sp.lg, paddingBottom: sp.md, borderBottomWidth: 1, borderBottomColor: HAIR },
  completionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  completionTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CANVAS_2 },

  scroll: { paddingHorizontal: sp.lg, paddingTop: sp.lg },

  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginBottom: sp.sm },
  secTitle: { fontFamily: F.oswS, fontSize: 18, letterSpacing: 0.3, color: ON_CANVAS },
  secTitleTop: { marginTop: sp.xl, marginBottom: sp.sm },
  secChip: { backgroundColor: GOLD_WASH, paddingVertical: 2, paddingHorizontal: 8, borderRadius: r.pill },
  secChipTxt: { fontFamily: F.oswS, fontSize: 13, color: GOLD_FG },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
  // No flexGrow — a lone last card (odd count) must stay 48%, not stretch to full width.
  slot: { width: '48%' },

  note: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CANVAS_2, marginTop: sp.xl },
});
