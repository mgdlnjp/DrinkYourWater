import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHydration, dayKey, sumDay, streak } from '../store';
import { useTabSpace } from '../components/TabBar';
import { Card, SectionTitle, Txt, formatMl, useTheme } from '../components/ui';
import { radius, space } from '../theme';

const WHITE_70 = 'rgba(255,255,255,0.72)';
const TIPS = [
  { emoji: '🧠', title: 'Concentration', text: 'Même une légère déshydratation fait baisser l’attention.', tint: '#8B5CF6' },
  { emoji: '⚡', title: 'Énergie', text: 'Le coup de barre de 15 h vient souvent d’un manque d’eau.', tint: '#F59E0B' },
  { emoji: '🌡️', title: 'Température', text: 'L’eau aide ton corps à réguler sa chaleur.', tint: '#EC4899' },
  { emoji: '🍽️', title: 'Digestion', text: 'Bien hydraté, ton transit fonctionne mieux.', tint: '#10B981' },
];

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function bestStreak(log, goal) {
  const keys = Object.keys(log).filter((k) => sumDay(log[k]) >= goal).sort();
  let best = 0;
  let cur = 0;
  let prev = null;
  for (const k of keys) {
    const d = new Date(`${k}T12:00:00`);
    cur = prev && Math.round((d - prev) / 86400000) === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

function badges(log, goal) {
  const days = Object.values(log);
  const totals = days.map(sumDay);
  const total = totals.reduce((a, b) => a + b, 0);
  const best = bestStreak(log, goal);
  const early = days.some((es) => es.some((e) => new Date(e.t).getHours() < 9));
  return [
    { emoji: '💧', name: 'Première gorgée', ok: total > 0 },
    { emoji: '🌅', name: 'Lève-tôt', ok: early },
    { emoji: '🎯', name: 'Objectif atteint', ok: totals.some((v) => v >= goal) },
    { emoji: '🔥', name: '3 jours de suite', ok: best >= 3 },
    { emoji: '🏆', name: 'Semaine parfaite', ok: best >= 7 },
    { emoji: '🚀', name: 'Au-delà (150 %)', ok: totals.some((v) => v >= goal * 1.5) },
    { emoji: '🌊', name: '10 litres bus', ok: total >= 10000 },
    { emoji: '🐳', name: '50 litres bus', ok: total >= 50000 },
    { emoji: '📅', name: '30 jours suivis', ok: totals.filter((v) => v > 0).length >= 30 },
  ];
}

export default function History() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabSpace();
  const { log, settings, now } = useHydration();
  const goal = settings.goalMl;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now, i - 6);
    const ml = sumDay(log[dayKey(d)]);
    return { key: dayKey(d), d, ml, today: i === 6 };
  });
  const weekTotal = week.reduce((a, d) => a + d.ml, 0);
  const prevTotal = Array.from({ length: 7 }, (_, i) => sumDay(log[dayKey(addDays(now, i - 13))])).reduce((a, b) => a + b, 0);
  const delta = prevTotal ? Math.round(((weekTotal - prevTotal) / prevTotal) * 100) : null;
  const hit = week.filter((d) => d.ml >= goal).length;
  const current = streak(log, goal, now);
  const best = bestStreak(log, goal);
  const list = badges(log, goal);
  const unlocked = list.filter((b) => b.ok).length;

  // Calendrier : 5 semaines, lundi en premier.
  const monday = addDays(now, -((now.getDay() + 6) % 7) - 28);
  const cells = Array.from({ length: 35 }, (_, i) => addDays(monday, i));

  const heat = (ml, future) => {
    if (future) return 'transparent';
    if (!ml) return t.accentSoft;
    const p = ml / goal;
    if (p >= 1) return t.accent;
    if (p >= 0.6) return `${t.accent}99`;
    return `${t.accent}44`;
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: tabSpace + space.xl, paddingHorizontal: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Txt v="title" bold>
        Tes progrès
      </Txt>
      <Txt v="caption" color={t.textMuted} style={{ marginBottom: space.xl }}>
        Chaque goutte compte 💧
      </Txt>

      {/* Semaine : héros dégradé avec 7 mini-bulles */}
      <LinearGradient colors={t.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.weekCard}>
        <View style={styles.rowBetween}>
          <View>
            <Txt v="caption" color={WHITE_70}>
              Cette semaine
            </Txt>
            <Txt v="hero" bold color="#fff">
              {formatMl(weekTotal)}
            </Txt>
          </View>
          {delta !== null && (
            <View style={styles.deltaPill}>
              <Ionicons name={delta >= 0 ? 'trending-up' : 'trending-down'} size={16} color="#fff" />
              <Txt v="caption" bold color="#fff">
                {delta >= 0 ? '+' : ''}
                {delta} %
              </Txt>
            </View>
          )}
        </View>
        <View style={styles.weekRow}>
          {week.map((d) => {
            const p = Math.min(1, d.ml / goal);
            return (
              <View key={d.key} style={styles.weekCol} accessibilityLabel={`${d.d.toLocaleDateString('fr-FR', { weekday: 'long' })} : ${formatMl(d.ml)}`}>
                <View style={[styles.mini, d.today && styles.miniToday]}>
                  <View style={[styles.miniFill, { height: `${p * 100}%` }]} />
                  {p >= 1 && <Ionicons name="checkmark" size={16} color="#fff" style={styles.miniCheck} />}
                </View>
                <Txt v="caption" bold={d.today} color={d.today ? '#fff' : WHITE_70}>
                  {d.today ? 'Auj.' : d.d.toLocaleDateString('fr-FR', { weekday: 'narrow' }).toUpperCase()}
                </Txt>
              </View>
            );
          })}
        </View>
      </LinearGradient>

      {/* Les valeurs d'abord, les libellés ensuite */}
      <View style={styles.kpis}>
        <Kpi emoji="🔥" value={`${current}`} unit="j" label="série" />
        <Kpi emoji="🏅" value={`${best}`} unit="j" label="record" />
        <Kpi emoji="🎯" value={`${hit}`} unit="/7" label="objectifs" />
      </View>

      <View style={styles.gap} />
      <SectionTitle right={<Legend t={t} heat={heat} goal={goal} />}>5 dernières semaines</SectionTitle>
      <Card>
        <View style={styles.calHead}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => (
            <Txt key={i} v="caption" color={t.textMuted} style={styles.calCell}>
              {l}
            </Txt>
          ))}
        </View>
        <View style={styles.calGrid}>
          {cells.map((d) => {
            const future = d > now;
            const ml = sumDay(log[dayKey(d)]);
            const isToday = dayKey(d) === dayKey(now);
            return (
              <View key={dayKey(d)} style={styles.calCellWrap}>
                <View
                  style={[
                    styles.calDot,
                    { backgroundColor: heat(ml, future) },
                    isToday && { borderWidth: 2, borderColor: t.text },
                  ]}
                >
                  <Txt v="caption" bold color={ml >= goal * 0.6 && !future ? '#fff' : t.textMuted}>
                    {d.getDate()}
                  </Txt>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={styles.gap} />
      <SectionTitle right={<Txt v="caption" color={t.textMuted}>{unlocked}/{list.length}</Txt>}>Badges</SectionTitle>
      <View style={styles.badges}>
        {list.map((b) => (
          <Card key={b.name} style={[styles.badge, !b.ok && { opacity: 0.55 }]} strength={b.ok ? 1 : 0}>
            <View style={[styles.badgeIcon, { backgroundColor: b.ok ? t.accentSoft : t.border }]}>
              <Text style={[styles.badgeEmoji, !b.ok && styles.locked]}>{b.emoji}</Text>
              {!b.ok && (
                <View style={[styles.lock, { backgroundColor: t.card }]}>
                  <Ionicons name="lock-closed" size={12} color={t.textMuted} />
                </View>
              )}
            </View>
            <Txt v="caption" bold style={styles.center} numberOfLines={2}>
              {b.name}
            </Txt>
          </Card>
        ))}
      </View>

      <View style={styles.gap} />
      <SectionTitle>Pourquoi boire régulièrement ?</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.tips}>
        {TIPS.map((tip) => (
          <Card key={tip.title} style={styles.tip}>
            <View style={[styles.tipIcon, { backgroundColor: `${tip.tint}1F` }]}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            </View>
            <Txt v="body" bold>
              {tip.title}
            </Txt>
            <Txt v="caption" color={t.textMuted}>
              {tip.text}
            </Txt>
          </Card>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

function Kpi({ emoji, value, unit, label }) {
  const t = useTheme();
  return (
    <Card style={styles.kpi}>
      <Text style={styles.kpiEmoji}>{emoji}</Text>
      <Txt v="title" bold>
        {value}
        <Txt v="caption" bold color={t.textMuted}>
          {' '}
          {unit}
        </Txt>
      </Txt>
      <Txt v="caption" color={t.textMuted}>
        {label}
      </Txt>
    </Card>
  );
}

function Legend({ t, heat, goal }) {
  return (
    <View style={styles.legend}>
      <Txt v="caption" color={t.textMuted}>
        0
      </Txt>
      {[0, goal * 0.3, goal * 0.7, goal].map((v, i) => (
        <View key={i} style={[styles.legendDot, { backgroundColor: heat(v, false) }]} />
      ))}
      <Txt v="caption" color={t.textMuted}>
        100 %
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  center: { textAlign: 'center' },
  gap: { height: space.xxl },
  weekCard: { borderRadius: radius.xl, padding: space.xl, overflow: 'hidden' },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xl },
  weekCol: { alignItems: 'center', gap: space.sm },
  mini: {
    width: 36,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  miniToday: { borderWidth: 2, borderColor: '#fff' },
  miniFill: { width: '100%', backgroundColor: '#7FD0FF' },
  miniCheck: { position: 'absolute', top: 6 },
  kpis: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  kpi: { flex: 1, padding: space.lg, gap: 2 },
  kpiEmoji: { fontSize: 20, marginBottom: space.xs },
  legend: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendDot: { width: 12, height: 12, borderRadius: 4 },
  calHead: { flexDirection: 'row', marginBottom: space.sm },
  calCell: { flex: 1, textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  calDot: { flex: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  badge: { width: '31.5%', flexGrow: 1, padding: space.md, alignItems: 'center', gap: space.sm },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  badgeEmoji: { fontSize: 28 },
  locked: { opacity: 0.35 },
  lock: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bleed: { marginHorizontal: -space.lg },
  tips: { paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.sm },
  tip: { width: 200, padding: space.lg, gap: space.sm },
  tipIcon: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  tipEmoji: { fontSize: 22 },
});
