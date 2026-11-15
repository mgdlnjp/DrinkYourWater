import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHydration, dayKey, sumDay, streak } from '../store';
import { Card, SectionTitle, formatMl, useTheme } from '../components/ui';
import { radius, space, type } from '../theme';

const TIPS = [
  { emoji: '🧠', title: 'Concentration', text: 'Même une légère déshydratation fait baisser l’attention.' },
  { emoji: '🌡️', title: 'Température', text: 'L’eau aide ton corps à réguler sa chaleur.' },
  { emoji: '🍽️', title: 'Digestion', text: 'Bien hydraté, ton transit fonctionne mieux.' },
  { emoji: '⚡', title: 'Énergie', text: 'La fatigue de l’après-midi vient souvent d’un manque d’eau.' },
];

const CHART_H = 144;

export default function History() {
  const t = useTheme();
  const { log, settings, now } = useHydration();
  const goal = settings.goalMl;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ml = sumDay(log[dayKey(d)]);
    days.push({
      key: dayKey(d),
      label: i === 0 ? 'Auj.' : d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      ml,
      today: i === 0,
    });
  }
  const max = Math.max(goal, ...days.map((d) => d.ml));
  const tracked = days.filter((d) => d.ml > 0);
  const avg = tracked.length ? Math.round(tracked.reduce((a, d) => a + d.ml, 0) / tracked.length) : 0;
  const hit = days.filter((d) => d.ml >= goal).length;
  const current = streak(log, goal, now);
  const goalY = (goal / max) * CHART_H;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: t.text }]}>Tes progrès</Text>
      <Text style={[styles.caption, { color: t.textMuted, marginBottom: space.xl }]}>Les 7 derniers jours</Text>

      {/* Les valeurs d'abord, les libellés ensuite */}
      <View style={styles.kpis}>
        <Kpi value={`${current} j`} label="Série en cours" emoji="🔥" />
        <Kpi value={`${hit}/7`} label="Objectifs atteints" emoji="🎯" />
        <Kpi value={avg ? formatMl(avg) : '—'} label="Moyenne / jour" emoji="💧" />
      </View>

      <Card style={{ marginTop: space.lg }}>
        <SectionTitle right={<Text style={[styles.caption, { color: t.textMuted }]}>objectif {formatMl(goal)}</Text>}>
          Cette semaine
        </SectionTitle>
        <View style={[styles.chart, { height: CHART_H + 32 }]}>
          <View style={[styles.goalLine, { bottom: goalY + 24, borderColor: t.accent }]} />
          {days.map((d) => {
            const h = d.ml ? Math.max(8, (d.ml / max) * CHART_H) : 4;
            const reached = d.ml >= goal;
            return (
              <View key={d.key} style={styles.col} accessibilityLabel={`${d.label} : ${formatMl(d.ml)}`}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: h,
                      backgroundColor: reached ? t.accent : d.ml ? t.accentTrack : t.border,
                      opacity: d.today || reached ? 1 : 0.9,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.caption,
                    { color: d.today ? t.text : t.textMuted, fontWeight: d.today ? type.bold : type.regular, marginTop: space.sm },
                  ]}
                >
                  {d.label}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={{ marginTop: space.xxl }}>
        <SectionTitle>Pourquoi boire régulièrement ?</SectionTitle>
        <View style={styles.tips}>
          {TIPS.map((tip) => (
            <Card key={tip.title} style={styles.tip}>
              <View style={[styles.tipIcon, { backgroundColor: t.accentSoft }]}>
                <Text style={{ fontSize: 20 }}>{tip.emoji}</Text>
              </View>
              <Text style={[styles.body, { color: t.text, fontWeight: type.bold }]}>{tip.title}</Text>
              <Text style={[styles.caption, { color: t.textMuted }]}>{tip.text}</Text>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Kpi({ value, label, emoji }) {
  const t = useTheme();
  return (
    <Card style={styles.kpi}>
      <Text style={{ fontSize: type.body }}>{emoji}</Text>
      <Text style={[styles.kpiValue, { color: t.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.caption, { color: t.textMuted }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.xxxl },
  title: { fontSize: type.title, fontWeight: type.bold },
  body: { fontSize: type.body, lineHeight: 24 },
  caption: { fontSize: type.caption, lineHeight: 18 },
  kpis: { flexDirection: 'row', gap: space.sm },
  kpi: { flex: 1, padding: space.lg, gap: space.xs },
  kpiValue: { fontSize: type.title, fontWeight: type.bold, fontVariant: ['tabular-nums'] },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, marginTop: space.sm },
  goalLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', opacity: 0.5 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', maxWidth: 28, borderRadius: radius.sm },
  tips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tip: { width: '48.5%', flexGrow: 1, flexBasis: '45%', padding: space.lg, gap: space.sm },
  tipIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
