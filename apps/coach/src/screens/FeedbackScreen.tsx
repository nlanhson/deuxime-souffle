/**
 * Coach · Facility feedback (SESS-06 — "Coach views EHPAD feedback per session: EHPAD name,
 * date, rating, comment").
 *
 * Brought IN by the client mismatch review (2026-06). A read-only inbox of the ratings +
 * comments facilities left after the coach's sessions: an average-rating hero, then one card per
 * feedback (facility, date, gold star + numeric rating — matching Revenus's "★ 4.8" idiom — and
 * the comment). Informational, not actions — neutral cards (house rule: colour = clickable).
 *
 * Opened as a pageSheet modal from Profile ("Facility feedback"). Mock data is placeholder —
 * real code reads the per-session ratings the EHPAD app submits. Surface = coach (ink).
 */
import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

import { X, Star, Building2 } from '../icons';
import { palette, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { useFirstLoad } from '../lib/useFirstLoad';
import { Reveal } from '../components/Reveal';
import { FeedbackSkeleton } from './skeletons';

const S = surfaces.coach;
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const ON_CARD_3 = palette.neutral[600];
const SUBTLE = palette.neutral[100];
const GOLD = palette.or[800];

const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
  bodyB: 'Inter_700Bold',
};

/* ---------- mock data (placeholders — real code reads the EHPAD app's session ratings) ------- */

type Feedback = { id: string; place: string; date: string; rating: number; comment: string };

const FEEDBACK: Feedback[] = [
  {
    id: 'f6', place: 'Résidence Bellevue', date: '7 juin', rating: 4.8,
    comment: 'Les résidents étaient ravis. Karim adapte chaque exercice à chacun, et la routine en position assise a très bien fonctionné.',
  },
  {
    id: 'f5', place: 'Résidence des Berges', date: '7 juin', rating: 4.6,
    comment: 'Beaucoup d’énergie, il est arrivé en avance et a installé la salle lui-même.',
  },
  {
    id: 'f4', place: 'Résidence Les Chênes', date: '5 juin', rating: 5.0,
    comment: 'La meilleure séance du mois. Mme Petit a participé pour la première fois depuis mars.',
  },
  {
    id: 'f3', place: 'Résidence Les Érables', date: '2 juin', rating: 4.7,
    comment: 'Un beau travail d’équilibre. Un peu plus de temps pour le retour au calme à la prochaine visite serait idéal.',
  },
  {
    id: 'f2', place: 'Résidence Les Tilleuls', date: '30 mai', rating: 4.8,
    comment: 'Le groupe le demande désormais par son prénom. Des consignes claires, beaucoup de patience.',
  },
  {
    id: 'f1', place: 'Résidence Les Cèdres', date: '28 mai', rating: 4.9,
    comment: 'Excellente séance. Le quiz musical associé au mouvement a beaucoup plu.',
  },
];

// Average shown in the hero — placeholder math on mock data; locale formatting comes later.
const AVG = (FEEDBACK.reduce((s, f) => s + f.rating, 0) / FEEDBACK.length).toFixed(1);

/* ---------- screen ---------- */

export function FeedbackScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = copy.ehpadFeedback;
  const loading = useFirstLoad('ehpadFeedback', { active: visible, ms: 550 });

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide" presentationStyle="pageSheet">
      <View style={st.fill}>
        <View style={st.topbar}>
          <View style={{ flex: 1 }}>
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title} numberOfLines={1}>{c.title}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={st.closeBtn} accessibilityRole="button" accessibilityLabel={c.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <Reveal loading={loading} skeleton={<FeedbackSkeleton />}>
        <ScrollView contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
          {/* ===== Average hero ===== */}
          <View style={st.hero} accessible accessibilityLabel={`${c.averageLabel} ${AVG}, ${FEEDBACK.length} ${c.countSuffix}`}>
            <View style={st.heroStar}>
              <Star size={26} color={GOLD} />
            </View>
            <Text style={st.heroAvg}>{AVG}</Text>
            <Text style={st.heroSub}>{`${c.averageLabel} · ${FEEDBACK.length} ${c.countSuffix}`}</Text>
          </View>

          {FEEDBACK.length === 0 ? (
            <Text style={st.empty}>{c.empty}</Text>
          ) : (
            FEEDBACK.map((f) => (
              <View
                key={f.id}
                style={st.card}
                accessible
                accessibilityLabel={`${f.place}, ${f.date}, ${f.rating} ${c.countSuffix}. ${f.comment}`}
              >
                <View style={st.cardHead}>
                  <View style={st.cardIcon}>
                    <Building2 size={18} color={ON_CARD_2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={st.cardPlace} numberOfLines={1}>{f.place}</Text>
                    <Text style={st.cardDate}>{f.date}</Text>
                  </View>
                  <View style={st.rating}>
                    <Star size={14} color={GOLD} />
                    <Text style={st.ratingTxt}>{f.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={st.comment}>{f.comment}</Text>
              </View>
            ))
          )}

          <Text style={st.note}>{c.note}</Text>
        </ScrollView>
        </Reveal>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: S.canvas },
  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 1, color: ON_CANVAS_2 },
  title: { fontFamily: F.oswS, fontSize: 28, lineHeight: 32, color: ON_CANVAS, marginTop: 2 },
  closeBtn: {
    width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  scroll: { paddingHorizontal: sp.lg, paddingBottom: sp['2xl'] },

  hero: { alignItems: 'center', paddingVertical: sp.lg },
  heroStar: {
    width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(242,194,0,0.13)', marginBottom: sp.sm,
  },
  heroAvg: { fontFamily: F.display, fontSize: 44, lineHeight: 53, color: ON_CANVAS },
  heroSub: { fontFamily: F.body, fontSize: 14, color: ON_CANVAS_2, marginTop: 2 },

  empty: { fontFamily: F.body, fontSize: 16, lineHeight: 22, color: ON_CANVAS_2, marginTop: sp.md },

  card: {
    borderRadius: r.lg, padding: sp.md, marginBottom: sp.sm,
    backgroundColor: palette.neutral[0], borderWidth: 1, borderColor: 'rgba(24,23,21,0.07)',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  cardIcon: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[200],
  },
  cardPlace: { fontFamily: F.bodyB, fontSize: 16, color: ON_CARD },
  cardDate: { fontFamily: F.body, fontSize: 13, color: ON_CARD_3, marginTop: 2 },
  rating: {
    flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill,
    backgroundColor: 'rgba(242,194,0,0.13)',
  },
  ratingTxt: { fontFamily: F.bodyS, fontSize: 13, color: GOLD },

  comment: { fontFamily: F.body, fontSize: 16, lineHeight: 21, color: ON_CARD_2, marginTop: sp.sm },

  note: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: ON_CANVAS_2, marginTop: sp.md },
});
